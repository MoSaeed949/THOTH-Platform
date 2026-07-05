import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, buildUserContent, MENTOR_SYSTEM_PROMPT, type ImageInput } from "@/lib/anthropic";

export async function POST(request: Request) {
  try {
    const { message, images } = (await request.json()) as {
      message?: string;
      images?: ImageInput[];
    };

    const hasImages = Array.isArray(images) && images.length > 0;

    if ((!message || !message.trim()) && !hasImages) {
      return NextResponse.json({ error: "Message is empty." }, { status: 400 });
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    // Load recent history for context (last 20 messages)
    const { data: history } = await supabase
      .from("mentor_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(20);

    const displayMessage =
      message?.trim() || (hasImages ? "[shared an image]" : "");

    await supabase.from("mentor_messages").insert({
      user_id: user.id,
      role: "user",
      content: displayMessage,
    });

    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: MENTOR_SYSTEM_PROMPT,
      messages: [
        ...(history || []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content as string,
        })),
        {
          role: "user",
          content: buildUserContent(message?.trim() || "Please look at the attached image.", images),
        },
      ],
    });

    const reply = response.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    await supabase.from("mentor_messages").insert({
      user_id: user.id,
      role: "assistant",
      content: reply,
    });

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Thoth could not be reached. Please try again." },
      { status: 500 }
    );
  }
}
