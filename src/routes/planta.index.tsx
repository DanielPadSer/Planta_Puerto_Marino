import { createFileRoute } from "@tanstack/react-router";
import { Planta } from "@/features/planta/Planta";

export const Route = createFileRoute("/planta/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Planta completa · Puerto Marino" },
      { name: "description", content: "Mapa isométrico de la planta con zonas, alertas y rutas de proceso." },
      { property: "og:title", content: "Planta completa · Puerto Marino" },
      { property: "og:description", content: "Mapa isométrico de la planta con zonas, alertas y rutas de proceso." },
    ],
  }),
  component: Planta,
});
