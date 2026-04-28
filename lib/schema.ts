import {
  absoluteUrl,
  BRAND_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  LICENSE_PROGRAM,
  LICENSE_REGION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";
import {
  courses,
  faqs,
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

export function createOrganizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: BRAND_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/brand-mark.svg"),
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE,
    sameAs: [SITE_URL],
  };
}

export function createEducationalOrganizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    alternateName: BRAND_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/brand-mark.svg"),
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE,
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: `Образовательная лицензия — ${LICENSE_PROGRAM}`,
      recognizedBy: {
        "@type": "Organization",
        name: LICENSE_REGION,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(siteFacts.aggregateRating),
      reviewCount: String(siteFacts.reviewCount),
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "RU",
      addressLocality: "Москва",
    },
  };
}

export function createCourseSchema(course: Course): JsonLd {
  const offer: JsonLd = {
    "@type": "Offer",
    url: absoluteUrl(course.href),
    priceCurrency: "RUB",
    category: course.format,
    availability: "https://schema.org/InStock",
  };

  if (course.priceValue) {
    offer.price = course.priceValue;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    educationalLevel: course.level,
    audience: {
      "@type": "Audience",
      audienceType: course.audience,
    },
    offers: offer,
  };
}

export function createFaqSchema(items: FaqItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
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

export function createReviewSchema(review: Review): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    reviewBody: review.body,
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: "5",
      bestRating: "5",
    },
    itemReviewed: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
    },
  };
}

export function createAggregateRatingSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(siteFacts.aggregateRating),
      reviewCount: String(siteFacts.reviewCount),
    },
    review: reviews.slice(0, 4).map((review) => ({
      "@type": "Review",
      reviewBody: review.body,
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
    })),
  };
}

export function createPersonSchema(teacher: Teacher): JsonLd {
  const base: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: teacher.name,
    jobTitle: teacher.specialization,
    worksFor: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    knowsAbout: ["китайский язык", "HSK", teacher.specialization],
    description: teacher.credentials,
  };
  if (teacher.image) {
    base.image = absoluteUrl(teacher.image);
  }
  return base;
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function createWebsiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: BRAND_NAME,
    url: SITE_URL,
    inLanguage: "ru",
    publisher: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function createHowToSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Как начать учить китайский в ChinaChild",
    description:
      "Пошаговый маршрут от бесплатного теста на уровень HSK до регулярных занятий по лицензированной программе.",
    totalTime: "PT24H",
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
      url: `${SITE_URL}/#kak-prokhodit`,
    })),
  };
}

export function createServiceSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Онлайн-курсы китайского языка",
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "Russia",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Подростки 12+ и взрослые",
    },
    offers: courses.map((course) => ({
      "@type": "Offer",
      name: course.title,
      url: absoluteUrl(course.href),
      priceCurrency: "RUB",
      ...(course.priceValue ? { price: course.priceValue } : {}),
      category: course.format,
    })),
  };
}

export function createHomepageSchemas(): JsonLd[] {
  return [
    createEducationalOrganizationSchema(),
    createAggregateRatingSchema(),
    createFaqSchema(faqs),
    createHowToSchema(),
    createServiceSchema(),
    ...courses.map((course) => createCourseSchema(course)),
  ];
}

export function createTeachersSchemas(): JsonLd[] {
  return teachers.map((teacher) => createPersonSchema(teacher));
}

export function createReviewSchemas(): JsonLd[] {
  return reviews.map((review) => createReviewSchema(review));
}
