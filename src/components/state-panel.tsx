import type { ReactNode } from "react";

interface StatePanelProps {
  title: string;
  description: string;
  tone?: "default" | "error" | "warning" | "success";
  children?: ReactNode;
}

const toneTitle: Record<NonNullable<StatePanelProps["tone"]>, string> = {
  default: "text-[var(--fg)]",
  error: "text-[var(--state-error)]",
  warning: "text-[var(--state-warning)]",
  success: "text-[var(--state-success)]",
};

export function StatePanel({ title, description, tone = "default", children }: StatePanelProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
      <h3 className={`text-lg font-semibold uppercase tracking-wide ${toneTitle[tone]}`}>
        {title}
      </h3>
      <p className="mt-2 max-w-xs text-sm text-[var(--sheet-muted)]">{description}</p>
      {children}
    </div>
  );
}
