import { createFileRoute } from "@tanstack/react-router";
import { Reportes } from "@/features/panel-calidad/Reportes";
export const Route = createFileRoute("/panel/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes de calidad · Puerto Marino" },
      {
        name: "description",
        content: "Mermas, pesajes e indicadores del proceso de Puerto Marino.",
      },
      { property: "og:title", content: "Reportes de calidad · Puerto Marino" },
      {
        property: "og:description",
        content: "Mermas, pesajes e indicadores del proceso de Puerto Marino.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reportes,
});
