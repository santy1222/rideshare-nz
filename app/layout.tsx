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
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 17H3a1 1 0 01-1-1v-5l2.5-6h13L20 11v5a1 1 0 01-1 1h-2"
        stroke="#4ade80"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="17.5" r="1.5" fill="#4ade80" />
      <circle cx="16.5" cy="17.5" r="1.5" fill="#4ade80" />
      <path
        d="M5.5 11h13"
        stroke="#4ade80"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
