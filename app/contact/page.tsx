"use client";

import { useState } from "react";
import { Phone, Mail, MessageCircle, Clock, MapPin, Map as MapIcon } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/components/I18nProvider";
import { siteConfig } from "@/lib/config/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export default function ContactPage() {
  const { t, fmt } = useI18n();
  const toast = useToast();
  const { contact } = siteConfig;

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function validate(): boolean {
    const next: Errors = {};
    if (!form.name.trim()) next.name = t.validation.nameRequired;
    if (!EMAIL_RE.test(form.email.trim())) next.email = t.validation.email;
    if (!form.subject.trim()) next.subject = t.validation.subjectRequired;
    if (form.message.trim().length < 10) next.message = fmt(t.validation.messageTooShort, { count: 10 });
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("failed");
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast({ title: t.contact.successTitle, description: t.contact.successBody, variant: "success" });
    } catch {
      toast({ title: t.contact.errorBody, variant: "error" });
    } finally {
      setSending(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none transition focus:border-gold";

  const infoItems = [
    { icon: Phone, label: t.contact.phone, value: contact.phone, href: contact.phoneHref },
    { icon: Mail, label: t.contact.email, value: contact.email, href: `mailto:${contact.email}` },
    { icon: MessageCircle, label: t.contact.whatsapp, value: contact.whatsapp, href: contact.whatsappHref },
    { icon: Clock, label: t.contact.hours, value: contact.hours },
    { icon: MapPin, label: t.contact.address, value: contact.address },
  ];

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h1 className="font-display text-4xl text-papyrus md:text-5xl">{t.contact.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-dusty">{t.contact.subtitle}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: info */}
          <div className="space-y-6">
            <div className="papyrus-card p-6">
              <ul className="space-y-5">
                {infoItems.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-dusty">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel="noreferrer"
                          className="whitespace-pre-line text-papyrus transition hover:text-gold"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="whitespace-pre-line text-papyrus">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-gold-dim bg-gold/5 p-5 text-sm text-dusty">
              {t.contact.supportMessage}
            </div>

            {/* Map: real embed if configured, otherwise a styled placeholder */}
            <div className="papyrus-card overflow-hidden">
              {contact.mapEmbedUrl ? (
                <iframe
                  title={t.contact.address}
                  src={contact.mapEmbedUrl}
                  className="h-56 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <a
                  href={contact.mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-56 w-full flex-col items-center justify-center gap-2 bg-obsidian-softer/40 text-dusty transition hover:text-gold"
                >
                  <MapIcon className="h-8 w-8" aria-hidden />
                  <span className="px-6 text-center text-xs">{t.contact.mapPlaceholder}</span>
                </a>
              )}
            </div>
          </div>

          {/* Right: form */}
          <div className="papyrus-card p-8">
            <h2 className="font-display text-2xl text-gold">{t.contact.formTitle}</h2>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label className="block text-sm text-dusty">
                  {t.contact.name}
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t.contact.namePlaceholder}
                    aria-invalid={!!errors.name}
                    className={inputClass}
                  />
                </label>
                {errors.name && <p className="mt-1 text-xs text-fail">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm text-dusty">
                  {t.contact.email}
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t.contact.emailPlaceholder}
                    aria-invalid={!!errors.email}
                    className={inputClass}
                  />
                </label>
                {errors.email && <p className="mt-1 text-xs text-fail">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm text-dusty">
                  {t.contact.subject}
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder={t.contact.subjectPlaceholder}
                    aria-invalid={!!errors.subject}
                    className={inputClass}
                  />
                </label>
                {errors.subject && <p className="mt-1 text-xs text-fail">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm text-dusty">
                  {t.contact.message}
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={6}
                    placeholder={t.contact.messagePlaceholder}
                    aria-invalid={!!errors.message}
                    className={inputClass}
                  />
                </label>
                {errors.message && <p className="mt-1 text-xs text-fail">{errors.message}</p>}
              </div>

              <Button type="submit" loading={sending} fullWidth>
                {sending ? t.contact.sending : t.contact.send}
              </Button>

              {sent && (
                <p className="text-center text-sm text-gold" role="status">
                  {t.contact.successBody}
                </p>
              )}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
