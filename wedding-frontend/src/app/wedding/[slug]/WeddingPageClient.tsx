"use client";

import { useEffect, useState } from "react";
import { weddingApi, interactionApi, WeddingResponse } from "@/lib/api";
import { Locale, useTranslation } from "@/lib/i18n";
import Template1 from "@/components/templates/Template1";
import Template2 from "@/components/templates/Template2";
import Template3 from "@/components/templates/Template3";

export default function WeddingPageClient({ slug }: { slug: string }) {
  const [wedding, setWedding] = useState<WeddingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locale, setLocale] = useState<Locale>("vi");
  const t = useTranslation(locale);

  useEffect(() => {
    loadWedding();
  }, [slug]);

  const loadWedding = async () => {
    try {
      const res = await weddingApi.getPublic(slug);
      setWedding(res.data);
      try {
        await interactionApi.recordVisit(res.data.id);
      } catch {
        /* ignore */
      }
    } catch {
      setError("Không tìm thấy thiệp cưới hoặc thiệp chưa được xuất bản.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Skeleton mimicking Template1 layout */}
        <div className="h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-slate-50">
          <div className="w-24 h-4 bg-slate-200 animate-pulse rounded-full mb-6"></div>
          <div className="w-64 h-16 bg-slate-200 animate-pulse rounded-2xl mb-4"></div>
          <div className="w-20 h-8 bg-slate-200 animate-pulse rounded-full mb-4"></div>
          <div className="w-48 h-16 bg-slate-200 animate-pulse rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#faf8f5" }}
      >
        <div className="text-center">
          <span className="text-6xl block mb-4">💔</span>
          <p className="text-gray-500">{t.notFound}</p>
        </div>
      </div>
    );
  }

  // Dynamic template mapping
  const renderTemplate = () => {
    switch (wedding.templateCode) {
      case "template2":
        return <Template2 wedding={wedding} locale={locale} />;
      case "template3":
        return <Template3 wedding={wedding} locale={locale} />;
      case "template1":
      default:
        return <Template1 wedding={wedding} locale={locale} />;
    }
  };

  return (
    <main className="relative w-full overflow-x-hidden">
      {/* Language Switcher (Global) */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
          className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center font-bold text-sm bg-white hover:bg-slate-50 transition-colors"
        >
          {locale === "vi" ? "🇻🇳" : "🇬🇧"}
        </button>
      </div>

      {renderTemplate()}
    </main>
  );
}
