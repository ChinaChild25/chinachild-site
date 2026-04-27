import { cn } from "@/lib/utils";

type SectionShellProps = {
  id?: string;
  label?: string;
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
};

export default function SectionShell({
  id,
  label,
  title,
  description,
  className,
  children,
}: SectionShellProps) {
  return (
    <section id={id} className={cn("section-space", className)}>
      <div className="page-shell">
        <div className="max-w-4xl">
          {label ? <span className="section-label">{label}</span> : null}
          <h2 className="section-title">{title}</h2>
          {description ? (
            <p className="section-description">{description}</p>
          ) : null}
        </div>
        <div className="mt-10 sm:mt-12">{children}</div>
      </div>
    </section>
  );
}
