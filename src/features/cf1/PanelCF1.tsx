import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Lock, ScanLine, Scale } from "lucide-react";
import { estaVencido, fechaCorta, kg, redondear, sugerirFEFO, type LoteStock } from "@/domain/reglas";
import { Chip } from "@/ui/marca";
import { Aviso, BotonPrincipal, Ejemplo, PanelCuerpo, Seccion, Segmentado } from "@/features/planta/panelUi";
import { useScale } from "@/features/recepcion/useScale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { validarPesoCF1, autorizarManualCF1 } from "@/domain/pesoCF1";
import { useCalidad } from "@/features/panel-calidad/store";
import { cn } from "@/lib/utils";

const HOY = "2026-09-24";
const LOTES: LoteStock[] = [
  { codigo: "LT-0238", estante: "B-1", saldoKg: 20.8, vence: "2026-09-26" },
  { codigo: "LT-0245", estante: "B-2", saldoKg: 48.6, vence: "2026-09-27" },
  { codigo: "LT-0241", estante: "C-1", saldoKg: 31.2, vence: "2026-09-25", cuarentena: true },
  { codigo: "LT-0230", estante: "C-3", saldoKg: 6.4, vence: "2026-09-22" },
];
const META_KG = 30;

export function PanelCF1({ color }: { color: string }) {
  const [modo, setModo] = useState<"guardar" | "sacar">("sacar");
  const sugeridos = useMemo(() => sugerirFEFO(LOTES, HOY), []);
  const [sel, setSel] = useState(sugeridos[0]?.codigo ?? "");
  const lote = LOTES.find((l) => l.codigo === sel);
  const lectura = useScale(20.8, 250);
  const [capturas, setCapturas] = useState<{ kg: number; manual: boolean }[]>([]);
  const [manual, setManual] = useState(false);
  const [pin, setPin] = useState("");
  const [motivo, setMotivo] = useState("");
  const [pesoManual, setPesoManual] = useState("");
  const [errorManual, setErrorManual] = useState("");
  const auditar = useCalidad((s) => s.auditar);
  const cant = redondear(capturas.reduce((s, c) => s + c.kg, 0));
  const sinSenal = lectura.status === "disconnected";
  const errorPeso = lote ? validarPesoCF1(cant + lectura.kg, lote.saldoKg, lote.codigo) : "";
  const capturar = () => { if (!lote || !lectura.estable || sinSenal || errorPeso) return; setCapturas([...capturas, { kg: lectura.kg, manual: false }]); setHecho(null); };

  const [estante, setEstante] = useState("B-3");
  const [hecho, setHecho] = useState<string | null>(null);

  const elegir = (l: LoteStock) => { setSel(l.codigo); setCapturas([]); setHecho(null); };

  return (
    <PanelCuerpo accion={
      modo === "sacar" ? (
        <BotonPrincipal color={color} disabled={!lote || capturas.length === 0 || !!validarPesoCF1(cant, lote.saldoKg, lote.codigo)} onClick={() => setHecho(`Salida de ${kg(cant)} kg de ${sel} registrada.`)}><ScanLine size={20} /> Escanear lote y retirar</BotonPrincipal>
      ) : (
        <BotonPrincipal color={color} onClick={() => setHecho(`Lote guardado en estante ${estante}.`)}><ScanLine size={20} /> Escanear lote y guardar en {estante}</BotonPrincipal>
      )
    }>
      <div className="space-y-3">
        <Segmentado opciones={[["guardar", "Guardar lote"], ["sacar", "Sacar para producción"]] as const} valor={modo} onChange={(v) => { setModo(v); setHecho(null); }} />
        <Seccion n={0} titulo="Temperatura del cuarto" extra={<Chip tono="ok">Conforme</Chip>}>
          <p className="font-mono text-2xl font-bold">1,5 °C <span className="text-xs font-normal text-muted-foreground">rango 0,0 – 4,0 °C</span></p>
        </Seccion>

        {modo === "sacar" ? <>
          <Seccion n={1} titulo="Pedido de producción" extra={<span className="font-mono text-[11px] text-primary">Filete de mojarra · {kg(META_KG)} kg</span>}>
            <p className="text-xs text-muted-foreground">Para Cocción (3A) · turno mañana</p>
          </Seccion>
          <Seccion n={2} titulo="Sugeridos — vence primero, sale primero" activa extra={<span className="text-[10px] text-muted-foreground">{LOTES.length} lotes en CF-1</span>}>
            <div className="space-y-2">
              {LOTES.slice().sort((a, b) => a.vence.localeCompare(b.vence)).map((l) => {
                const vencido = estaVencido(l, HOY);
                const bloqueado = vencido || l.cuarentena;
                const primero = sugeridos[0]?.codigo === l.codigo;
                return (
                  <button key={l.codigo} disabled={bloqueado} onClick={() => elegir(l)}
                    className={cn("w-full rounded-xl border-2 p-2 text-left font-mono text-[11px] disabled:cursor-not-allowed disabled:opacity-60",
                      sel === l.codigo ? "border-primary bg-primary-soft" : "border-transparent bg-muted")}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{l.codigo} {primero && <Chip tono="primary">VENCE PRIMERO</Chip>}</span>
                      {l.cuarentena ? <Chip tono="warn"><Lock size={10} /> Cuarentena</Chip> : vencido ? <Chip tono="danger">Vencido</Chip> : sel === l.codigo ? <Chip tono="ok">Elegido</Chip> : null}
                    </div>
                    <p className="text-muted-foreground">Estante {l.estante} · Saldo {kg(l.saldoKg)} kg · vence {fechaCorta(l.vence)}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-2"><Aviso tono="danger"><span className="flex items-center gap-1"><AlertTriangle size={14} /> LT-0230 está vencido: no puede salir a producción. Avisa a la ingeniera.</span></Aviso></div>
          </Seccion>
          {lote && (
            <Seccion n={3} titulo="Peso de la báscula" extra={<Chip tono="primary">Meta: {kg(META_KG)} kg</Chip>}>
              <div className="rounded-2xl bg-muted p-4">
                <p className={cn("font-mono text-4xl font-bold tabular-nums w-full", sinSenal && "opacity-40")}><span className="inline-block min-w-[5ch]">{sinSenal ? "--,-" : kg(capturas.length ? cant : lectura.kg)}</span> <span className="text-xl text-muted-foreground">kg</span></p>
                <p className="mt-2 text-[11px] text-muted-foreground"><span className={sinSenal ? "text-danger" : "text-ok"}>●</span> Báscula de piso #1 · {sinSenal ? "desconectada" : "conectada"}</p>
                <div className="mt-2"><Chip tono={sinSenal ? "danger" : lectura.estable ? "ok" : "warn"}>{sinSenal ? "SIN SEÑAL" : lectura.estable ? "ESTABLE ✓" : "ESTABILIZANDO…"}</Chip></div>
              </div>
              <div className="mt-3 h-2 rounded-full overflow-hidden bg-muted" role="progressbar" aria-label="Peso capturado hacia la meta" aria-valuenow={cant} aria-valuemin={0} aria-valuemax={META_KG}><div className="h-full transition-all duration-300 motion-reduce:duration-150" style={{ width: `${Math.min(100, cant / META_KG * 100)}%`, background: color }} /></div>
              {capturas.length > 0 && <>
                <p role="status" className="mt-3 text-sm font-semibold text-ok">Peso capturado · {kg(cant)} kg ✓ {capturas.some((c) => c.manual) && <Chip tono="warn">Manual</Chip>}</p>
                <div className="mt-2 flex flex-wrap gap-2">{capturas.map((c, i) => <span key={i} className="rounded-lg bg-muted px-2 py-1 font-mono text-[11px]">Tanda {i + 1}: {kg(c.kg)} kg</span>)}</div>
                <Button variant="outline" className="mt-2 min-h-12 w-full" onClick={() => { setCapturas([]); setHecho(null); }}>Volver a pesar</Button>
              </>}
              <Button variant="outline" className="mt-3 min-h-16 w-full border-2 border-primary text-primary" disabled={!lectura.estable || sinSenal || !!errorPeso} onClick={capturar}><Scale size={20} />{capturas.length ? "+ Otra tanda · Capturar peso" : "Capturar peso"}</Button>
              {!lectura.estable && <p className="mt-1 text-xs text-muted-foreground">Espera a que la lectura se estabilice</p>}
              {!sinSenal && errorPeso && cant < lote.saldoKg && <p role="alert" className="mt-2 text-xs text-danger">{errorPeso}</p>}
              <div className={cn(!capturas.length && "opacity-50")}>
                <p className="mt-2 text-[11px] text-muted-foreground">Saldo que queda en {lote.estante}: <b className="font-mono">{kg(redondear(Math.max(0, lote.saldoKg - (capturas.length ? cant : lectura.kg))))} kg</b></p>
                {(capturas.length ? cant : lectura.kg) < META_KG && <p className="mt-1 text-[11px] text-warn">Faltan {kg(redondear(META_KG - (capturas.length ? cant : lectura.kg)))} kg: completa con el siguiente lote sugerido.</p>}
              </div>
              <Button variant="link" className="min-h-12 h-auto whitespace-normal w-full text-xs text-muted-foreground" onClick={() => { setManual(true); setErrorManual(""); }}>¿La báscula no responde? Ingreso manual</Button>
            </Seccion>
          )}
        </> : (
          <Seccion n={1} titulo="Estante destino" activa>
            <div className="grid grid-cols-3 gap-2">
              {["B-1", "B-2", "B-3", "C-1", "C-2", "C-3"].map((e) => (
                <button key={e} onClick={() => setEstante(e)} className={cn("tap rounded-xl font-mono text-sm", estante === e ? "bg-primary text-primary-foreground" : "bg-muted")}>{e}</button>
              ))}
            </div>
          </Seccion>
        )}
        <Dialog open={manual} onOpenChange={setManual}><DialogContent><DialogTitle>Ingreso manual · contingencia</DialogTitle><DialogDescription>Requiere autorización de supervisor y motivo. Autorización simulada; PIN de supervisor de ejemplo: 4321.</DialogDescription>
          <label className="field-label">PIN de supervisor<input type="password" inputMode="numeric" className="panel-input min-h-12" value={pin} onChange={(e) => setPin(e.target.value)} /></label>
          <label className="field-label">Motivo<textarea className="panel-input min-h-20" value={motivo} onChange={(e) => setMotivo(e.target.value)} /></label>
          <label className="field-label">Peso (kg)<input inputMode="decimal" className="panel-input min-h-12" value={pesoManual} onChange={(e) => setPesoManual(e.target.value)} /></label>
          {errorManual && <p role="alert" className="text-danger text-sm">{errorManual}</p>}
          <Button className="min-h-12" onClick={() => { if (!lote) return; const peso = Number(pesoManual.replace(",", ".")); const error = autorizarManualCF1(pin, motivo) || validarPesoCF1(peso, lote.saldoKg, lote.codigo) || validarPesoCF1(cant + peso, lote.saldoKg, lote.codigo); if (error) { setErrorManual(error); return; } setCapturas([...capturas, { kg: peso, manual: true }]); auditar(lote.codigo, "Peso manual CF-1", `${kg(cant)} kg`, `${kg(cant + peso)} kg · Manual · supervisor demo`, motivo); setManual(false); setPin(""); setMotivo(""); setPesoManual(""); }}>Autorizar y capturar</Button>
        </DialogContent></Dialog>
        <Ejemplo />
        {hecho && <p className="flex items-center gap-2 rounded-xl bg-ok/10 p-3 text-sm font-medium text-ok"><CheckCircle2 size={20} /> {hecho}</p>}
      </div>
    </PanelCuerpo>
  );
}
