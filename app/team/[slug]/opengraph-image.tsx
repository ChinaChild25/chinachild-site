import { renderGenericOg } from "@/lib/og-templates";
import { teachers } from "@/lib/site-data";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Преподаватель ChinaChild";

export function generateStaticParams() {
  return teachers.map((teacher) => ({ slug: teacher.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export default async function TeacherOgImage({ params }: Params) {
  const { slug } = await params;
  const teacher = teachers.find((item) => item.slug === slug);

  return renderGenericOg({
    badge: "Преподаватель",
    title: teacher?.displayName ?? teacher?.name ?? "Команда ChinaChild",
    subtitle: teacher
      ? `${teacher.specialization} · ${teacher.experience}`
      : "Методисты и носители китайского языка",
    footer: "chinachild.ru / team",
    background: "#fff3dc",
    accentColor: "#a15b13",
  });
}
