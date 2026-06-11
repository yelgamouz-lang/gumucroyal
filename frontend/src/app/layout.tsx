import { Amiri, Cormorant_Garamond, DM_Sans, Playfair_Display, Tajawal } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppProviders } from "@/components/providers/AppProviders";
import { ClientOverlays } from "@/components/layout/ClientOverlays";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata = {
  title: "GUMÜÇ ROYAL — Maison de joaillerie",
  description: "Maison de joaillerie accessible — acier inoxydable finition dorée. Paiement à la livraison, livraison 24-48h au Maroc.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`notranslate ${cormorant.variable} ${playfair.variable} ${dmSans.variable} ${tajawal.variable} ${amiri.variable}`}
      translate="no"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-screen flex flex-col bg-brand-black text-brand-white antialiased notranslate" translate="no">
        <AppProviders>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ClientOverlays />
        </AppProviders>
      </body>
    </html>
  );
}
