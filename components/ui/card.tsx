import { cn } from "@/lib/utils";

export default function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#eee] p-6 bg-white hover:shadow-md transition",
        className
      )}
    >
      {children}
    </div>
  );
}
