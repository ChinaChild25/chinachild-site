import Image from "next/image";
import type { TeacherCertificate } from "@/lib/site-data";

const DEFAULT_SIZE = { width: 800, height: 1132 };

type CertificateGalleryProps = {
  items: TeacherCertificate[];
};

export default function CertificateGallery({ items }: CertificateGalleryProps) {
  if (items.length === 0) return null;

  return (
    <div className={`grid gap-3 ${items.length > 1 ? "sm:grid-cols-2" : "max-w-md"}`}>
      {items.map((item) => (
        <figure key={item.src} className="card-block bg-white p-3 sm:p-4">
          <Image
            src={item.src}
            alt={item.alt}
            title={item.title ?? item.name}
            width={item.width ?? DEFAULT_SIZE.width}
            height={item.height ?? DEFAULT_SIZE.height}
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
            className="h-auto w-full rounded-[12px] object-contain"
          />
          {item.caption ? (
            <figcaption className="mt-3 text-xs leading-[1.5] text-[#6b6b6b]">
              {item.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
