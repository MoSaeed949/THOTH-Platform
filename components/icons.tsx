import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

/** Ankh — used for streaks / "life" of a study habit */
export function AnkhIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} {...props}>
      <circle cx="24" cy="12" r="9" stroke="currentColor" strokeWidth="3.2" />
      <path d="M24 21V44" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M12 30H36" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

/** Eye of Horus (stylized) — used for focus / Pomodoro */
export function EyeOfHorusIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 64 40" fill="none" className={className} {...props}>
      <path
        d="M2 20C10 8 22 3 32 3C42 3 54 8 62 20C54 28 42 32 32 32C22 32 10 28 2 20Z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="20" r="7" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="32" cy="20" r="2.4" fill="currentColor" />
      <path d="M20 26L12 36" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M14 22L6 24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M50 6L56 -1" stroke="currentColor" strokeWidth="0" />
    </svg>
  );
}

/** Scarab (stylized) — used for progress / growth */
export function ScarabIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 40" fill="none" className={className} {...props}>
      <ellipse cx="24" cy="24" rx="12" ry="10" stroke="currentColor" strokeWidth="2.6" />
      <path d="M24 14V34" stroke="currentColor" strokeWidth="2" />
      <path d="M14 18C8 14 4 8 4 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M34 18C40 14 44 8 44 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M14 30C8 34 4 38 4 38" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M34 30C40 34 44 38 44 38" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="24" cy="12" r="4" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}

/** Winged sun-disc — used as a header ornament */
export function WingedSunIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 200 60" fill="none" className={className} {...props}>
      <circle cx="100" cy="30" r="14" stroke="currentColor" strokeWidth="2.4" />
      <path
        d="M86 30C60 30 40 14 10 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M86 36C60 44 40 46 10 40"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M114 30C140 30 160 14 190 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M114 36C140 44 160 46 190 40"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Ibis quill — Thoth's writing instrument, used as a small brand mark */
export function IbisQuillIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} {...props}>
      <path
        d="M6 34C6 34 14 20 26 12C30 9.5 34 6 34 6C34 6 31 10 28 14C20 25 12 33 12 33"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 34L12 33" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
