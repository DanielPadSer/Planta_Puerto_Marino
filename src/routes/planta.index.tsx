import { createFileRoute } from "@tanstack/react-router";
import { Planta } from "@/features/planta/Planta";

export const Route = createFileRoute("/planta/")({
  head: () => ({
    meta: [
      { title: "Planta completa · Puerto Marino" },
      { name: "description", content: "Mapa isométrico de la planta con zonas, alertas y rutas de proceso." },
      { property: "og:title", content: "Planta completa · Puerto Marino" },
      { property: "og:description", content: "Mapa isométrico de la planta con zonas, alertas y rutas de proceso." },
    ],
  }),
  component: Planta,
});
