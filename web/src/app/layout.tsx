import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { brand, contact, addressLine, reviews } from "@f7/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fitness7gym.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.fullName} — Gym in Dharmapuri`,
    template: `%s · ${brand.name}`,
  },
  description:
    "Dharmapuri's unisex strength and conditioning gym. Free weights, functional training, ladies-only hours, certified coaches — and a hill trek every month.",
  keywords: [
    "gym in Dharmapuri",
    "Fitness 7 Gym Unisex",
    "unisex gym Dharmapuri",
    "ladies gym Dharmapuri",
    "personal training Dharmapuri",
    "trekking Dharmapuri",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: brand.fullName,
    title: `${brand.fullName} — Train hard. Live strong.`,
    description:
      "Strength, conditioning and a monthly trek into the hills. Dharmapuri's unisex gym.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.fullName} — Dharmapuri`,
    description: "Strength, conditioning and a monthly trek into the hills.",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#111412" }, { media: "(prefers-color-scheme: light)", color: "#faf9f6" }],
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  name: brand.fullName,
  description:
    "Unisex strength and conditioning gym in Dharmapuri, Tamil Nadu, with monthly hill treks.",
  address: {
    "@type": "PostalAddress",
    streetAddress: `${contact.address.line1}, ${contact.address.line2}`,
    addressLocality: contact.address.city,
    addressRegion: contact.address.state,
    postalCode: contact.address.pincode,
    addressCountry: "IN",
  },
  telephone: contact.phone,
  email: contact.email,
  url: siteUrl,
  sameAs: [contact.instagram],
  geo: {
    "@type": "GeoCoordinates",
    latitude: contact.geo.lat,
    longitude: contact.geo.lng,
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: reviews.rating,
    reviewCount: reviews.count,
    bestRating: 5,
  },
  priceRange: "₹₹",
  openingHours: ["Mo-Fr 05:00-10:30", "Mo-Fr 16:00-22:00", "Sa 05:00-10:30", "Su 06:00-10:00"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <span className="sr-only">{addressLine}</span>
        {children}
      </body>
    </html>
  );
}
