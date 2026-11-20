"use client";

import RouteError from "./error";

export default function GlobalError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="ru"><body><RouteError {...props} /></body></html>;
}
