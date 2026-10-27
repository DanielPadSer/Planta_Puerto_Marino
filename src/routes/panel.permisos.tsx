import { createFileRoute } from "@tanstack/react-router";
import { Permisos } from "@/features/panel-calidad/Permisos";
export const Route = createFileRoute("/panel/permisos")({
  head: () => ({
    meta: [
      { title: "Permisos por rol · Puerto Marino" },
      { name: "description", content: "Matriz de permisos por rol del panel de calidad Puerto Marino." },
      { property: "og:title", content: "Permisos por rol · Puerto Marino" },
      { property: "og:description", content: "Matriz de acceso de ingeniera, supervisor y administrador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Permisos,
});
