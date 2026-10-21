import { createFileRoute } from "@tanstack/react-router";
import { Acceso } from "@/features/auth/Acceso";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acceso · Puerto Marino Trazabilidad" },
      { name: "description", content: "Elige tu estación de planta o el panel web para registrar con trazabilidad HACCP." },
      { property: "og:title", content: "Acceso · Puerto Marino Trazabilidad" },
      { property: "og:description", content: "Elige tu estación de planta o el panel web para registrar con trazabilidad HACCP." },
    ],
  }),
  component: Acceso,
});
