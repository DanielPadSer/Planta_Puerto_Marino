import { createFileRoute, notFound } from "@tanstack/react-router";
import { buscarEstacion, Pin } from "@/features/auth/Pin";

export const Route = createFileRoute("/pin/$estacion")({
  loader: ({ params }) => {
    const e = buscarEstacion(params.estacion);
    if (!e) throw notFound();
    return e;
  },
  head: ({ loaderData }) => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: `PIN · ${loaderData?.nombre ?? "Estación"} · Puerto Marino` },
      { name: "description", content: "Ingresa con tu PIN de operario para registrar en la estación." },
      { property: "og:title", content: "Ingreso con PIN · Puerto Marino" },
      { property: "og:description", content: "Ingresa con tu PIN de operario para registrar en la estación." },
    ],
  }),
  component: PinRoute,
});

function PinRoute() {
  const e = Route.useLoaderData();
  return <Pin key={e.id} estacion={e} />;
}
