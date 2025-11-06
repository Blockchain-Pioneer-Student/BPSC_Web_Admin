// Structured Data for SEO
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Blockchain Pioneer Student UTC",
  "alternateName": "UTC Blockchain Club",
  "url": "https://blockchain-utc.vercel.app",
  "logo": "https://blockchain-utc.vercel.app/logo.png",
  "description": "Blockchain Pioneer Student Club at the University of Transport and Communications. Learn, grow, and apply Blockchain & Web3.",
  "foundingDate": "2024-04-01",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "VN",
    "addressRegion": "Hanoi",
    "addressLocality": "Hanoi"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "blockchain.utc@gmail.com",
    "url": "https://blockchain-utc.vercel.app/contact"
  },
  "sameAs": [
    "https://www.facebook.com/blockchain.utc",
    "https://www.instagram.com/blockchain.utc",
    "https://twitter.com/blockchain_utc",
    "https://www.linkedin.com/company/blockchain-utc"
  ],
  "memberOf": {
    "@type": "Organization",
    "name": "University of Transport and Communications",
    "url": "https://utc.edu.vn"
  }
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Blockchain Pioneer Student UTC",
  "url": "https://blockchain-utc.vercel.app",
  "description": "Official website of the Blockchain Pioneer Student Club - University of Transport and Communications",
  "publisher": {
    "@type": "Organization",
    "name": "Blockchain Pioneer Student UTC"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://blockchain-utc.vercel.app/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const educationalOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Blockchain Pioneer Student UTC",
  "description": "Academic club specializing in Blockchain and Web3",
  "url": "https://blockchain-utc.vercel.app",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "VN",
    "addressRegion": "Hanoi"
  },
  "memberOf": {
    "@type": "CollegeOrUniversity",
    "name": "University of Transport and Communications"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Blockchain training programs",
    "itemListElement": [
      {
        "@type": "Course",
        "name": "Cardano Blockchain Course",
        "description": "9-session intensive course on Cardano Blockchain",
        "provider": {
          "@type": "Organization",
          "name": "Blockchain Pioneer Student UTC"
        }
      },
      {
        "@type": "Course", 
        "name": "Blockchain Hackathon",
        "description": "24–48 hour Blockchain programming competition",
        "provider": {
          "@type": "Organization",
          "name": "Blockchain Pioneer Student UTC"
        }
      }
    ]
  }
};

export const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Cardano Blockchain Hackathon 2025",
  "description": "Large-scale hackathon with prizes worth 350 million VND, attracting 200+ students from universities nationwide.",
  "startDate": "2025-03-01T08:00:00+07:00",
  "endDate": "2025-03-02T18:00:00+07:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "University of Transport and Communications",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "VN",
      "addressRegion": "Hanoi"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "Blockchain Pioneer Student UTC",
    "url": "https://blockchain-utc.vercel.app"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "VND",
    "availability": "https://schema.org/InStock",
    "url": "https://blockchain-utc.vercel.app/events"
  }
};

export const breadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const articleSchema = (article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  url: string;
  image?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "author": {
    "@type": "Person",
    "name": article.author
  },
  "publisher": {
    "@type": "Organization",
    "name": "Blockchain Pioneer Student UTC",
    "logo": {
      "@type": "ImageObject",
      "url": "https://blockchain-utc.vercel.app/logo.png"
    }
  },
  "datePublished": article.datePublished,
  "dateModified": article.dateModified,
  "url": article.url,
  "image": article.image || "https://blockchain-utc.vercel.app/og-image.jpg"
});
