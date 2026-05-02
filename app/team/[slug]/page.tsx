import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Avatar from "@/components/ui/Avatar";
import { buildMetadata } from "@/lib/metadata";
import {
  createBreadcrumbNode,
  createTeacherNode,
  type JsonLd as JsonLdType,
} from "@/lib/schema";
import { absoluteUrl, SITE_URL } from "@/lib/site-config";
import { teachers } from "@/lib/site-data";

type TeamMemberPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return teachers.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: TeamMemberPageProps): Promise<Metadata> {
  const { slug } = await params;
  const teacher = teachers.find((t) => t.slug === slug);
  if (!teacher) {
    return buildMetadata({
      title: "Преподаватель не найден | ChinaChild",
      description: "Запрошенный профиль преподавателя не найден.",
      path: `/team/${slug}`,
    });
  }
  return buildMetadata({
    title: `${teacher.name} — преподаватель ChinaChild | ${teacher.jobTitle ?? teacher.specialization}`,
    description: teacher.bio ?? teacher.credentials,
    path: `/team/${teacher.slug}`,
    keywords: [
      teacher.name.toLowerCase(),
      "преподаватель китайского",
      ...(teacher.knowsAbout ?? []).slice(0, 4),
    ],
  });
}

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { slug } = await params;
  const teacher = teachers.find((t) => t.slug === slug);
  if (!teacher) notFound();

  const url = absoluteUrl(`/team/${teacher.slug}`);
  const profilePageId = `${url}#profile`;

  // ProfilePage + the linked Person node + breadcrumbs.
  const graph: JsonLdType = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": profilePageId,
        url,
        name: `${teacher.name} — преподаватель ChinaChild`,
        description: teacher.bio ?? teacher.credentials,
        inLanguage: "ru-RU",
        isPartOf: { "@id": `${SITE_URL}#website` },
        mainEntity: createTeacherNode(teacher),
      },
      {
        ...createBreadcrumbNode([
          { name: "Главная", path: "/" },
          { name: "Команда", path: "/team" },
          { name: teacher.name, path: `/team/${teacher.slug}` },
        ]),
        "@id": `${profilePageId}#breadcrumb`,
      },
    ],
  };

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Команда", path: "/team" },
          { name: teacher.name, path: `/team/${teacher.slug}` },
        ]}
      />
      <JsonLd data={graph} id={`team-${teacher.slug}-graph`} />

      <article
        className="page-shell section-space pt-10"
        itemScope
        itemType="https://schema.org/Person"
      >
        <header className="mx-auto max-w-3xl">
          <div className="flex items-center gap-4">
            <Avatar
              name={teacher.name}
              size={120}
              src={teacher.image}
              alt={teacher.imageAlt}
              title={teacher.imageTitle}
            />
            <div>
              <span className="tag-pill">Преподаватель</span>
            </div>
          </div>
          <h1
            className="mt-6 text-[2.25rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#262626] sm:text-[3rem]"
            itemProp="name"
          >
            {teacher.name}
          </h1>
          <p className="mt-3 text-lg text-[#6b6b6b]" itemProp="jobTitle">
            {teacher.jobTitle ?? teacher.specialization}
          </p>
        </header>

        <div className="prose-article mx-auto mt-10 max-w-3xl">
          <p itemProp="description">{teacher.bio ?? teacher.credentials}</p>
          {teacher.alumniOf ? (
            <p>
              <strong>Образование.</strong>{" "}
              <span itemProp="alumniOf">{teacher.alumniOf}</span>
            </p>
          ) : null}
          {teacher.knowsAbout && teacher.knowsAbout.length > 0 ? (
            <>
              <h2>Специализация</h2>
              <ul>
                {teacher.knowsAbout.map((topic) => (
                  <li key={topic} itemProp="knowsAbout">
                    {topic}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {teacher.sameAs && teacher.sameAs.length > 0 ? (
            <>
              <h2>Профили</h2>
              <ul>
                {teacher.sameAs.map((href) => (
                  <li key={href}>
                    <a
                      href={href}
                      target="_blank"
                      rel="me noreferrer"
                      itemProp="sameAs"
                      className="font-semibold underline underline-offset-4"
                    >
                      {href.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <aside className="page-shell-wide mt-20 sm:mt-24">
          <div className="card-block card-block-lg card-cream">
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#262626] sm:text-[1.75rem]">
              Записаться к {teacher.firstNameDative}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-[1.6] text-[#4b4b4b] sm:text-[1.0625rem]">
              Расписание и набор групп уточняет менеджер. Оставьте заявку или
              позвоните нам — подберём ближайшее окно.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/zayavka" className="btn-pill btn-ink btn-pill-large">
                Оставить заявку
              </Link>
              <Link href="/courses" className="btn-pill btn-white btn-pill-large">
                Все курсы
              </Link>
            </div>
          </div>
        </aside>
      </article>
    </main>
  );
}
