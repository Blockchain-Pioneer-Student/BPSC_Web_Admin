import type React from "react";
import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ParticlesBackground } from "@/components/particles-background";
import { Toaster } from "@/components/ui/sonner";
import { ReduxProvider } from "@/lib/providers/ReduxProvider";
import {
  organizationSchema,
  websiteSchema,
  educationalOrganizationSchema,
} from "./structured-data";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  preload: true,
});

// SEO Metadata
export const metadata: Metadata = {
  title: {
    default: "Blockchain Pioneer Student - UTC Blockchain Club",
    template: "%s | Blockchain Pioneer Student",
  },
  description:
    "Blockchain Pioneer Student Club at the University of Transport and Communications. Learn, grow, and apply Blockchain & Web3. Organizing hackathons, courses, and events.",
  keywords: [
    "blockchain",
    "web3",
    "cryptocurrency",
    "hackathon",
    "student",
    "university of transport and communications",
    "UTC",
    "cardano",
    "defi",
    "nft",
    "smart contract",
    "blockchain club",
    "pioneer student",
    "blockchain technology",
    "blockchain development",
  ],
  authors: [{ name: "Blockchain Pioneer Student UTC" }],
  creator: "Blockchain Pioneer Student UTC",
  publisher: "Blockchain Pioneer Student UTC",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.bpsclub.com/"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.bpsclub.com/",
    siteName: "Blockchain Pioneer Student UTC",
    title: "Blockchain Pioneer Student - UTC Blockchain Club",
    description:
      "Blockchain Pioneer Student Club at the University of Transport and Communications. Learn, grow, and apply Blockchain & Web3.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Blockchain Pioneer Student UTC - Blockchain Club",
        type: "image/jpeg",
      },
      {
        url: "/og-image-square.jpg",
        width: 1200,
        height: 1200,
        alt: "Blockchain Pioneer Student UTC Logo",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@blockchain_utc",
    creator: "@blockchain_utc",
    title: "Blockchain Pioneer Student - UTC Blockchain Club",
    description:
      "Blockchain Pioneer Student Club at the University of Transport and Communications. Learn, grow, and apply Blockchain & Web3.",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "technology",
  classification: "Educational Technology Club",
  referrer: "origin-when-cross-origin",
  generator: "Next.js",
  applicationName: "Blockchain Pioneer Student",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/Logo_favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/Logo_favicon.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/Logo_favicon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/Logo_favicon.png"],
  },
  other: {
    "msapplication-TileColor": "#004987",
    "theme-color": "#004987",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Blockchain UTC",
    "mobile-web-app-capable": "yes",
  },
};

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#004987" },
    { media: "(prefers-color-scheme: dark)", color: "#0070b8" },
  ],
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(educationalOrganizationSchema),
          }}
        />

        {/* Additional SEO Meta Tags */}
        <meta name="geo.region" content="VN-HN" />
        <meta name="geo.placename" content="Hanoi" />
        <meta name="geo.position" content="21.0285;105.8542" />
        <meta name="ICBM" content="21.0285, 105.8542" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
      </head>
      <body className={inter.className}>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            forcedTheme="light"
          >
            <div className="relative flex min-h-screen flex-col">
              <div className="relative">
                <ParticlesBackground />
              </div>
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Toaster />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
