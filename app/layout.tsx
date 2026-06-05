import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Ride Share NZ – Viajes compartidos en Nueva Zelanda",
  description:
    "Encontrá y publicá viajes compartidos en toda Nueva Zelanda. Ahorrá en transporte y conocé gente.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-brand-900 text-brand-100 py-8 mt-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-3">
              <Image
                src="/logo.svg"
                alt="RideShare NZ"
                height={32}
                width={140}
                className="object-contain brightness-0 invert opacity-80"
              />
            </div>
            <p className="text-sm text-brand-100 opacity-70">
              Conectando viajeros en Nueva Zelanda · {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
