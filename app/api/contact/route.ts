import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = (await request.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    // Server-side validation (never trust the client).
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim();
    const cleanSubject = (subject || "").trim();
    const cleanMessage = (message || "").trim();

    if (!cleanName || !EMAIL_RE.test(cleanEmail) || !cleanSubject || cleanMessage.length < 10) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const supabase = createClient();
    // Attach the sender's user id when signed in (nullable for guests).
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("contact_messages").insert({
      user_id: user?.id ?? null,
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    });

    if (error) throw error;

    // NOTE (production): also dispatch an email/Slack notification to the
    // support inbox here (e.g. Resend, Postmark, SendGrid). Left as a DB record
    // for now so the flow works end-to-end without extra secrets.
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "server_error" }, { status: 500 });
  }
}
