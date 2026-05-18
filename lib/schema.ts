import {
  absoluteUrl,
  BRAND_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  LICENSE_DETAILS,
  LICENSE_PROGRAM,
  LICENSE_REGION,
  LICENSEE,
  PROMO_VIDEO,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";
import {
  courses,
  processSteps,
  reviews,
  siteFacts,
  teachers,
  type Course,
  type FaqItem,
  type Review,
  type Teacher,
} from "@/lib/site-data";

export type JsonLd = Record<string, unknown>;

export type BreadcrumbItem = {
  name: string;
  path: string;
};

// ---------------------------------------------------------------------------
// Stable @id anchors for the JSON-LD graph.
// Every node referenced in another node must have a matching @id here.
// ---------------------------------------------------------------------------
const ID = {
  organization: `${SITE_URL}#organization`,
  website: `${SITE_URL}#website`,
  logo: `${SITE_URL}#logo`,
  publisher: `${SITE_URL}#publisher`,
  rating: `${SITE_URL}#aggregate-rating`,
  service: `${SITE_URL}#service`,
  howTo: `${SITE_URL}#how-to`,
  homepage: `${SITE_URL}/#webpage`,
  teacher: (slug: string) => `${SITE_URL}/about#teacher-${slug}`,
  course: (slug: string) => `${SITE_URL}/courses/${slug}#course`,
};

// ---------------------------------------------------------------------------
// Atomic schema nodes — used both inside the @graph and standalone if needed.
// ---------------------------------------------------------------------------

export function createOrganizationNode(): JsonLd {
  return {
    "@type": ["Organization", "EducationalOrganization", "LocalBusiness"],
    "@id": ID.organization,
    name: SITE_NAME,
    alternateName: BRAND_NAME,
    legalName: LICENSEE.legalName,
    taxID: LICENSEE.inn,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE,
    image: { "@id": ID.logo },
    logo: { "@id": ID.logo },
    address: {
      "@type": "PostalAddress",
      addressCountry: "RU",
      addressLocality: "Москва",
      streetAddress: LICENSEE.address,
    },
    areaServed: {
      "@type": "Country",
      name: "Russia",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: CONTACT_PHONE,
        email: CONTACT_EMAIL,
        availableLanguage: ["ru", "zh"],
        areaServed: "RU",
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: CONTACT_PHONE,
        email: CONTACT_EMAIL,
        availableLanguage: ["ru"],
        areaServed: "RU",
      },
    ],
    sameAs: [SITE_URL],
    aggregateRating: { "@id": ID.rating },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: `Образовательная лицензия № ${LICENSE_DETAILS.registrationNumber}`,
      identifier: LICENSE_DETAILS.registrationNumber,
      dateCreated: LICENSE_DETAILS.issueDate,
      url: absoluteUrl("/license"),
      recognizedBy: {
        "@type": "GovernmentOrganization",
        name: LICENSE_REGION,
        address: LICENSE_DETAILS.issuerAddress,
      },
    },
  };
}

