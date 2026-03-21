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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Wedding Invitation",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
