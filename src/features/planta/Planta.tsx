import { lazy, Suspense, useState } from "react";
import { ClientOnly, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Bell, Camera, ChevronLeft, Layers, List, Map as MapIcon, ScanLine, Search, Siren, TrendingUp } from "lucide-react";
import { ALERTAS, OPERARIO_DEMO } from "@/mocks/estaciones";
import type { FiltroRuta, ZonaId } from "@/domain/types";
import { useSesion } from "@/features/auth/store";
import { PillConexion } from "@/ui/marca";
import { cn } from "@/lib/utils";
import { RUTA_COCIDO, RUTA_MARINADO, ZONAS } from "./zonas";

const Planta3D = lazy(() => import("./Planta3D"));

const SOLO_COCIDO: ZonaId[] = ["marinado", "cf3"];
const SOLO_MARINADO: ZonaId[] = ["coccion", "cf2"];
const ROLES: Record<string, string> = { operario: "Operario", supervisor: "Supervisor", limpieza: "Encargada de limpieza", ingeniera: "Ingeniera de alimentos", sede: "Sede", administrador: "Administrador" };

export function Planta() {
  const op = useSesion((s) => s.operario) ?? OPERARIO_DEMO;
  const [filtro, setFiltro] = useState<FiltroRuta>("todo");
  const [tab, setTab] = useState<"resumen" | "preguntas" | "rutas">("resumen");
  const navigate = useNavigate();

  const atenuada = (id: ZonaId) => (filtro === "cocido" && SOLO_COCIDO.includes(id)) || (filtro === "marinado" && SOLO_MARINADO.includes(id));

  return (
    <div className="relative h-screen min-h-[720px] overflow-hidden bg-background">
      <ClientOnly><Suspense fallback={null}>
        <Planta3D zona={null} onSeleccionar={(z) => navigate({ to: "/planta/$zona", params: { zona: z } })}
          atenuadas={ZONAS.map((z) => z.id).filter(atenuada)}
          estados={Object.fromEntries(ZONAS.filter((z) => z.estado || z.alerta).map((z) => [z.id, { texto: z.estado?.texto ?? "", tono: z.estado?.tono ?? "warn", alerta: z.alerta }]))} />
      </Suspense></ClientOnly>

      {/* Barra superior */}
      <header className="absolute inset-x-4 top-4 flex items-center gap-3">
        <Link to="/" aria-label="Volver" className="glass tap grid place-items-center rounded-full"><ChevronLeft size={20} /></Link>
        <div className="glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4">
          <span className="grid size-9 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">PM</span>
          <div><p className="text-sm font-semibold leading-tight">Puerto Marino · Planta</p><p className="text-[11px] text-muted-foreground">Planta completa</p></div>
        </div>
        <div className="glass mx-auto flex rounded-full p-1">
          {(["todo", "cocido", "marinado"] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)} className={cn("tap rounded-full px-5 text-sm font-medium capitalize", filtro === f ? "bg-primary-soft text-primary" : "text-muted-foreground")}>{f === "todo" ? "Todo" : f === "cocido" ? "Cocido" : "Marinado"}</button>
          ))}
        </div>
        <PillConexion className="glass hidden py-3 lg:inline-flex" />
        <button aria-label="Notificaciones" className="glass tap relative grid place-items-center rounded-full"><Bell size={20} /><span className="absolute right-3 top-3 size-2 rounded-full bg-danger" /></button>
        <div className="glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4">
          <span className="grid size-9 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">{op.iniciales}</span>
          <div className="hidden xl:block"><p className="text-sm font-semibold leading-tight">{ROLES[op.rol]}</p><p className="text-[11px] text-muted-foreground">{op.turno}</p></div>
        </div>
      </header>

      {/* Rail izquierdo */}
      <nav className="absolute left-4 top-1/2 flex -translate-y-1/2 flex-col gap-3">
        {([[Layers, "Capas", false], [ScanLine, "Escanear", false], [List, "Lotes", false], [Siren, "Alertas", true]] as const).map(([Icon, l, dot]) => (
          <button key={l} className="flex flex-col items-center gap-1 text-[11px] font-medium">
            <span className="glass relative grid size-14 place-items-center rounded-full"><Icon size={20} />{dot && <span className="absolute right-2 top-2 size-2.5 rounded-full bg-danger" />}</span>{l}
          </button>
        ))}
      </nav>

      {/* Panel derecho */}
      <aside className="glass absolute bottom-4 right-4 top-24 flex w-[340px] flex-col rounded-[var(--radius-panel)] p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><MapIcon size={20} /></span>
          <div className="flex-1"><p className="font-semibold">Planta Puerto Marino</p><p className="text-[11px] text-muted-foreground">Toca una zona del mapa para entrar</p></div>
          <span className="rounded-full bg-muted px-2 py-1 font-mono text-[10px]">11 zonas</span>
        </div>
        <div className="mt-3 flex gap-4 border-b text-sm">
          {(["resumen", "preguntas", "rutas"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 pb-2 capitalize", tab === t ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground")}>{t}</button>
          ))}
        </div>
        <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
          {tab === "resumen" && <>
            <div className="rounded-2xl border border-danger/30 bg-danger/5 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle size={16} className="text-danger" /> 5A CF-2 Terminado <span className="rounded-full bg-danger/12 px-1.5 font-mono text-[9px] text-danger">ALERTA TEMP</span></p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">Temp: 5,4 °C (límite 4,0 °C) · Lote PM-8921</p>
            </div>
            <label className="flex h-12 items-center gap-2 rounded-2xl border bg-surface px-3 text-sm text-muted-foreground">
              <Search size={20} /><input className="flex-1 bg-transparent outline-none" placeholder="Buscar o escanear un lote o paquete" /><Camera size={20} />
            </label>
            <div>
              <p className="font-mono text-[10px] font-semibold text-muted-foreground">HOY EN PLANTA</p>
              <div className="mt-1 grid grid-cols-3 gap-2 text-center">
                {([["12", "lotes en proceso", "text-foreground"], ["3", "alertas abiertas", "text-warn"], ["58", "paquetes despachados", "text-ok"]] as const).map(([n, l, c]) => (
                  <div key={l} className="rounded-xl bg-muted p-2"><p className={cn("text-2xl font-bold", c)}>{n}</p><p className="text-[10px] text-muted-foreground">{l}</p></div>
                ))}
              </div>
            </div>
            <div>
              <p className="flex justify-between font-mono text-[10px] font-semibold text-muted-foreground">ALERTAS ABIERTAS <span className="text-danger">PRIORIDAD ALTA</span></p>
              {ALERTAS.map((a) => (
                <div key={a.id} className="flex items-center gap-2 border-b py-2 text-xs last:border-0">
                  <span className={cn("size-2 rounded-full", a.tono === "danger" ? "bg-danger" : "bg-warn")} /><span className="flex-1">{a.texto}</span><span className="font-mono text-muted-foreground">{a.hora}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold text-muted-foreground">ENTRAR A UNA ZONA</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {ZONAS.map((z) => (
                  <Link key={z.id} to="/planta/$zona" params={{ zona: z.id }} className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary-foreground" style={{ background: z.color }}>{z.codigo} {z.nombre.split(" ")[0]}</Link>
                ))}
              </div>
            </div>
          </>}
          {tab === "preguntas" && <ul className="space-y-2 text-sm">{["¿Dónde está el lote PM-8921?", "¿Qué equipos esperan liberación?", "¿Qué lotes están en cuarentena?"].map((q) => <li key={q} className="rounded-xl bg-muted p-3">{q}</li>)}</ul>}
          {tab === "rutas" && <Rutas />}
        </div>
        <button className="tap mt-3 flex items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground shadow-[var(--shadow-primary)]"><TrendingUp size={20} /> Seguir un lote en el mapa</button>
      </aside>

      <div className="glass absolute bottom-4 left-4 hidden w-[340px] rounded-[var(--radius-card)] p-4 2xl:block"><Rutas /></div>
    </div>
  );
}

function Rutas() {
  return (
    <div>
      <p className="font-mono text-[10px] font-semibold text-muted-foreground">RUTAS DE PROCESO</p>
      {([["Ruta cocido", RUTA_COCIDO, "#F97316"], ["Ruta marinado", RUTA_MARINADO, "#6366F1"]] as const).map(([n, r, c]) => (
        <p key={n} className="mt-2 flex items-center gap-2 text-xs">
          <span className="size-2.5 rounded-full" style={{ background: c }} /><span className="font-semibold" style={{ color: c }}>{n}:</span>
          <span className="font-mono">{r.join(" → ")}</span>
        </p>
      ))}
      <p className="mt-2 text-[10px] text-muted-foreground">* 3A/3B y 5A/5B son alternativas: cada producto pasa por una sola.</p>
    </div>
  );
}
