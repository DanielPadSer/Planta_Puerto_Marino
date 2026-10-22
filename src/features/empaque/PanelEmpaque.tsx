import { useEffect, useState } from "react";
import { Calendar, Check, Printer, RefreshCw } from "lucide-react";
import { calcularVencimiento, fechaCorta, kg, VIDA_UTIL_DIAS } from "@/domain/reglas";
import { Aviso, BotonPrincipal, Ejemplo, PanelCuerpo, Seccion, Stepper } from "@/features/planta/panelUi";

const HOY = "2026-09-24";
const LOTES = {
  cocido: { codigo: "LC-0245-A", producto: "Filete mojarra cocido", kg: 48.6 },
  marinado: { codigo: "LM-0246-A", producto: "Filete mojarra marinado", kg: 36.2 },
} as const;

export function PanelEmpaque({ color }: { color: string }) {
  const [ruta, setRuta] = useState<"cocido" | "marinado">("cocido");
  const [porciones, setPorciones] = useState(12);
  const [gramos, setGramos] = useState(250);
  const [impresas, setImpresas] = useState(0);
  const [imprimiendo, setImprimiendo] = useState(false);
  const lote = LOTES[ruta];
  const total = (porciones * gramos) / 1000;
  const excede = total > lote.kg;
  const vence = calcularVencimiento(HOY, VIDA_UTIL_DIAS[ruta]);
  const desde = 17;

  useEffect(() => {
    if (!imprimiendo) return;
    if (impresas >= porciones) { setImprimiendo(false); return; }
    const t = setTimeout(() => setImpresas((n) => n + 1), 250);
    return () => clearTimeout(t);
  }, [imprimiendo, impresas, porciones]);

  const pt = (n: number) => `PT-0245-${String(desde + n).padStart(3, "0")}`;

  return (
    <PanelCuerpo accion={
      <BotonPrincipal color={color} disabled={excede || imprimiendo || porciones === 0} onClick={() => { setImpresas(0); setImprimiendo(true); }}>
        <Printer size={20} /> {imprimiendo ? `Imprimiendo ${impresas}/${porciones}…` : `Imprimir ${porciones} etiquetas (PT-0245)`}
      </BotonPrincipal>
    }>
      <div className="space-y-3">
        <Seccion n={1} titulo="Lote de entrada" extra={
          <button onClick={() => { setRuta(ruta === "cocido" ? "marinado" : "cocido"); setImpresas(0); }} className="flex min-h-10 items-center gap-1 text-[11px] font-medium text-primary"><RefreshCw size={14} /> Cambiar a {LOTES[ruta === "cocido" ? "marinado" : "cocido"].codigo}</button>
        }>
          <p className="font-mono text-sm font-bold"><span className="mr-1 inline-block size-2 rounded-full" style={{ background: ruta === "cocido" ? "#F97316" : "#F43F5E" }} />{lote.codigo}</p>
          <p className="text-xs text-muted-foreground">{lote.producto} · {kg(lote.kg)} kg · ruta {ruta}</p>
        </Seccion>

        <Seccion n={2} titulo="Equipo y porciones" activa extra={<span className="flex items-center gap-1 font-mono text-[10px] text-ok">Selladora 1 · Limpieza 07:10 <Check size={10} /></span>}>
          <div className="flex items-center justify-between rounded-2xl bg-muted p-3">
            <span className="text-xs text-muted-foreground">Porciones a empacar</span>
            <Stepper valor={porciones} onChange={(v) => { setPorciones(v); setImpresas(0); }} max={200} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-muted p-3">
              <p className="text-[10px] text-muted-foreground">PESO POR PORCIÓN</p>
              <div className="mt-1 flex items-center gap-1"><input value={gramos} onChange={(e) => setGramos(Number(e.target.value.replace(/\D/g, "")) || 0)} inputMode="numeric" className="h-10 w-20 rounded-lg border bg-surface px-2 font-mono text-lg font-bold" /> <span className="font-mono">g</span></div>
            </div>
            <div className="rounded-2xl bg-muted p-3">
              <p className="text-[10px] text-muted-foreground">TOTAL DE LA TANDA</p>
              <p className="mt-1 font-mono text-xl font-bold" style={{ color: excede ? "var(--destructive)" : "#B88200" }}>{kg(total)} kg</p>
            </div>
          </div>
          {excede && <div className="mt-2"><Aviso tono="danger">La tanda supera el saldo del lote ({kg(lote.kg)} kg).</Aviso></div>}
        </Seccion>

        <Seccion n={3} titulo="Vencimiento e impresión" extra={<span className="font-mono text-[10px] text-muted-foreground">Zebra ZD421</span>}>
          <div className="rounded-xl border p-3">
            <p className="flex items-center gap-2 font-semibold"><Calendar size={20} /> Vence {fechaCorta(vence)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Calculado con la vida útil configurada: {VIDA_UTIL_DIAS[ruta]} días en refrigeración (0 °C a 4 °C).</p>
          </div>
          <div className="mt-3 flex justify-between text-[11px]"><span>Cola de impresión</span><span className="font-mono text-ok">{impresas} de {porciones} etiquetas</span></div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full transition-all" style={{ width: `${porciones ? (impresas / porciones) * 100 : 0}%`, background: "var(--primary)" }} /></div>
          <p className="mt-2 inline-block rounded-lg bg-muted px-2 py-1 font-mono text-[10px]">{pt(0)} a {pt(Math.max(0, porciones - 1))}</p>
          <div className="mt-2 rounded-xl border-2 border-dashed p-3 font-mono text-[10px]">
            <p className="font-bold">PUERTO MARINO</p>
            <p>{lote.producto} · {gramos} g</p>
            <p>{pt(0)} · Lote {lote.codigo}</p>
            <p>Vence {fechaCorta(vence)} · Conservar 0–4 °C</p>
          </div>
        </Seccion>
        <Ejemplo />
      </div>
    </PanelCuerpo>
  );
}
