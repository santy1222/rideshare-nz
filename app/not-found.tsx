import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">🚗</div>
      <h1 className="font-display font-semibold text-3xl text-gray-900 mb-2">
        Página no encontrada
      </h1>
      <p className="text-gray-500 mb-8">
        La página que buscás no existe o fue eliminada.
      </p>
      <Link href="/" className="btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
