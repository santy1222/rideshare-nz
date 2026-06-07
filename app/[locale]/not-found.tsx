import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">🚗</div>
      <h1 className="font-display font-semibold text-3xl text-gray-900 mb-2">
        {t("title")}
      </h1>
      <p className="text-gray-500 mb-8">{t("description")}</p>
      <Link href="/" className="btn-primary">
        {t("backHome")}
      </Link>
    </div>
  );
}
