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
        "surface-card h-full p-6 sm:p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}
