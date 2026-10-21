import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { ZONAS } from "@/features/planta/zonas";
import { Circulo } from "@/ui/marca";

export const Route = createFileRoute("/planta/$zona")({
  loader: ({ params }) => {
    const z = ZONAS.find((x) => x.id === params.zona);
    if (!z) throw notFound();
    return z;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nombre ?? "Zona"} · Puerto Marino` },
      { name: "description", content: "Vista de zona de la planta Puerto Marino." },
      { property: "og:title", content: "Vista de zona · Puerto Marino" },
      { property: "og:description", content: "Vista de zona de la planta Puerto Marino." },
    ],
  }),
  component: ZonaVista,
});

function ZonaVista() {
  const z = Route.useLoaderData();
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass w-full max-w-lg rounded-[var(--radius-panel)] p-8 text-center">
        <div className="flex justify-center"><Circulo codigo={z.codigo} color={z.color} size={56} /></div>
        <h1 className="mt-4 text-2xl font-bold">{z.nombre}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Esta vista de zona llegará en la siguiente fase.</p>
        <Link to="/planta" className="tap mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground"><ChevronLeft size={20} /> Volver a la planta</Link>
      </div>
    </div>
  );
}
