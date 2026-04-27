import { absoluteUrl, CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site-config";
import {
  courses,
  faqs,
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
    url: SITE_URL,
    logo: absoluteUrl("/brand-mark.svg"),
    email: CONTACT_EMAIL,
    sameAs: [SITE_URL],
  };
}

export function createWebsiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: "Онлайн-школа китайского языка для детей, подростков и взрослых",
    inLanguage: "ru-RU",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function createEducationalOrganizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/brand-mark.svg"),
    description: "Онлайн-школа китайского языка для детей и взрослых",
    email: CONTACT_EMAIL,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(siteFacts.aggregateRating),
      reviewCount: String(siteFacts.reviewCount),
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "RU",
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
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: teacher.name,
    image: absoluteUrl(teacher.image),
    jobTitle: teacher.specialization,
    worksFor: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    knowsAbout: ["китайский язык", "HSK", teacher.specialization],
    description: teacher.credentials,
  };
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

export function createHomepageSchemas(): JsonLd[] {
  return [
    createEducationalOrganizationSchema(),
    createAggregateRatingSchema(),
    createFaqSchema(faqs),
    ...courses.map((course) => createCourseSchema(course)),
  ];
}

export function createTeachersSchemas(): JsonLd[] {
  return teachers.map((teacher) => createPersonSchema(teacher));
}

export function createReviewSchemas(): JsonLd[] {
  return reviews.map((review) => createReviewSchema(review));
}
