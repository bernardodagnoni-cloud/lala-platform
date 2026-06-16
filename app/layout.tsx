import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/language-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vilane = localFont({
  src: "./fonts/Vilane-ExtraLight.ttf",
  variable: "--font-vilane",
  weight: "200",
});

export const metadata: Metadata = {
  title: "LaLa Match",
  description: "AI-powered talent matching for Latin American leaders",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${vilane.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
