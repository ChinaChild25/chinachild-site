export const SITE_NAME = "ChinaChild";
export const BRAND_NAME = "HSK+";
const DEFAULT_SITE_URL = "https://chinachild-site.vercel.app";

export const TRUST_PROFILE_LINKS = [
  {
    label: "VK",
    href: "https://vk.com/chinachild",
    logo: {
      onDark: "/brand/trust/VK%20Icon%3DColor.svg",
      onLight: "/brand/trust/VK%20Icon%3DBlack.svg",
      fallback: "/brand/trust/VK%20Icon%3DColor.svg",
      width: 100,
      height: 100,
    },
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCJC7nIRlwcf-Hwcqg1l83Zg",
    logo: {
      onDark: "/brand/trust/youtube-red-trimmed.svg",
      onLight: "/brand/trust/youtube-red-trimmed.svg",
      fallback: "/brand/trust/youtube-red-trimmed.svg",
      width: 529,
      height: 371,
    },
  },
  {
    label: "VC.ru",
    href: "https://vc.ru/id1581317/633597-shkola-kitaiskogo-yazyka-s-digital-vkusom",
    logo: {
      onDark: "/brand/trust/vc%20ru%20logo.svg",
      onLight: "/brand/trust/vc%20ru%20logo.svg",
      fallback: "/brand/trust/vc%20ru%20logo.svg",
      width: 30,
      height: 32,
      invertOnDark: true,
    },
  },
  {
    label: "EduTop",
    href: "https://edutop.pro/online-school/onlain-skola-kitaiskogo-yazyka-chinachild",
    logo: {
      onDark: "/brand/trust/edutop-mark.svg",
      onLight: "/brand/trust/edutop-mark.svg",
      fallback: "/brand/trust/edutop-mark.svg",
      width: 28,
      height: 20,
    },
  },
  {
    label: "Zoon",
    href: "https://zoon.ru/msk/trainings/onlajn-kursy_kitajskogo_yazyka_chinachild/",
    logo: {
      onDark: "/brand/trust/Zoon_logo.svg",
      onLight: "/brand/trust/Zoon_logo.svg",
      fallback: "/brand/trust/Zoon_logo.svg",
      width: 62,
      height: 16,
    },
  },
] as const;

export const SAME_AS_URLS = TRUST_PROFILE_LINKS.map((link) => link.href);

function normalizeOrigin(value: string | undefined): string {
  const origin = value?.trim() || DEFAULT_SITE_URL;
  return origin.replace(/\/+$/, "");
}

export const SITE_URL = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);

/** Когда вы зальёте промо-видео, заполните эти поля и в schema.ts
 *  автоматически появится VideoObject node со ссылками на Метрику. */
export const PROMO_VIDEO = {
  /** YouTube URL (https://youtu.be/...) или vk.com/video/... либо абсолютный URL .mp4 */
  contentUrl: "",
  /** Превью к видео — положите в /public/video/promo-poster.jpg (1280×720) */
  thumbnailUrl: "",
  /** ISO 8601 длительность, e.g. "PT2M30S" для 2 мин 30 сек */
  duration: "",
  /** ISO дата публикации */
  uploadDate: "",
  /** Заголовок и описание попадут в Google Video Search */
  name: "ChinaChild — онлайн-школа китайского языка",
  description:
    "Видеовизитка школы: как устроены занятия, кто преподаёт, как сдают HSK 1–2 после программы.",
};

export const SITE_DESCRIPTION =
  "Онлайн-школа китайского языка ChinaChild (HSK+). Лицензированная программа HSK 1-2 — мини-группы до 5 человек, индивидуальные занятия, доступ через личный кабинет.";
export const CONTACT_EMAIL = "info@chinachild.ru";
export const CONTACT_PHONE = "+7 (495) 005-25-82";
export const CONTACT_PHONE_TEL = "+74950052582";
export const PROMO_CODE = "КИТАПР26";
export const TAX_DEDUCTION_MAX = "до 15 600 ₽ в год";
export const LICENSE_REGION = "Департамент образования и науки города Москвы";
/** Творительный падеж — «выдана …» / «выданной …». */
export const LICENSE_REGION_INSTRUMENTAL =
  "Департаментом образования и науки города Москвы";
export const LICENSE_PROGRAM = "HSK 1-2";

/** Полные реквизиты лицензии (выписка из реестра).
 *  Используются на /license, в футере и в JSON-LD Organization. */
export const LICENSE_DETAILS = {
  registrationNumber: "Л035-01298-77/04021301",
  outgoingNumber: "Исх/Л-10272/25",
  issueDate: "2025-12-18",
  issuer: "Департамент образования и науки города Москвы",
  issuerAddress: "129090, Москва, Большая Спасская, д. 15, стр. 1",
  issuerPhone: "+7 (499) 369-7332",
  issuerFax: "+7 (495) 366-9761",
  issuerOgrn: "1027700386625",
  issuerInn: "7719028495",
  issuerKpp: "770801001",
  issuerOkpo: "02110342",
} as const;

/** Реквизиты лицензиата (ИП). Используются на /license и в Organization. */
export const LICENSEE = {
  legalName: "Индивидуальный предприниматель Толкачева Ирина Владимировна",
  shortName: "ИП Толкачева И. В.",
  fullName: "Толкачева Ирина Владимировна",
  inn: "323101941586",
  ogrnip: "323774600710570",
  registrationDate: "2023-10-30",
  address: "108834, г. Москва, ул. Эдварда Грига, д. 18, к. 3, кв. 84",
} as const;

// IndexNow — both Yandex and Bing accept this protocol for instant indexing.
// File at /{INDEXNOW_KEY}.txt must contain the same key. Override via env if needed.
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY ?? "e7c1a4d8b9f3469c2a85e6f4d2b9a3c1";

export function absoluteUrl(path: string): string {
  if (!path || path === "/") {
    return SITE_URL;
  }

  try {
    const url = new URL(path);
    if (url.hostname === "chinachild.ru" || url.hostname === "www.chinachild.ru") {
      return `${SITE_URL}${url.pathname}${url.search}${url.hash}`;
    }
    return path;
  } catch {
    // Relative path: resolve against the current public site origin.
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