export function createWebsiteNode(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    name: SITE_NAME,
    alternateName: BRAND_NAME,
    url: SITE_URL,
    inLanguage: "ru-RU",
    publisher: { "@id": ID.organization },
    // Sitelinks Searchbox — даёт брендовую поисковую строку прямо в Google SERP.
    // Привязана к рабочей странице /search?q=..., которая фильтрует
    // блог и глоссарий.
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function createLogoNode(): JsonLd {
  return {
    "@type": "ImageObject",
    "@id": ID.logo,
    inLanguage: "ru-RU",
    url: absoluteUrl("/brand-mark.svg"),
    contentUrl: absoluteUrl("/brand-mark.svg"),
    width: 512,
    height: 512,
    caption: SITE_NAME,
  };
}

export function createAggregateRatingNode(): JsonLd {
  return {
    "@type": "AggregateRating",
    "@id": ID.rating,
    itemReviewed: { "@id": ID.organization },
    ratingValue: String(siteFacts.aggregateRating),
    reviewCount: String(siteFacts.reviewCount),
    bestRating: "5",
    worstRating: "1",
  };
}

export function createReviewNode(review: Review): JsonLd {
  return {
    "@type": "Review",
    reviewBody: review.body,
    author: { "@type": "Person", name: review.author },
    reviewRating: {
      "@type": "Rating",
      ratingValue: "5",
      bestRating: "5",
    },
    itemReviewed: { "@id": ID.organization },
  };
}

export function createTeacherNode(
  teacher: Teacher,
  options?: { certificates?: Teacher["certificates"] },
): JsonLd {
  const node: JsonLd = {
    "@type": "Person",
    "@id": ID.teacher(teacher.slug),
    name: teacher.displayName ?? teacher.name,
    jobTitle: teacher.jobTitle ?? teacher.specialization,
    description: teacher.bio ?? teacher.credentials,
    knowsAbout:
      teacher.knowsAbout && teacher.knowsAbout.length > 0
        ? teacher.knowsAbout
        : ["китайский язык", "HSK", teacher.specialization],
    worksFor: { "@id": ID.organization },
    url: `${SITE_URL}/team/${teacher.slug}`,
    mainEntityOfPage: `${SITE_URL}/team/${teacher.slug}`,
  };
  if (teacher.image) {
    // Полный ImageObject вместо плоского URL — даёт E-E-A-T-сигнал и
    // соответствие Google's Person rich-result requirements.
    node.image = {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/team/${teacher.slug}#photo`,
      url: absoluteUrl(teacher.image),
      contentUrl: absoluteUrl(teacher.image),
      width: 1254,
      height: 1254,
      caption: teacher.imageAlt ?? `${teacher.name} — преподаватель китайского языка, ChinaChild`,
      inLanguage: "ru-RU",
      creditText: "ChinaChild",
      copyrightNotice: `© ${new Date().getFullYear()} ChinaChild`,
    };
  }
  if (teacher.alumniOf) {
    node.alumniOf = {
      "@type": "EducationalOrganization",
      name: teacher.alumniOf,
    };
  }
  if (teacher.sameAs && teacher.sameAs.length > 0) {
    node.sameAs = teacher.sameAs;
  }
  const credentials = options?.certificates ?? teacher.certificates;
  if (credentials && credentials.length > 0) {
    node.hasCredential = credentials.map((cert, index) => ({
      "@type": "EducationalOccupationalCredential",
      "@id": `${SITE_URL}/team/${teacher.slug}#credential-${index}`,
      name: cert.name,
      description: cert.caption,
      credentialCategory: "certificate",
      image: {
        "@type": "ImageObject",
        url: absoluteUrl(cert.src),
        contentUrl: absoluteUrl(cert.src),
        width: cert.width ?? 800,
        height: cert.height ?? 1132,
        caption: cert.alt,
        inLanguage: "ru-RU",
        creditText: "ChinaChild",
      },
    }));
  }
  return node;
}

export function createCourseNode(course: Course): JsonLd {
  // Rolling enrollment: each cohort starts at the next month boundary,
  // 3 months long. Yandex/Google reward Course nodes with concrete instances.
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 4, 1);
  const validUntil = new Date(now.getFullYear() + 1, now.getMonth(), 1);

  const offer: JsonLd = {
    "@type": "Offer",
    url: absoluteUrl(course.href),
    priceCurrency: "RUB",
    category: course.format,
    availability: "https://schema.org/InStock",
    validFrom: now.toISOString().slice(0, 10),
    priceValidUntil: validUntil.toISOString().slice(0, 10),
  };
  if (course.priceValue) {
    offer.price = course.priceValue;
  }

  const node: JsonLd = {
    "@type": "Course",
    "@id": ID.course(course.slug),
    name: course.title,
    description: course.description,
    url: absoluteUrl(course.href),
    provider: { "@id": ID.organization },
    educationalLevel: course.level,
    inLanguage: "ru-RU",
    audience: {
      "@type": "Audience",
      audienceType: course.audience,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: course.duration,
      inLanguage: "ru-RU",
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: {
        "@type": "VirtualLocation",
        url: absoluteUrl(course.href),
      },
      ...(course.timeRequiredIso ? { timeRequired: course.timeRequiredIso } : {}),
      ...(course.instructorSlug
        ? { instructor: { "@id": ID.teacher(course.instructorSlug) } }
        : {}),
    },
    offers: offer,
  };

  if (course.teaches && course.teaches.length > 0) {
    node.teaches = course.teaches;
  }
  if (course.prerequisites) {
    node.coursePrerequisites = course.prerequisites;
  }
  if (course.credentialAwarded) {
    node.educationalCredentialAwarded = course.credentialAwarded;
  }
  if (course.timeRequiredIso) {
    node.timeRequired = course.timeRequiredIso;
  }
  if (course.instructorSlug) {
    node.instructor = { "@id": ID.teacher(course.instructorSlug) };
  }

  return node;
}

export function createServiceNode(): JsonLd {
  return {
    "@type": "Service",
    "@id": ID.service,
    serviceType: "Онлайн-курсы китайского языка",
    provider: { "@id": ID.organization },
    areaServed: { "@type": "Country", name: "Russia" },
    audience: {
      "@type": "Audience",
      audienceType: "Подростки 12+ и взрослые",
    },
    offers: courses.map((c) => ({
      "@type": "Offer",
      name: c.title,
      url: absoluteUrl(c.href),
      priceCurrency: "RUB",
      ...(c.priceValue ? { price: c.priceValue } : {}),
      category: c.format,
    })),
  };
}

