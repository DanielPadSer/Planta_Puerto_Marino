import { lazy, Suspense, useMemo } from "react";
import { ClientOnly, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import type { ZonaId } from "@/domain/types";
import { ZONAS } from "./zonas";
import { useVista3D } from "./vista3d";

const Planta3D = lazy(() => import("./Planta3D"));

/** Mantiene montada la maqueta 3D mientras se navega entre la planta y sus estaciones. */
export function PlantaLayout() {
  const params = useParams({ strict: false }) as { zona?: string };
  const zona = (ZONAS.find((z) => z.id === params.zona)?.id ?? null) as ZonaId | null;
  const atenuadas = useVista3D((s) => s.atenuadas);
  const navigate = useNavigate();
  const estados = useMemo(() => Object.fromEntries(ZONAS.filter((z) => z.estado || z.alerta)
    .map((z) => [z.id, { texto: z.estado?.texto ?? "", tono: z.estado?.tono ?? "warn", alerta: z.alerta }])), []);

  return (
    <div className="relative h-screen min-h-[720px] overflow-hidden bg-background">
      <ClientOnly><Suspense fallback={null}>
        <Planta3D zona={zona} atenuadas={zona ? [] : atenuadas} estados={zona ? {} : estados}
          onSeleccionar={(z) => navigate({ to: "/planta/$zona", params: { zona: z } })} />
      </Suspense></ClientOnly>
      <Outlet />
    </div>
  );
}
