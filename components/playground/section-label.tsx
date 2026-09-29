import { cn } from "@/lib/utils";

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase", className)}>
      {children}
    </p>
  );
}
