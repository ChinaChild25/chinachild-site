import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { createBreadcrumbSchema, type BreadcrumbItem } from "@/lib/schema";

export default function Breadcrumbs({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  return (
    <>
      {/* Visible breadcrumbs + schema help both users and crawlers understand hierarchy. */}
      <JsonLd data={createBreadcrumbSchema(items)} />
      <nav
        aria-label="Хлебные крошки"
        className="page-shell pt-6 text-sm text-[#6B7280]"
      >
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={item.path} className="flex items-center gap-2">
                {isLast ? (
                  <span aria-current="page" className="font-medium text-[#1A1A2E]">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="hover:text-[#1A1A2E]">
                    {item.name}
                  </Link>
                )}
                {!isLast ? <span>/</span> : null}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
