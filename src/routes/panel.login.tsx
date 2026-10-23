import { createFileRoute } from "@tanstack/react-router";
import { PanelLogin } from "@/features/panel-calidad/PanelLogin";
export const Route = createFileRoute("/panel/login")({
  head: () => ({
    meta: [
      { title: "Acceso al Panel Web · Puerto Marino" },
      {
        name: "description",
        content: "Acceso simulado de ingeniería de alimentos al panel de calidad Puerto Marino.",
      },
      { property: "og:title", content: "Acceso al Panel Web · Puerto Marino" },
      {
        property: "og:description",
        content: "Control de calidad, reglas HACCP y trazabilidad para Puerto Marino.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PanelLogin,
});
