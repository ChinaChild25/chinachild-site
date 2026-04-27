import { cn } from "@/lib/utils";

type SectionShellProps = {
  id?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
  children: React.ReactNode;
};

export default function SectionShell({
  id,
  title,
  description,
  align = "center",
  className,
  children,
}: SectionShellProps) {
  return (
    <section id={id} className={cn("section-space", className)}>
      <div className="page-shell">
        <div
          className={cn(
            align === "center" ? "section-head-center mx-auto max-w-3xl" : "max-w-3xl",
          )}
        >
          <h2 className="section-title">{title}</h2>
          {description ? <p className="section-description">{description}</p> : null}
        </div>
        <div className="mt-10 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}
