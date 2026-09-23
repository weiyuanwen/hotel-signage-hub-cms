import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist, Geist_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/components/google-tag-manager";
import { SessionProvider } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://signagehub.online"),
  title: {
    default: "Hotel welcome TV software | SignageHub",
    template: "%s · SignageHub",
  },
  description:
    "Hotel welcome TV software. Front desk types a guest name; the room TV updates greeting and Wi-Fi instantly. 3 screens at $3 a month.",
  applicationName: "SignageHub",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} ${beVietnam.variable} h-full`}>
      <head>
        <GoogleTagManager />
      </head>
      <body className="min-h-full bg-bg text-ink antialiased">
        <GoogleTagManagerNoscript />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
