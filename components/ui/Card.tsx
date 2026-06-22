import { cn } from "@/lib/cn";

export function Card({
  className,
  tinted,
  children,
}: {
  className?: string;
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border p-5 sm:p-6",
        tinted
          ? "border-accent/20 bg-surface-tint"
          : "border-line-faint bg-surface-raised",
        className,
      )}
    >
      {children}
    </div>
  );
}
