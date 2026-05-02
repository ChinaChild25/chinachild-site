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
      <JsonLd data={createBreadcrumbSchema(items)} />
      <nav
        aria-label="Хлебные крошки"
        className="page-shell-wide pt-8 text-sm text-[#6b6b6b]"
      >
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={item.path} className="flex items-center gap-2">
                {isLast ? (
                  <span aria-current="page" className="font-medium text-[#262626]">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="transition hover:text-[#262626]">
                    {item.name}
                  </Link>
                )}
                {!isLast ? <span className="text-[#bdbdbd]">/</span> : null}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
