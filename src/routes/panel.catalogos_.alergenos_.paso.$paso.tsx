import { createFileRoute, notFound } from "@tanstack/react-router";
import { Alergenos } from "@/features/panel-calidad/Alergenos";
const nombres = [
  "Catálogo",
  "Perfiles",
  "Recetas y kits",
  "Etiqueta y trazas",
  "Trazabilidad e impacto",
];
export const Route = createFileRoute("/panel/catalogos_/alergenos_/paso/$paso")({
  beforeLoad: ({ params }) => {
    if (!/^[1-5]$/.test(params.paso)) throw notFound();
  },
  head: ({ params }) => {
    const nombre = nombres[Number(params.paso) - 1] ?? "Alérgenos";
    const title = `${nombre} de alérgenos · Puerto Marino`;
    const description = `Paso ${params.paso} de Alérgenos: ${nombre.toLowerCase()} con versiones auditadas y datos simulados.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Screen,
});
function Screen() {
  const { paso } = Route.useParams();
  return <Alergenos paso={Number(paso)} />;
}