/**
 * VideoObject — promo video for the school. Populates only when the
 * PROMO_VIDEO config has at least contentUrl + thumbnailUrl set, so an
 * empty config doesn't pollute the @graph with a broken node.
 */
export function createPromoVideoNode(): JsonLd | null {
  if (!PROMO_VIDEO.contentUrl || !PROMO_VIDEO.thumbnailUrl) {
    return null;
  }
  return {
    "@type": "VideoObject",
    "@id": `${SITE_URL}#promo-video`,
    name: PROMO_VIDEO.name,
    description: PROMO_VIDEO.description,
    thumbnailUrl: PROMO_VIDEO.thumbnailUrl.startsWith("http")
      ? PROMO_VIDEO.thumbnailUrl
      : absoluteUrl(PROMO_VIDEO.thumbnailUrl),
    contentUrl: PROMO_VIDEO.contentUrl,
    uploadDate: PROMO_VIDEO.uploadDate || new Date().toISOString().slice(0, 10),
    ...(PROMO_VIDEO.duration ? { duration: PROMO_VIDEO.duration } : {}),
    publisher: { "@id": `${SITE_URL}#organization` },
    inLanguage: "ru-RU",
  };
}

export function createAggregateOfferNode(): JsonLd {
  const prices = courses
    .map((c) => (c.priceValue ? Number(c.priceValue) : NaN))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (prices.length === 0) {
    return {};
  }
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);
  return {
    "@type": "AggregateOffer",
    "@id": `${SITE_URL}#aggregate-offer`,
    offerCount: courses.length,
    priceCurrency: "RUB",
    lowPrice: String(lowPrice),
    highPrice: String(highPrice),
    availability: "https://schema.org/InStock",
    seller: { "@id": ID.organization },
    itemOffered: courses.map((c) => ({ "@id": ID.course(c.slug) })),
  };
}

export function createHowToNode(): JsonLd {
  return {
    "@type": "HowTo",
    "@id": ID.howTo,
    name: "Как начать учить китайский в ChinaChild",
    description:
      "Пошаговый маршрут: бесплатный тест на уровень HSK, пробное занятие, регистрация и регулярные занятия.",
    totalTime: "PT4380H",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "RUB",
      value: "4999",
    },
    step: processSteps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
  };
}

