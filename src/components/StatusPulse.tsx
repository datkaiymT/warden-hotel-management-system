import { cn } from "@/lib/utils";

export function StatusPulse({
  label, active = true, tone = "primary", className,
}: { label: string; active?: boolean; tone?: "primary" | "safe" | "warning" | "critical"; className?: string }) {
  const toneMap = {
    primary: "bg-primary",
    safe: "bg-safe",
    warning: "bg-warning",
    critical: "bg-critical",
  } as const;
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 glass text-xs font-medium tracking-tight", className)}>
      <span className="relative inline-flex h-2 w-2">
        {active && <span className={cn("absolute inset-0 rounded-full opacity-60 animate-pulse-ring", toneMap[tone])} />}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", active ? toneMap[tone] : "bg-muted")} />
      </span>
      <span className="text-foreground/90">{label}</span>
    </div>
  );
}
