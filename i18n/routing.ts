import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  // Todos los visitantes nuevos entran en inglés (sin detectar el idioma del navegador).
  // El usuario sigue pudiendo cambiar a español manualmente desde el navbar.
  localeDetection: false,
});
