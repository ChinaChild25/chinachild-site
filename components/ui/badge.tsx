import { cn } from "@/lib/utils";

export default function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.08em]",
        "bg-[#FFE03D] text-[#1A1A2E]",
        className,
      )}
    >
      {children}
    </span>
  );
}
