import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // Old Russian-slug routes → new English-slug structure (permanent 301)
      { source: "/kursy", destination: "/courses", permanent: true },
      { source: "/onlajn-kursy", destination: "/courses/online-chinese", permanent: true },
      { source: "/hsk", destination: "/courses/hsk-preparation", permanent: true },
      { source: "/dlya-detej", destination: "/courses/chinese-for-kids", permanent: true },
      { source: "/dlya-podrostkov", destination: "/courses/chinese-for-kids", permanent: true },
      { source: "/dlya-vzroslyh", destination: "/courses/chinese-for-adults", permanent: true },
      { source: "/dlya-biznesa", destination: "/courses/business-chinese", permanent: true },
      { source: "/test-hsk", destination: "/courses/hsk-preparation", permanent: true },
      { source: "/prepodavateli", destination: "/about", permanent: true },
      // Legacy blog slugs → new English slugs
      {
        source: "/blog/kak-podgotovitsya-k-hsk-1",
        destination: "/blog/hsk-levels-explained",
        permanent: true,
      },
      {
        source: "/blog/kitajskij-dlya-detej-s-chego-nachat",
        destination: "/blog/chinese-for-beginners-guide",
        permanent: true,
      },
      {
        source: "/blog/zachem-biznesu-kitajskij-yazyk",
        destination: "/blog/how-long-to-learn-chinese",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
