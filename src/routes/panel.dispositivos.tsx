import { createFileRoute } from "@tanstack/react-router";
import { Dispositivos } from "@/features/panel-calidad/Dispositivos";
export const Route = createFileRoute("/panel/dispositivos")({
  head: () => ({
    meta: [
      { title: "Dispositivos y equipos · Puerto Marino" },
      {
        name: "description",
        content: "Registro simulado de computadores, básculas y periféricos de planta.",
      },
      { property: "og:title", content: "Dispositivos y equipos · Puerto Marino" },
      {
        property: "og:description",
        content: "Registro simulado de computadores, básculas y periféricos de planta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dispositivos,
});
