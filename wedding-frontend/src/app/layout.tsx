import type { Metadata } from "next";
import { Inter, Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import BackToTop from "@/components/BackToTop";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin", "vietnamese"],
  variable: "--font-dancing",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wedding App - Nền tảng tạo thiệp cưới",
  description: "Tạo thiệp cưới online chuyên nghiệp và dễ dàng",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${playfair.variable} ${dancingScript.variable}`}
    >
      <body className="font-sans bg-slate-50 text-slate-900 antialiased min-h-screen">
        <AuthProvider>
          {children}
          <BackToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
