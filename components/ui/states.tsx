"use client";

import { Loader2, type LucideIcon } from "lucide-react";
import clsx from "clsx";

/** Small inline spinner. */
export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return <Loader2 className={clsx("animate-spin text-gold", className)} aria-hidden />;
}

/** Centered loading block with an accessible label. */
export function LoadingBlock({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-dusty"
    >
      <Spinner className="h-6 w-6" />
      <span>{label}</span>
    </div>
  );
}

/** Shimmer placeholder for content that is loading. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx(
        "animate-pulse rounded-lg bg-obsidian-softer/70",
        className
      )}
    />
  );
}

/** Friendly empty state, optionally with an icon and an action slot. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-obsidian-line px-6 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
      )}
      <p className="font-display text-lg text-papyrus">{title}</p>
      {description && <p className="max-w-sm text-sm text-dusty">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Inline error surface with an optional retry action. */
export function ErrorState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={clsx(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-fail/50 bg-fail/5 px-6 py-10 text-center",
        className
      )}
    >
      <p className="font-display text-lg text-fail">{title}</p>
      {description && <p className="max-w-sm text-sm text-dusty">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
