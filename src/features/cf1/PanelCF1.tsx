import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Lock, ScanLine } from "lucide-react";
import { estaVencido, fechaCorta, kg, redondear, sugerirFEFO, type LoteStock } from "@/domain/reglas";
import { Chip } from "@/ui/marca";
import { Aviso, BotonPrincipal, Ejemplo, PanelCuerpo, Seccion, Segmentado, Stepper } from "@/features/planta/panelUi";
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
  const [cant, setCant] = useState(lote?.saldoKg ?? 0);
  const [estante, setEstante] = useState("B-3");
  const [hecho, setHecho] = useState<string | null>(null);

  const elegir = (l: LoteStock) => { setSel(l.codigo); setCant(Math.min(l.saldoKg, META_KG)); setHecho(null); };

  return (
    <PanelCuerpo accion={
      modo === "sacar" ? (
        <BotonPrincipal color={color} disabled={!lote || cant <= 0} onClick={() => setHecho(`Salida de ${kg(cant)} kg de ${sel} registrada.`)}><ScanLine size={20} /> Escanear lote y retirar</BotonPrincipal>
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
            <Seccion n={3} titulo="Cantidad a sacar" extra={<Chip tono="primary">Meta: {kg(META_KG)} kg</Chip>}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs">{lote.codigo}</span>
                <Stepper valor={cant} onChange={setCant} paso={0.5} max={lote.saldoKg} formato={(v) => `${kg(v)}`} />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Saldo que queda en {lote.estante}: <b className="font-mono">{kg(redondear(lote.saldoKg - cant))} kg</b></p>
              {cant < META_KG && <p className="mt-1 text-[11px] text-warn">Faltan {kg(redondear(META_KG - cant))} kg: completa con el siguiente lote sugerido.</p>}
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
        <Ejemplo />
        {hecho && <p className="flex items-center gap-2 rounded-xl bg-ok/10 p-3 text-sm font-medium text-ok"><CheckCircle2 size={20} /> {hecho}</p>}
      </div>
    </PanelCuerpo>
  );
}
