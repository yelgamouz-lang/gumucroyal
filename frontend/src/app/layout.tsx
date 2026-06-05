import { Amiri, Cinzel, Cormorant_Garamond, DM_Sans, Tajawal } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CheckoutPopup } from "@/components/checkout/CheckoutFlow";
import { UpsellModal } from "@/components/checkout/UpsellModal";
import { PixelProvider } from "@/components/tracking/PixelProvider";
import { WhatsAppCTA } from "@/components/shared/UI";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
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
  title: "GUMÜÇROYAL — أنوثة كتحس، فخامة كتبان",
  description: "Bijouterie premium pour la femme marocaine. COD, livraison 24H et 48H.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`notranslate ${cormorant.variable} ${cinzel.variable} ${dmSans.variable} ${tajawal.variable} ${amiri.variable}`}
      translate="no"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
        <link
          rel="preload"
          href="/videos/hero-mobile.mp4"
          as="video"
          type="video/mp4"
          media="(max-width: 767px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/videos/hero.mp4"
          as="video"
          type="video/mp4"
          media="(min-width: 768px)"
          fetchPriority="high"
        />
        <link rel="preload" href="/videos/hero-poster.jpg" as="image" type="image/jpeg" fetchPriority="high" />
      </head>
      <body className="min-h-screen flex flex-col bg-brand-black text-brand-white antialiased notranslate" translate="no">
        <AppProviders>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <CheckoutPopup />
          <UpsellModal />
          <WhatsAppCTA />
          <PixelProvider />
        </AppProviders>
      </body>
    </html>
  );
}