export function createFaqNode(items: FaqItem[]): JsonLd {
  return {
    "@type": "FAQPage",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable]"],
    },
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function createBreadcrumbNode(items: BreadcrumbItem[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

// ---------------------------------------------------------------------------
// @graph builders
// ---------------------------------------------------------------------------

/**
 * Always-on site-wide @graph mounted in app/layout.tsx.
 * Carries Organization, WebSite, Logo, AggregateRating, Service, HowTo,
 * all teacher Person nodes, all Course nodes, all Reviews and a
 * SpeakableSpecification for voice assistants — connected via @id.
 */
export function createSiteGraph(): JsonLd {
  const speakable: JsonLd = {
    "@type": "SpeakableSpecification",
    "@id": `${SITE_URL}#speakable`,
    cssSelector: ["h1", "[data-speakable]", ".faq-question", ".faq-answer"],
    xpath: ["/html/head/title"],
  };

  const graph: JsonLd[] = [
    createOrganizationNode(),
    createWebsiteNode(),
    createLogoNode(),
    createAggregateRatingNode(),
    createServiceNode(),
    createHowToNode(),
    speakable,
    ...teachers.map((t) => createTeacherNode(t)),
    ...courses.map((c) => createCourseNode(c)),
    ...reviews.map((r) => createReviewNode(r)),
  ];

  const aggregateOffer = createAggregateOfferNode();
  if (Object.keys(aggregateOffer).length > 0) {
    graph.push(aggregateOffer);
  }

  const promoVideo = createPromoVideoNode();
  if (promoVideo) {
    graph.push(promoVideo);
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/**
 * Per-page @graph: WebPage + BreadcrumbList + optional FAQ, linked into the
 * main Organization/WebSite via @id. Also adds SpeakableSpecification on
 * H1 and FAQ for voice assistants (Yandex Алиса, Google Assistant).
 */
export function createPageGraph(input: {
  url: string;
  name: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  faqs?: FaqItem[];
  datePublished?: string;
  dateModified?: string;
  speakable?: boolean;
}): JsonLd {
  const url = absoluteUrl(input.url);
  const pageId = `${url}#webpage`;

  const webPage: JsonLd = {
    "@type": "WebPage",
    "@id": pageId,
    url,
    name: input.name,
    description: input.description,
    inLanguage: "ru-RU",
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.organization },
    breadcrumb: { "@id": `${pageId}#breadcrumb` },
  };
  if (input.datePublished) webPage.datePublished = input.datePublished;
  if (input.dateModified) webPage.dateModified = input.dateModified;
  if (input.speakable) {
    webPage.speakable = {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable]", ".faq-question", ".faq-answer"],
    };
  }

  const graph: JsonLd[] = [
    webPage,
    {
      ...createBreadcrumbNode(input.breadcrumbs),
      "@id": `${pageId}#breadcrumb`,
    },
  ];

  if (input.faqs && input.faqs.length > 0) {
    graph.push({
      ...createFaqNode(input.faqs),
      "@id": `${pageId}#faq`,
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/**
 * Article @graph for blog posts: Article + LearningResource + BreadcrumbList,
 * all linked back to the site graph via @id.
 *
 * LearningResource is a schema.org subtype that signals "educational content"
 * to Google — a separate ranking lane for educational publishers.
 */
export function createArticleGraph(input: {
  url: string;
  title: string;
  description: string;
  category: string;
  datePublished: string;
  dateModified: string;
  authorSlug: string;
  breadcrumbs: BreadcrumbItem[];
  keywords?: string[];
}): JsonLd {
  const url = absoluteUrl(input.url);
  const articleId = `${url}#article`;
  const learningId = `${url}#learning-resource`;
  const author = teachers.find((t) => t.slug === input.authorSlug) ?? teachers[0];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Article", "LearningResource"],
        "@id": articleId,
        url,
        headline: input.title,
        description: input.description,
        articleSection: input.category,
        inLanguage: "ru-RU",
        datePublished: input.datePublished,
        dateModified: input.dateModified,
        author: { "@id": ID.teacher(author.slug) },
        publisher: { "@id": ID.organization },
        isPartOf: { "@id": ID.website },
        mainEntityOfPage: { "@id": articleId },
        learningResourceType: "Article",
        educationalLevel: "Beginner to advanced",
        teaches: input.keywords?.slice(0, 5),
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
        },
        ...(input.keywords ? { keywords: input.keywords.join(", ") } : {}),
      },
      {
        "@type": "LearningResource",
        "@id": learningId,
        name: input.title,
        description: input.description,
        url,
        inLanguage: "ru-RU",
        learningResourceType: "Reading",
        educationalUse: "instruction",
        about: { "@id": ID.organization },
        creator: { "@id": ID.teacher(author.slug) },
        publisher: { "@id": ID.organization },
        isPartOf: { "@id": articleId },
        ...(input.keywords ? { keywords: input.keywords.join(", ") } : {}),
      },
      {
        ...createBreadcrumbNode(input.breadcrumbs),
        "@id": `${articleId}#breadcrumb`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Backwards-compat shims (so existing pages keep working)
// ---------------------------------------------------------------------------

export function createOrganizationSchema(): JsonLd {
  return { "@context": "https://schema.org", ...createOrganizationNode() };
}
export function createWebsiteSchema(): JsonLd {
  return { "@context": "https://schema.org", ...createWebsiteNode() };
}
export function createEducationalOrganizationSchema(): JsonLd {
  return createOrganizationSchema();
}
export function createCourseSchema(course: Course): JsonLd {
  return { "@context": "https://schema.org", ...createCourseNode(course) };
}
export function createFaqSchema(items: FaqItem[]): JsonLd {
  return { "@context": "https://schema.org", ...createFaqNode(items) };
}
export function createReviewSchema(review: Review): JsonLd {
  return { "@context": "https://schema.org", ...createReviewNode(review) };
}
export function createAggregateRatingSchema(): JsonLd {
  return { "@context": "https://schema.org", ...createAggregateRatingNode() };
}
export function createPersonSchema(teacher: Teacher): JsonLd {
  return { "@context": "https://schema.org", ...createTeacherNode(teacher) };
}
export function createBreadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return { "@context": "https://schema.org", ...createBreadcrumbNode(items) };
}
export function createHowToSchema(): JsonLd {
  return { "@context": "https://schema.org", ...createHowToNode() };
}
export function createServiceSchema(): JsonLd {
  return { "@context": "https://schema.org", ...createServiceNode() };
}
export function createHomepageSchemas(): JsonLd[] {
  // Keep returning empty array since the site-wide @graph in layout.tsx
  // already covers Organization/WebSite/Course/Service/HowTo.
  return [];
}
export function createTeachersSchemas(): JsonLd[] {
  return teachers.map((t) => createPersonSchema(t));
}
export function createReviewSchemas(): JsonLd[] {
  return reviews.map((r) => createReviewSchema(r));
}
