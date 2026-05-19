import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import CertificateGallery from "@/components/content/CertificateGallery";
import Avatar from "@/components/ui/Avatar";
import Reveal from "@/components/ui/Reveal";
import { buildMetadata } from "@/lib/metadata";
import { resolveTeacherCertificates } from "@/lib/team-certificates";
import {
  createBreadcrumbNode,
  createTeacherNode,
  type JsonLd as JsonLdType,
} from "@/lib/schema";
import { absoluteUrl, SITE_URL } from "@/lib/site-config";
import { teachers, type Teacher } from "@/lib/site-data";

type TeamMemberPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return teachers.map((t) => ({ slug: t.slug }));
}

function teacherName(teacher: Teacher) {
  return teacher.displayName ?? teacher.name;
}

function teacherDescription(teacher: Teacher) {
  return teacher.profileArticle?.join(" ") ?? teacher.bio ?? teacher.credentials;
}

function truncateDescription(value: string, maxLength = 155) {
  if (value.length <= maxLength) return value;
  const trimmed = value.slice(0, maxLength + 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, lastSpace > 100 ? lastSpace : maxLength).trim()}...`;
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

  const name = teacherName(teacher);
  return buildMetadata({
    title: `${name} — преподаватель ChinaChild | ${teacher.subject ?? teacher.jobTitle ?? teacher.specialization}`,
    description: truncateDescription(teacherDescription(teacher)),
    path: `/team/${teacher.slug}`,
    keywords: [
      name.toLowerCase(),
      "преподаватель китайского",
      "китайский язык онлайн",
      ...(teacher.knowsAbout ?? []).slice(0, 4),
    ],
  });
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-base leading-[1.6] text-[#4b4b4b]">
          <span className="mt-[0.15rem] inline-grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--background-2)] text-sm font-semibold text-[#262626]">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { slug } = await params;
  const teacher = teachers.find((t) => t.slug === slug);
  if (!teacher) notFound();

  const name = teacherName(teacher);
  const url = absoluteUrl(`/team/${teacher.slug}`);
  const profilePageId = `${url}#profile`;
  const article = teacher.profileArticle ?? [teacher.bio ?? teacher.credentials];
  const visibleCertificates = resolveTeacherCertificates(teacher.certificates);
  const graph: JsonLdType = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": profilePageId,
        url,
        name: `${name} — преподаватель ChinaChild`,
        description: teacherDescription(teacher),
        inLanguage: "ru-RU",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: createTeacherNode(teacher, { certificates: visibleCertificates }),
      },
      {
        ...createBreadcrumbNode([
          { name: "Главная", path: "/" },
          { name: "Команда", path: "/team" },
          { name, path: `/team/${teacher.slug}` },
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
          { name, path: `/team/${teacher.slug}` },
        ]}
      />
      <JsonLd data={graph} id={`team-${teacher.slug}-graph`} />

      <article itemScope itemType="https://schema.org/Person">
        <section className="page-shell-wide py-8 pt-10 md:py-10">
          <div className="card-block card-block-lg card-violet-soft">
            <div className="grid gap-8 lg:grid-cols-[0.55fr_1.45fr] lg:items-center">
              <div>
                <Avatar
                  name={name}
                  size={220}
                  src={teacher.image}
                  alt={teacher.imageAlt}
                  title={teacher.imageTitle}
                />
              </div>
              <div>
                <span className="tag-pill">Профиль преподавателя</span>
                <h1
                  className="mt-5 text-[2.25rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#262626] sm:text-[3rem]"
                  itemProp="name"
                >
                  {name}
                </h1>
                <p className="mt-4 text-lg leading-[1.45] text-[#4b4b4b]" itemProp="jobTitle">
                  {teacher.jobTitle ?? teacher.specialization}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="tag-pill">{teacher.experience}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell-wide py-8 md:py-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <div className="max-w-4xl">
                <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
                  О преподавателе
                </h2>
                <div className="mt-6 grid gap-4 text-base leading-[1.75] text-[#4b4b4b]">
                  {article.map((paragraph) => (
                    <p key={paragraph} itemProp="description">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal>
              <aside className="card-block card-sky h-full">
                <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#262626]">
                  Образование
                </h2>
                {teacher.educationTimeline && teacher.educationTimeline.length > 0 ? (
                  <ol className="mt-6 grid gap-4">
                    {teacher.educationTimeline.map((item) => (
                      <li key={item} className="rounded-[14px] bg-white/70 p-4">
                        <span className="text-sm leading-[1.55] text-[#262626]" itemProp="alumniOf">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-4 text-base leading-[1.6] text-[#4b4b4b]">
                    {teacher.alumniOf}
                  </p>
                )}
              </aside>
            </Reveal>
          </div>
        </section>

        {teacher.worksWith && teacher.worksWith.length > 0 ? (
          <section className="page-shell-wide py-8 md:py-10">
            <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
              С кем работает
            </h2>
            <CheckList items={teacher.worksWith} />
          </section>
        ) : null}

        {teacher.knowsAbout && teacher.knowsAbout.length > 0 ? (
          <section className="page-shell-wide py-8 md:py-10">
            <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
              Специализация
            </h2>
            <ul className="mt-6 flex flex-wrap gap-3">
              {teacher.knowsAbout.map((topic) => (
                <li key={topic} itemProp="knowsAbout" className="tag-pill">
                  {topic}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {visibleCertificates.length > 0 ? (
          <section className="page-shell-wide py-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
              <Reveal>
                <div>
                  <span className="tag-pill">Документы</span>
                  <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
                    Документы и сертификаты
                  </h2>
                  <p className="mt-4 max-w-md text-base leading-[1.6] text-[#4b4b4b]">
                    Сканы дипломов и международных сертификатов HSK — для прозрачности
                    квалификации преподавателя.
                  </p>
                </div>
              </Reveal>
              <Reveal>
                <CertificateGallery items={visibleCertificates} />
              </Reveal>
            </div>
          </section>
        ) : null}
      </article>

      <section className="page-shell-wide pb-16 pt-8 lg:pb-20">
        <div className="card-block card-block-lg card-ink">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
            Записаться к {teacher.firstNameDative}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
            Расписание и набор групп уточняет менеджер. Оставьте заявку — подберём
            формат, уровень и ближайшее окно для пробного занятия.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/zayavka" className="btn-pill btn-white btn-pill-large">
              Оставить заявку
            </Link>
            <Link
              href="/courses"
              className="btn-pill btn-pill-large bg-white/15 text-white hover:bg-white/25"
            >
              Все курсы
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
