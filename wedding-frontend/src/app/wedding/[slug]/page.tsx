import { Metadata } from "next";
import WeddingPageClient from "./WeddingPageClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://wedding-backend:8080";

async function getWeddingData(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/api/weddings/public/${slug}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getWeddingData(slug);

  if (!wedding) {
    return {
      title: "Thiệp Cưới",
      description: "Thiệp cưới online - Wedding Invitation",
    };
  }

  const title = `${wedding.groomName} ❤ ${wedding.brideName} | Thiệp Cưới`;
  const description = `Trân trọng kính mời bạn đến dự lễ cưới của ${wedding.groomName} & ${wedding.brideName}. ${
    wedding.venueName ? `Tại ${wedding.venueName}.` : ""
  }`;

  // Use the first gallery image, or groom/bride photo as OG image
  const ogImage =
    wedding.images?.[0]?.imageUrl ||
    wedding.groomImageUrl ||
    wedding.brideImageUrl ||
    null;

  const ogImageUrl = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${API_BASE}${ogImage}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Wedding Invitation",
      ...(ogImageUrl && {
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${wedding.groomName} & ${wedding.brideName} Wedding`,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  };
}

export default async function GuestWeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <WeddingPageClient slug={slug} />;
}
