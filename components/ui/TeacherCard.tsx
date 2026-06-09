import Image from "next/image";
import Link from "next/link";
import type { Teacher } from "@/lib/site-data";
import { teacherToneClass } from "@/lib/teacher-tone";

// Единая карточка преподавателя — используется и на главной, и в разделе
// «Команда», чтобы вид был одинаковый. Фото прозрачное, фон рисует CSS-тон.
export default function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <Link
      href={`/team/${teacher.slug}`}
      className="card-block teacher-card group flex flex-col transition hover:-translate-y-1"
    >
      <div className={`teacher-card-photo ${teacherToneClass(teacher.slug)}`}>
        <Image
          src={teacher.image}
          alt={teacher.imageAlt ?? teacher.name}
          title={teacher.imageTitle}
          fill
          sizes="(min-width: 1180px) 340px, (min-width: 768px) 44vw, 86vw"
          className="object-cover"
        />
        <span className="teacher-card-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-hover:rotate-90"
          >
            <path d="M4 20 20 4" />
            <path d="M9 4h11v11" />
          </svg>
        </span>
      </div>
      <div className="teacher-card-body flex flex-1 flex-col">
        <h3 className="text-[1.25rem] font-medium leading-[1.2] tracking-[-0.01em] text-[var(--foreground)]">
          {teacher.displayName ?? teacher.name}
        </h3>
        <p className="mt-1.5 text-sm font-medium text-[var(--muted)]">
          {teacher.experience}
        </p>
        <p className="mt-3 text-sm leading-[1.55] text-[var(--muted-strong)] line-clamp-5 md:line-clamp-7">
          {teacher.bio ?? teacher.credentials}
        </p>
      </div>
    </Link>
  );
}
