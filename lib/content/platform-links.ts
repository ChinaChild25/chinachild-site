// Helpers that build deep-links into the authenticated platform.
// NEXT_PUBLIC_APP_URL points at the platform host (eg. https://my.chinachild.ru).
// In development it can be unset — links then fall back to relative paths and
// open within the public site (this is fine for CI/preview, real production
// deployments should set NEXT_PUBLIC_APP_URL).

const DEFAULT_APP_URL = "https://my.chinachild.ru";

export function platformBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;
}

function appLink(path: string): string {
  const base = platformBaseUrl().replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const platformLinks = {
  grammarArticle: (slug: string) => appLink(`/grammar/${slug}`),
  vocabularyTrain: () => appLink("/vocabulary/train"),
  vocabularyWord: (slug: string) => appLink(`/vocabulary/word/${slug}`),
  vocabularyHskLevel: (versionSlug: string, level: string) =>
    appLink(`/vocabulary/hsk/${versionSlug}/${level}`),
  signup: () => appLink("/auth/sign-up"),
};
