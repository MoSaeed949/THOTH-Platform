import { Loader2 } from "lucide-react";

// Route-transition fallback. Locale-agnostic (no text) so it renders instantly
// without depending on any provider.
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading">
      <Loader2 className="h-8 w-8 animate-spin text-gold" aria-hidden />
    </div>
  );
}
