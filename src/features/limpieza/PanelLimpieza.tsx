import { useState } from "react";
import { AlertTriangle, Check, CheckCircle2, ShieldCheck } from "lucide-react";
import { CATEGORIA_TEXTO, esCambioAlergeno, nivelExigido, NIVELES, PASOS_POE, type Categoria, type EstadoEquipo } from "@/domain/reglas";
import { Chip } from "@/ui/marca";
import { Aviso, BotonPrincipal, Ejemplo, PanelCuerpo, Seccion } from "@/features/planta/panelUi";
import { cn } from "@/lib/utils";

interface Equipo { id: string; nombre: string; detalle: string; estado: EstadoEquipo; anterior: Categoria }
const EQUIPOS: Equipo[] = [
  { id: "m1", nombre: "Marmita 1", detalle: "250 L", estado: "Liberado", anterior: "pescado" },
  { id: "m2", nombre: "Marmita 2", detalle: "250 L (Lote Pollo #209)", estado: "En limpieza", anterior: "ave" },
  { id: "h1", nombre: "Horno 1", detalle: "Convección", estado: "Liberado", anterior: "pescado" },
  { id: "mr1", nombre: "Marinador 1", detalle: "Tambor 80 L", estado: "Por verificar", anterior: "crustaceos" },
  { id: "s1", nombre: "Selladora 1", detalle: "Vacío", estado: "En uso", anterior: "pescado" },
  { id: "t1", nombre: "Tina enfriamiento", detalle: "400 L", estado: "Fuera de servicio", anterior: "pescado" },
];
const FASES: EstadoEquipo[] = ["Usado", "En limpieza", "Por verificar", "Liberado"];
const tonoEstado = (e: EstadoEquipo) => (e === "Liberado" ? "bg-ok" : e === "Fuera de servicio" ? "bg-danger" : e === "En uso" ? "bg-primary" : "bg-warn");
const CATS = Object.keys(CATEGORIA_TEXTO) as Categoria[];

