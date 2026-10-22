import { createFileRoute, notFound } from "@tanstack/react-router";
import { ZONAS } from "@/features/planta/zonas";
import { ZonaVista } from "@/features/planta/ZonaVista";

export const Route = createFileRoute("/planta/$zona")({
  loader: ({ params }) => {
    const z = ZONAS.find((x) => x.id === params.zona);
    if (!z) throw notFound();
    return z;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nombre ?? "Zona"} · Puerto Marino` },
      { name: "description", content: "Vista de zona de la planta Puerto Marino: registro, flujo y lote." },
      { property: "og:title", content: "Vista de zona · Puerto Marino" },
      { property: "og:description", content: "Vista de zona de la planta Puerto Marino: registro, flujo y lote." },
    ],
  }),
  component: ZonaRoute,
});

function ZonaRoute() {
  const z = Route.useLoaderData();
  return <ZonaVista zona={z} />;
}
