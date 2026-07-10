"use client";

import { useRef, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";

export type AttachedImage = {
  id: string;
  name: string;
  mediaType: string;
  data: string; // base64, no data-URL prefix
  previewUrl: string;
};

const ACCEPT =
  "image/png,image/jpeg,image/webp,image/gif,.txt,.md,.pdf,.docx";

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => ("str" in it ? it.str : "")).join(" ") + "\n\n";
  }
  return text.trim();
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value.trim();
}

export function AttachmentButton({
  onImageAdd,
  onTextExtracted,
  disabled,
}: {
  onImageAdd: (image: AttachedImage) => void;
  onTextExtracted: (text: string, filename: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, fmt } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 15 * 1024 * 1024) {
          setError(fmt(t.attachment.tooLarge, { name: file.name }));
          continue;
        }

        if (file.type.startsWith("image/")) {
          const data = await fileToBase64(file);
          onImageAdd({
            id: `${file.name}-${Date.now()}`,
            name: file.name,
            mediaType: file.type,
            data,
            previewUrl: `data:${file.type};base64,${data}`,
          });
        } else if (file.name.endsWith(".pdf")) {
          const text = await extractPdfText(file);
          onTextExtracted(text, file.name);
        } else if (file.name.endsWith(".docx")) {
          const text = await extractDocxText(file);
          onTextExtracted(text, file.name);
        } else if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
          const text = await file.text();
          onTextExtracted(text, file.name);
        } else {
          setError(fmt(t.attachment.unsupported, { name: file.name }));
        }
      }
    } catch (err: any) {
      setError(err.message || t.attachment.readError);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative inline-flex flex-col">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        title={t.attachment.addFiles}
        aria-label={t.attachment.addFiles}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-dim text-gold transition hover:border-gold hover:bg-gold/10 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && (
        <p className="absolute top-11 z-10 w-56 rounded-lg border border-fail bg-obsidian-soft p-2 text-xs text-fail shadow-lg">
          {error}
        </p>
      )}
    </div>
  );
}

export function AttachmentThumbnails({
  images,
  onRemove,
}: {
  images: AttachedImage[];
  onRemove: (id: string) => void;
}) {
  const { t } = useI18n();
  if (images.length === 0) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {images.map((img) => (
        <div key={img.id} className="group relative h-14 w-14 overflow-hidden rounded-lg border border-obsidian-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.previewUrl} alt={img.name} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(img.id)}
            className="absolute inset-0 flex items-center justify-center bg-obsidian/70 text-xs text-papyrus opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            {t.common.remove}
          </button>
        </div>
      ))}
    </div>
  );
}
