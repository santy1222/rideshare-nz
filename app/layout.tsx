import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Ride Share NZ – Viajes compartidos en Nueva Zelanda",
  description:
    "Encontrá y publicá viajes compartidos en toda Nueva Zelanda. Ahorrá en transporte y conocé gente.",
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
        <footer className="bg-green-900 text-green-100 py-8 mt-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CarIcon />
              <span className="font-sora font-bold text-white text-lg">
                Ride Share NZ
              </span>
            </div>
            <p className="text-sm text-green-300">
              Conectando viajeros en Nueva Zelanda · {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

function CarIcon() {
  return (
    <svg width="36" height="18" viewBox="0 0 60 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 16L17 6H40L46 16H12Z" fill="#4ade80"/>
      <path d="M18 15L21 7H29V15H18Z" fill="#dcfce7"/>
      <path d="M30 15V7H39L45 15H30Z" fill="#dcfce7"/>
      <path d="M2 16H57V21Q57 23 55 23H5Q3 23 3 21V16Z" fill="#4ade80"/>
      <rect x="55" y="17" width="3" height="2.5" rx="1.25" fill="#fef9c3"/>
      <circle cx="15" cy="23" r="5" fill="#14532d"/>
      <circle cx="15" cy="23" r="2.2" fill="#86efac"/>
      <circle cx="44" cy="23" r="5" fill="#14532d"/>
      <circle cx="44" cy="23" r="2.2" fill="#86efac"/>
    </svg>
  );
}
