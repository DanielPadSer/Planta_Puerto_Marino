import { createFileRoute } from "@tanstack/react-router";
import { Historial } from "@/features/panel-calidad/Historial";
export const Route = createFileRoute("/panel/historial")({
  head: () => ({
    meta: [
      { title: "Historial de cambios · Puerto Marino" },
      {
        name: "description",
        content: "Auditoría de solo lectura de cambios y versiones de calidad.",
      },
      { property: "og:title", content: "Historial de cambios · Puerto Marino" },
      {
        property: "og:description",
        content: "Auditoría de solo lectura de cambios y versiones de calidad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Historial,
});
