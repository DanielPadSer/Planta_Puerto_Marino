import { createFileRoute } from "@tanstack/react-router";
import { ModeloDatos } from "@/features/modelo-datos/ModeloDatos";
export const Route = createFileRoute("/panel/modelo-datos")({
  head: () => ({
    meta: [
      { title: "Modelo de datos · Puerto Marino" },
      { name: "description", content: "Tablas, relaciones, trazabilidad e integridad del modelo de datos de la planta." },
      { property: "og:title", content: "Modelo de datos · Puerto Marino" },
      { property: "og:description", content: "Tablas, relaciones, trazabilidad e integridad del modelo de datos de la planta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ModeloDatos,
});
