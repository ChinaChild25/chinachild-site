import type { JsonLd } from "@/lib/schema";

export default function JsonLd({
  data,
  id,
}: {
  data: JsonLd | JsonLd[];
  id?: string;
}) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
