import { createFileRoute } from "@tanstack/react-router";
import { Personal } from "@/features/panel-calidad/Personal";
export const Route = createFileRoute("/panel/personal")({
  head: () => ({
    meta: [
      { title: "Personal y BPM · Puerto Marino" },
      {
        name: "description",
        content:
          "Vigencia documental, controles de turno y plantillas BPM de Puerto Marino.",
      },
      { property: "og:title", content: "Personal y BPM · Puerto Marino" },
      { property: "og:description", content: "Personal y BPM del panel de calidad de la planta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Personal,
});
