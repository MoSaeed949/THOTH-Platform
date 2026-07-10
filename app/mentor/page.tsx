"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Send } from "lucide-react";
import { AttachmentButton, AttachmentThumbnails, type AttachedImage } from "@/components/AttachmentButton";
import { useI18n } from "@/components/I18nProvider";

type Message = { role: "user" | "assistant"; content: string; imagePreviews?: string[] };

export default function MentorPage() {
  const supabase = createClient();
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("mentor_messages")
        .select("role, content")
        .order("created_at", { ascending: true });
      setMessages(data || []);
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    if ((!input.trim() && images.length === 0) || sending) return;
    const userMessage = input;
    const attachedImages = images;
    setInput("");
    setImages([]);
    setMessages((m) => [
      ...m,
      {
        role: "user",
        content: userMessage || t.mentor.sharedImage,
        imagePreviews: attachedImages.map((i) => i.previewUrl),
      },
    ]);
    setSending(true);
    try {
      const res = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          images: attachedImages.map(({ mediaType, data }) => ({ mediaType, data })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.mentor.errorRespond);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${err.message}` }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell>
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-gold">
          <Image src="/images/thoth-hero.png" alt={t.mentor.thothAlt} fill className="object-cover" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-papyrus">{t.mentor.title}</h1>
          <p className="text-sm text-dusty">{t.mentor.subtitle}</p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="papyrus-card mt-6 flex h-[55vh] flex-col gap-4 overflow-y-auto p-6"
      >
        {messages.length === 0 && (
          <p className="text-sm text-dusty">
            {t.mentor.emptyPrompt}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "user"
                ? "ml-auto bg-gold/15 text-papyrus"
                : "mr-auto border border-obsidian-line bg-obsidian text-papyrus"
            }`}
          >
            {m.imagePreviews && m.imagePreviews.length > 0 && (
              <div className="mb-2 flex gap-2">
                {m.imagePreviews.map((src, j) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={j} src={src} alt={t.mentor.attachmentAlt} className="h-16 w-16 rounded-lg object-cover" />
                ))}
              </div>
            )}
            {m.content}
          </div>
        ))}
        {sending && <p className="text-xs text-dusty">{t.mentor.considering}</p>}
      </div>

      <div className="mt-4">
        <AttachmentThumbnails images={images} onRemove={(id) => setImages((imgs) => imgs.filter((i) => i.id !== id))} />
        <div className="flex gap-2">
          <AttachmentButton
            onImageAdd={(img) => setImages((imgs) => [...imgs, img])}
            onTextExtracted={(text) => setInput((prev) => (prev ? `${prev}\n\n${text}` : text))}
          />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={t.mentor.askPlaceholder}
            className="flex-1 rounded-full border border-obsidian-line bg-obsidian-soft px-5 py-3 text-papyrus outline-none focus:border-gold"
          />
          <button
            onClick={send}
            disabled={sending}
            className="flex items-center justify-center rounded-full bg-gold px-5 text-ink hover:bg-gold-soft disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
