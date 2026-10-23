import { createFileRoute } from "@tanstack/react-router";
import { Catalogos } from "@/features/panel-calidad/Catalogos";
export const Route = createFileRoute("/panel/catalogos")({
  validateSearch: (search: Record<string, unknown>): { catalogo?: string } =>
    typeof search["catalogo"] === "string" ? { catalogo: search["catalogo"] } : {},
  head: () => ({
    meta: [
      { title: "Catálogos de planta · Puerto Marino" },
      {
        name: "description",
        content: "Contenedores, taras y datos base de la planta Puerto Marino.",
      },
      { property: "og:title", content: "Catálogos de planta · Puerto Marino" },
      {
        property: "og:description",
        content: "Catálogos y tara versionada de los contenedores de planta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Screen,
});
function Screen() {
  const { catalogo } = Route.useSearch();
  return <Catalogos key={catalogo} initial={catalogo ?? "Contenedores y tara"} />;
}