export function PanelLimpieza({ color }: { color: string }) {
  const [equipos, setEquipos] = useState(EQUIPOS);
  const [selId, setSelId] = useState("m2");
  const eq = equipos.find((e) => e.id === selId) ?? equipos[0]!;
  const [siguiente, setSiguiente] = useState<Categoria>("pescado");
  const [hechos, setHechos] = useState<Record<string, boolean>>({});
  const [ppm, setPpm] = useState("200");
  const [contacto, setContacto] = useState("10");

  const nivel = nivelExigido(eq.anterior, siguiente);
  const alergeno = esCambioAlergeno(eq.anterior, siguiente);
  const pasos = PASOS_POE[nivel];
  const completados = pasos.filter((p) => hechos[`${eq.id}-${p}`]).length;
  const listo = completados === pasos.length && Number(ppm) > 0 && Number(contacto) > 0;
  const setEstado = (estado: EstadoEquipo) => setEquipos(equipos.map((e) => (e.id === eq.id ? { ...e, estado } : e)));

  const accion = eq.estado === "Por verificar"
    ? <BotonPrincipal color={color} onClick={() => setEstado("Liberado")}><ShieldCheck size={20} /> Verificar y liberar equipo</BotonPrincipal>
    : <BotonPrincipal color={color} disabled={!listo || eq.estado !== "En limpieza"} onClick={() => setEstado("Por verificar")}><ShieldCheck size={20} /> Enviar a verificación</BotonPrincipal>;

  return (
    <PanelCuerpo accion={accion}>
      <div className="space-y-3">
        <div>
          <p className="mb-2 flex justify-between font-mono text-[11px] font-semibold">SELECCIONAR EQUIPO <span className="font-normal text-muted-foreground">{equipos.length} equipos planta</span></p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {equipos.map((e) => (
              <button key={e.id} onClick={() => setSelId(e.id)} className={cn("tap shrink-0 rounded-xl border-2 px-3 py-2 text-left text-xs", selId === e.id ? "bg-surface" : "border-transparent bg-muted")} style={selId === e.id ? { borderColor: color } : undefined}>
                <p className="flex items-center gap-1.5 font-semibold"><span className={cn("size-2 rounded-full", tonoEstado(e.estado))} />{e.nombre}</p>
                <p className="text-[10px] text-muted-foreground">{e.estado}</p>
              </button>
            ))}
          </div>
        </div>

        <Seccion n={1} titulo={`${eq.nombre} · ${eq.detalle}`} extra={<span className="font-mono text-[10px]" style={{ color }}>Fase activa</span>}>
          <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
            {FASES.map((f, i) => (
              <span key={f} className={cn("flex items-center gap-1", f === eq.estado ? "font-bold" : FASES.indexOf(eq.estado) > i ? "text-ok" : "text-muted-foreground")}>
                {f === eq.estado && <span className={cn("size-2 rounded-full", tonoEstado(f))} />}{f}{FASES.indexOf(eq.estado) > i && <Check size={10} />}{i < 3 && <span className="text-muted-foreground"> › </span>}
              </span>
            ))}
          </div>
          {eq.estado === "Usado" || eq.estado === "Liberado" ? (
            <button onClick={() => { setEstado("En limpieza"); setHechos({}); }} className="tap mt-2 w-full rounded-xl bg-muted text-sm font-medium">Iniciar limpieza</button>
          ) : null}
          {eq.estado === "Fuera de servicio" && <div className="mt-2"><Aviso tono="danger">Equipo fuera de servicio: mantenimiento debe habilitarlo.</Aviso></div>}
        </Seccion>

        <Seccion n={2} titulo="Nivel de limpieza exigido" activa>
          <div className="grid grid-cols-4 gap-1">
            {NIVELES.map((n) => (
              <span key={n} className={cn("grid h-10 place-items-center rounded-xl font-mono text-sm font-bold", n === nivel ? "text-primary-foreground" : "bg-muted text-muted-foreground")} style={n === nivel ? { background: color } : undefined}>{n}</span>
            ))}
          </div>
          <div className="mt-2 rounded-xl border p-2 text-xs" style={{ borderColor: color }}>
            <p className="flex items-center justify-between gap-2"><span>{CATEGORIA_TEXTO[eq.anterior]} seguido de {CATEGORIA_TEXTO[siguiente]} exige <b>{nivel}</b></span>
              {alergeno && <Chip tono="danger"><AlertTriangle size={10} /> Riesgo alérgeno</Chip>}</p>
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="rounded-lg bg-muted px-2 py-1">Lote anterior: {CATEGORIA_TEXTO[eq.anterior]}</span> ›
              <select value={siguiente} onChange={(e) => setSiguiente(e.target.value as Categoria)} className="h-10 rounded-lg border bg-surface px-2">
                {CATS.map((c) => <option key={c} value={c}>Siguiente: {CATEGORIA_TEXTO[c]}</option>)}
              </select>
            </div>
          </div>
          {alergeno && <p className="mt-2 text-[11px] text-danger">Cambio desde o hacia crustáceos y moluscos: N3 sin excepción.</p>}
        </Seccion>

        <Seccion n={3} titulo="Registro de limpieza" extra={<span className="font-mono text-[11px]" style={{ color }}>{completados} de {pasos.length}</span>}>
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full transition-all" style={{ width: `${(completados / pasos.length) * 100}%`, background: color }} /></div>
          <div className="space-y-1">
            {pasos.map((p) => {
              const k = `${eq.id}-${p}`;
              return (
                <label key={k} className="flex min-h-10 items-center gap-2 rounded-lg bg-muted px-2 text-xs">
                  <input type="checkbox" disabled={eq.estado !== "En limpieza"} checked={!!hechos[k]} onChange={(e) => setHechos({ ...hechos, [k]: e.target.checked })} className="size-5 accent-[var(--ok)]" /> {p}
                </label>
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            <label>Desinfectante (ppm)<input value={ppm} onChange={(e) => setPpm(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="tap mt-1 w-full rounded-xl border px-3 font-mono" /></label>
            <label>Tiempo de contacto (min)<input value={contacto} onChange={(e) => setContacto(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="tap mt-1 w-full rounded-xl border px-3 font-mono" /></label>
          </div>
        </Seccion>
        {eq.estado === "Por verificar" && <Aviso tono="warn">La verificación la hace la encargada de limpieza; puede ser la misma persona que limpió.</Aviso>}
        {eq.estado === "Liberado" && <p className="flex items-center gap-2 rounded-xl bg-ok/10 p-3 text-sm font-medium text-ok"><CheckCircle2 size={20} /> {eq.nombre} liberado para producción.</p>}
        <Ejemplo />
      </div>
    </PanelCuerpo>
  );
}
