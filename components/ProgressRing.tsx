"use client";

export function ProgressRing({
  progress, // 0 to 1
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = circumference * (1 - clamped);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="ring-progress">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          style={{ stroke: "rgb(var(--c-obsidian-line))" }}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            stroke: "rgb(var(--c-gold))",
            transition: "stroke-dashoffset 0.4s ease",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {label && <span className="font-display text-xl text-papyrus">{label}</span>}
        {sublabel && <span className="text-xs text-dusty">{sublabel}</span>}
      </div>
    </div>
  );
}
