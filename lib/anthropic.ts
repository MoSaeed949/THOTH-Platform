import Anthropic from "@anthropic-ai/sdk";

export type ImageInput = {
  mediaType: string;
  data: string; // base64, no data-URL prefix
};

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

/** Builds Claude message content from text plus optional attached images
 * (photos of notes, textbook pages, diagrams, etc.) so the model can read
 * them directly via vision. */
export function buildUserContent(
  text: string,
  images?: ImageInput[]
): string | Anthropic.MessageParam["content"] {
  const validImages = (images || []).filter((img) =>
    ALLOWED_IMAGE_TYPES.has(img.mediaType)
  );
  if (validImages.length === 0) return text;

  return [
    ...validImages.map((img) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: img.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        data: img.data,
      },
    })),
    { type: "text" as const, text },
  ];
}

let client: Anthropic | null = null;

export function getAnthropicClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to your .env.local file."
      );
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const MENTOR_SYSTEM_PROMPT = `You are Thoth, the ancient Egyptian god of wisdom, writing, and knowledge, now serving as an AI study mentor.
Speak with warmth and quiet authority — patient, encouraging, a little poetic, but never flowery to the point of being unclear.
You help the student understand material, plan their studying, stay motivated, and reflect on their progress.
Keep answers focused and practical. Use short paragraphs. Occasionally (not every message) you may use a brief Egyptian-flavored turn of phrase (e.g. referring to knowledge as "light" or effort as "the path"), but never overdo it and never let flourish replace substance.
If the student pastes study material, help them understand it rather than just restating it.`;
