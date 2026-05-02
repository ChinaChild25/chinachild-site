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
        "inline-flex items-center gap-1.5 rounded-[10px] bg-white px-2.5 py-1.5 text-xs font-medium tracking-[-0.005em] text-[#262626]",
        className,
      )}
    >
      {children}
    </span>
  );
}
