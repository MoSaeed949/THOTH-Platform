import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, buildUserContent, type ImageInput } from "@/lib/anthropic";

// Claude generation can take longer than the platform's default serverless
// timeout (~10s), which would kill the function and return an empty body the
// client can't parse as JSON. Give it room to finish.
export const runtime = "nodejs";
export const maxDuration = 60;

type QuizQuestion = {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export async function POST(request: Request) {
  try {
    const { title, sourceText, summaryId, numQuestions = 5, images } = (await request.json()) as {
      title?: string;
      sourceText?: string;
      summaryId?: string;
      numQuestions?: number;
      images?: ImageInput[];
    };

    const hasImages = Array.isArray(images) && images.length > 0;
    const text = sourceText || "";

    if (!hasImages && text.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide study material, or attach a file/image, to generate a quiz from." },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: `You write multiple-choice quiz questions to test understanding of study material. If images are attached (photos of notes, textbook pages, slides), read them carefully and base questions on them too.
Respond with ONLY a JSON array (no markdown fences, no preamble, no explanation outside the JSON) of exactly ${Math.min(
        Math.max(Number(numQuestions) || 5, 1),
        15
      )} objects, each shaped exactly like:
{"question": string, "options": [string, string, string, string], "correct_index": number (0-3), "explanation": string}
Base every question strictly on the provided material.`,
      messages: [
        {
          role: "user",
          content: buildUserContent(`Study material:\n\n${text}`, images),
        },
      ],
    });

    const raw = response.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    let questions: QuizQuestion[];
    try {
      const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      questions = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "The mentor's quiz came back in an unexpected format. Please try again." },
        { status: 502 }
      );
    }

    const { data, error } = await supabase
      .from("quizzes")
      .insert({
        user_id: user.id,
        summary_id: summaryId || null,
        title: title?.trim() || "Untitled quiz",
        questions,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ quiz: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Something went wrong generating the quiz." },
      { status: 500 }
    );
  }
}
