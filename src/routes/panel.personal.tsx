import { createFileRoute } from "@tanstack/react-router";
import { Pendiente } from "@/features/panel-calidad/Pendiente";
export const Route = createFileRoute("/panel/personal")({
  head: () => ({
    meta: [
      { title: "Personal y BPM · Puerto Marino" },
      {
        name: "description",
        content:
          "Personal y BPM del panel de calidad Puerto Marino, pendiente de la siguiente fase.",
      },
      { property: "og:title", content: "Personal y BPM · Puerto Marino" },
      { property: "og:description", content: "Personal y BPM del panel de calidad de la planta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Pendiente />,
});
