import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, buildUserContent, type ImageInput } from "@/lib/anthropic";

// Claude generation can take longer than the platform's default serverless
// timeout (~10s), which would kill the function and return an empty body the
// client can't parse as JSON. Give it room to finish.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { title, sourceText, images } = (await request.json()) as {
      title?: string;
      sourceText?: string;
      images?: ImageInput[];
    };

    const hasImages = Array.isArray(images) && images.length > 0;
    const text = sourceText || "";

    if (!hasImages && text.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide at least a short paragraph of study material, or attach a file/image, to summarize." },
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
      max_tokens: 1200,
      system:
        "You produce clear, well-structured study summaries for students. Use short headings and bullet points. Keep it faithful to the source material — do not invent facts. If images are attached (photos of notes, textbook pages, slides), read them carefully and incorporate everything relevant. Output plain markdown, no preamble.",
      messages: [
        {
          role: "user",
          content: buildUserContent(
            `Summarize the following study material into a clear, well-organized study summary with headings and bullet points:\n\n${text}`,
            images
          ),
        },
      ],
    });

    const summaryText = response.content
      .filter((b): b is Anthropic_TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const { data, error } = await supabase
      .from("summaries")
      .insert({
        user_id: user.id,
        title: title?.trim() || "Untitled summary",
        source_text: text || "(from attached image)",
        summary_text: summaryText,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ summary: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Something went wrong generating the summary." },
      { status: 500 }
    );
  }
}

// Minimal local type alias to keep this file self-contained
type Anthropic_TextBlock = { type: "text"; text: string };
