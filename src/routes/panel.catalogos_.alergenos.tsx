import { createFileRoute } from "@tanstack/react-router";
import { Alergenos } from "@/features/panel-calidad/Alergenos";
export const Route = createFileRoute("/panel/catalogos_/alergenos")({
  head: () => ({
    meta: [
      { title: "Catálogo de alérgenos · Puerto Marino" },
      {
        name: "description",
        content:
          "Catálogo versionado, perfiles, recetas y rotulado de alérgenos de Puerto Marino.",
      },
      { property: "og:title", content: "Catálogo de alérgenos · Puerto Marino" },
      {
        property: "og:description",
        content: "Catálogo de alérgenos del panel de calidad de la planta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Alergenos,
});
