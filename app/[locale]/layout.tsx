import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "../globals.css";
import "flag-icons/css/flag-icons.min.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/Navbar";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "Footer" });

  return (
    <html lang={locale} className={nunito.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-brand-900 text-brand-100 py-8 mt-16">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <div className="flex items-center justify-center mb-3">
                <Image
                  src="/logo.png"
                  alt="RideShare NZ"
                  height={36}
                  width={146}
                  className="object-contain brightness-0 invert opacity-80"
                />
              </div>
              <p className="text-sm text-brand-100 opacity-70">
                {t("tagline")} · {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
