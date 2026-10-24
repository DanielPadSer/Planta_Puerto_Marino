import { useEffect, useState } from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, ReferenceArea, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
const config = { temperatura:{ label:"Temperatura", color:"var(--primary)" }, rango:{ label:"Rango permitido", color:"var(--primary-soft)" }, fuera:{ label:"Fuera de rango", color:"var(--destructive)" } } satisfies ChartConfig;
interface Props { room: { id: string; min: number; max: number; temp: number } }
const fmt = (n: number) => n.toLocaleString("es-CO", { maximumFractionDigits:1, minimumFractionDigits:1 });
export function TemperaturaChart({ room }: Props) {
  const [periodo, setPeriodo] = useState("24 h");
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReady(true); const m = window.matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReduced(m.matches); update(); m.addEventListener("change", update); return () => m.removeEventListener("change", update); }, []);
  // Registros y rangos de ejemplo; los valores reales los define la ingeniería de alimentos.
  const dias = periodo === "24 h" ? 1 : periodo === "7 días" ? 7 : 30;
  const data = Array.from({ length:dias * 3 }, (_, i) => {
    const dia = 23 - (dias - 1) + Math.floor(i / 3);
    const fecha = new Date(Date.UTC(2026, 9, dia));
    const hora = ["06:00", "12:00", "18:00"][i % 3] ?? "06:00";
    const temperatura = i === dias * 3 - 2 ? room.temp : room.min + (room.max - room.min) * (0.4 + (dias === 1 ? 0 : Math.sin(i * .7) * .15));
    const fuera = temperatura < room.min || temperatura > room.max;
    const fechaTexto = fecha.toLocaleDateString("es-CO", { day:"2-digit", month:"2-digit", year:"numeric", timeZone:"UTC" });
    return { id:i, etiqueta:dias === 1 ? hora : `${fechaTexto.slice(0,5)} ${hora}`, hora, fecha:fechaTexto, temperatura, fuera, responsable:i % 3 === 1 ? "Carlos Mendoza" : "Luisa Gómez" };
  });
  const values = data.map((d) => d.temperatura);
  const bad = data.filter((d) => d.fuera).length;
  const ultima = data.at(-1);
  const invalid = !Number.isFinite(room.min) || !Number.isFinite(room.max) || room.min >= room.max;
  const margen = Math.max(2, (room.max - room.min) * .12);
  const dot = ({ cx, cy, payload }: { cx?: number; cy?: number; payload?: { fuera:boolean } }) => {
    if (cx === undefined || cy === undefined) return <g />;
    const color = payload?.fuera ? "var(--destructive)" : "var(--primary)";
    return <g>{payload?.fuera && <circle cx={cx} cy={cy} r={9} fill={color} opacity={.12} />}<circle cx={cx} cy={cy} r={payload?.fuera ? 5 : 3.5} fill={color} stroke="var(--surface)" strokeWidth={1.5} /></g>;
  };
  return <>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2>{room.id} · Temperatura de {periodo === "24 h" ? "las últimas 24 h" : `los últimos ${periodo}`}</h2><p className="text-xs text-muted-foreground mt-1">Banda permitida: {room.min} a {room.max} °C</p></div><ToggleGroup type="single" value={periodo} onValueChange={(v) => { if (v) setPeriodo(v); }} aria-label="Periodo de registros">{["24 h","7 días","30 días"].map((v) => <ToggleGroupItem key={v} value={v} className="min-h-12 min-w-12 px-3 text-xs">{v}</ToggleGroupItem>)}</ToggleGroup></div>
    <div className="monitor-summary mt-5 border-y py-3">{[["Última lectura", ultima ? `${fmt(ultima.temperatura)} °C` : "—"], ["Mínima", `${fmt(Math.min(...values))} °C`], ["Máxima", `${fmt(Math.max(...values))} °C`], ["Promedio", `${fmt(values.reduce((s,n) => s+n,0) / values.length)} °C`], ["% del tiempo en rango", `${fmt((data.length-bad)/data.length*100)} %`], ["Lecturas fuera de rango", String(bad)]].map(([label, value]) => <div key={label}><span className="text-muted-foreground text-[10px]">{label}</span><b className={`block font-mono text-sm mt-1 ${label === "Lecturas fuera de rango" && bad ? "text-danger" : "text-foreground"}`}>{value}</b></div>)}</div>
    <p className="text-[10px] text-muted-foreground mt-2">Proporción estimada a partir de registros de operarios · sin sensores continuos</p>
    {!ready ? <Skeleton className="h-[300px] w-full mt-4" aria-label="Cargando registros de temperatura" /> : invalid ? <div role="alert" className="empty-state">No se puede mostrar la gráfica: revisa el rango del cuarto.<Button variant="outline" onClick={() => setReady(true)} className="min-h-12 ml-3">Reintentar</Button></div> : !data.length ? <p className="empty-state">No hay registros para este periodo.</p> : <ChartContainer config={config} className="monitor-chart mt-4 h-[300px] w-full aspect-auto" aria-label={`Gráfica de temperatura ${room.id}`}>
      <AreaChart data={data} margin={{ left:0, right:30, top:20, bottom:0 }}>
        <defs><linearGradient id={`temp-fill-${room.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={.15} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
        <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} minTickGap={45} tickMargin={12} />
        <YAxis width={56} tickLine={false} axisLine={false} domain={[Math.min(room.min,...values)-margen, Math.max(room.max,...values)+margen]} tickFormatter={(n: number) => `${n.toLocaleString("es-CO")} °C`} />
        <ReferenceArea y1={room.min} y2={room.max} fill="var(--primary)" fillOpacity={.09} />
        <ReferenceLine y={room.min} stroke="var(--primary)" strokeOpacity={.4} strokeDasharray="4 4" label={{ value:`Mín ${room.min} °C`, position:"insideBottomRight", fill:"var(--muted-foreground)", fontSize:10 }} />
        <ReferenceLine y={room.max} stroke="var(--primary)" strokeOpacity={.4} strokeDasharray="4 4" label={{ value:`Máx ${room.max} °C`, position:"insideTopRight", fill:"var(--muted-foreground)", fontSize:10 }} />
        <ChartTooltip cursor={{ stroke:"var(--border)", strokeDasharray:"3 3" }} content={<ChartTooltipContent labelFormatter={(_, p) => { const item = p[0]?.payload as { fecha?:string; hora?:string } | undefined; return `${item?.fecha ?? ""} · ${item?.hora ?? ""}`; }} formatter={(value, _, item) => { const d = item.payload as { fuera?:boolean; responsable?:string }; return <div className="space-y-1"><strong className={d.fuera ? "text-danger" : "text-primary"}>{fmt(Number(value))} °C · {d.fuera ? "Fuera de rango" : "Conforme"}</strong><p className="text-muted-foreground">{d.responsable}</p></div>; }} />} />
        <Area key={`${room.id}-${periodo}-${room.min}-${room.max}`} type="monotone" dataKey="temperatura" stroke="var(--primary)" strokeWidth={2.5} fill={`url(#temp-fill-${room.id})`} dot={dot} activeDot={{ r:6, stroke:"var(--primary-soft)", strokeWidth:4 }} isAnimationActive={!reduced} animationDuration={900} animationEasing="ease-out" />
        <ChartLegend content={<ChartLegendContent payload={[{ value:"temperatura", color:"var(--primary)" }, { value:"rango", color:"var(--primary-soft)" }, { value:"fuera", color:"var(--destructive)" }]} />} />
      </AreaChart>
    </ChartContainer>}
  </>;
}