import { createFileRoute } from "@tanstack/react-router";
import { SinAcceso } from "@/features/panel-calidad/SinAcceso";
export const Route = createFileRoute("/panel/sin-acceso")({
  head: () => ({
    meta: [
      { title: "Sin acceso · Puerto Marino" },
      { name: "description", content: "Sección no disponible para el rol actual del panel Puerto Marino." },
      { property: "og:title", content: "Sin acceso · Puerto Marino" },
      { property: "og:description", content: "Control de acceso por rol en el panel de calidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SinAcceso,
});
