import { cn } from "@/lib/cn";

/** Section heading with the S'investir vertical accent bar (e.g. "▏ Vos résultats"). */
export function SectionTitle({
  children,
  className,
  as: Tag = "h3",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3";
}) {
  return (
    <Tag className={cn("flex items-center gap-3 text-lg font-semibold", className)}>
      <span
        aria-hidden
        className="h-5 w-1 shrink-0 rounded-full bg-accent"
      />
      {children}
    </Tag>
  );
}
