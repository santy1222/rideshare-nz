import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function GuidePage() {
  const t = await getTranslations("Guide");

  const sections = [
    {
      icon: "🔎",
      title: t("searchTitle"),
      steps: [t("searchStep1"), t("searchStep2"), t("searchStep3")],
    },
    {
      icon: "🤝",
      title: t("joinTitle"),
      steps: [t("joinStep1"), t("joinStep2"), t("joinStep3"), t("joinStep4")],
    },
    {
      icon: "🚗",
      title: t("postTitle"),
      steps: [t("postStep1"), t("postStep2"), t("postStep3")],
    },
  ];

  const tips = [t("tip1"), t("tip2"), t("tip3")];

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="bg-gradient-to-br from-brand-50 to-brand-100 px-4 py-10 sm:py-14 text-center">
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-brand-900 mb-2">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-brand-700 max-w-xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {sections.map((section, i) => (
          <div
            key={section.title}
            className="bg-cream-50 border border-gray-100 rounded-xl p-5"
          >
            <h2 className="font-display font-semibold text-base text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">
                {section.icon}
              </span>
              {section.title}
            </h2>
            <ol className="space-y-3">
              {section.steps.map((step, j) => (
                <li key={j} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center mt-0.5">
                    {j + 1}
                  </span>
                  <span className="text-sm text-gray-600 leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}

        <div className="bg-brand-50 border border-brand-100 rounded-xl p-5">
          <h2 className="font-display font-semibold text-base text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              💡
            </span>
            {t("tipsTitle")}
          </h2>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                <span className="text-brand-500 mt-0.5" aria-hidden="true">
                  ✓
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center pt-2">
          <p className="font-display font-semibold text-gray-900 mb-3">
            {t("ctaText")}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/" className="btn-primary text-sm">
              {t("ctaSearch")}
            </Link>
            <Link
              href="/trips/new"
              className="text-sm font-medium text-brand-700 border border-brand-200 rounded-lg px-4 py-2 hover:bg-brand-50 transition-colors"
            >
              {t("ctaPost")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
