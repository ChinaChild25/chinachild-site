import fs from "node:fs";
import path from "node:path";
import type { TeacherCertificate } from "@/lib/site-data";

/** Оставляет только сертификаты, для которых файл уже лежит в /public. */
export function resolveTeacherCertificates(
  certificates: TeacherCertificate[] | undefined,
): TeacherCertificate[] {
  if (!certificates?.length) return [];

  return certificates.filter((cert) => {
    const relative = cert.src.replace(/^\//, "");
    return fs.existsSync(path.join(process.cwd(), "public", relative));
  });
}
