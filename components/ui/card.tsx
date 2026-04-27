import { cn } from "@/lib/utils";

export default function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card-block card-cream-soft h-full", className)}>
      {children}
    </div>
  );
}
