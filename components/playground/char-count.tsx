import { cn } from "@/lib/utils";

/** "27/30", with a text label when over the limit (never colour alone). */
export function CharCount({ count, limit, className }: { count: number; limit: number; className?: string }) {
  const over = count > limit;
  return (
    <span className={cn("font-mono text-[11px] tabular-nums", over ? "text-danger" : "text-muted-foreground", className)}>
      {count}/{limit}
      {over && <span className="ml-1.5 font-semibold uppercase tracking-wide">over limit</span>}
    </span>
  );
}
