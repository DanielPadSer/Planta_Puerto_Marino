import { useState, type KeyboardEvent } from "react";
import { Pencil, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { CATEGORIAS_SANITARIAS as cats, permiteExcepcion, type CeldaMatriz, type NivelMatriz } from "@/domain/matriz";
import { useCalidad } from "./store";
import { EstadoChip, EjemploPanel } from "./ui";
import { cn } from "@/lib/utils";
const descripciones: Record<NivelMatriz, string> = { N0:"Sin limpieza · automático", N1:"Superficial · retiro de residuos", N2:"Profunda · detergente, desinfección con concentración y tiempo de contacto", N3:"Profunda + prueba ATP o de alérgeno · sin excepción" };
const nombre = (id: string) => cats.find((c) => c.id === id)?.nombre ?? id;
export function MatrizEditable({ onNivel, soloLectura = false }: { onNivel: (n: string) => void; soloLectura?: boolean }) {
  const matrices = useCalidad((s) => s.matrices);
  const guardar = useCalidad((s) => s.guardarMatriz);
  const vigente = matrices.at(-1);
  const [borrador, setBorrador] = useState<CeldaMatriz[] | null>(null);
  const [celda, setCelda] = useState<CeldaMatriz | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [descartar, setDescartar] = useState(false);
  const [motivo, setMotivo] = useState("");
  if (!vigente) return null;
  const celdas = borrador ?? vigente.celdas;
  const cambios = celdas.filter((c, i) => JSON.stringify(c) !== JSON.stringify(vigente.celdas[i]));
  const aplicar = (c: CeldaMatriz) => { setBorrador(celdas.map((x) => x.desde === c.desde && x.hacia === c.hacia ? { ...c } : x)); setCelda(null); };
  const salir = () => { if (cambios.length) setDescartar(true); else setBorrador(null); };
  const flechas = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta = { ArrowRight:1, ArrowLeft:-1, ArrowDown:cats.length, ArrowUp:-cats.length }[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(celdas.length - 1, i + delta));
    document.getElementById(`matriz-${next}`)?.focus();
  };
  return <>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2>Nivel de limpieza exigido al cambiar de producto</h2><p className="text-xs text-muted-foreground mt-2">Categoría previa vs. siguiente · N0 mismo producto automático</p></div>
      <div className="flex flex-wrap items-center gap-2"><EstadoChip>{borrador ? `Borrador sobre v${vigente.version}` : `Matriz v${vigente.version} activa`}</EstadoChip><Button variant="outline" className="min-h-12" onClick={() => borrador ? salir() : setBorrador(vigente.celdas.map((c) => ({ ...c })))}><Pencil size={20} />{borrador ? "Salir de edición" : "Editar matriz"}</Button></div>
    </div>
    {borrador && <p className="version-notice mt-3" role="status">Modo edición · los cambios se aplican desde la nueva versión y no afectan lotes ya producidos</p>}
    <p className="matrix-axis">PRODUCTO A PROCESAR (HACIA) →</p>
    <div className="matrix-wrap"><table className="cleaning-matrix editable-matrix" role="grid" aria-label="Matriz de limpieza" data-editing={!!borrador}><thead><tr><th>ÚLTIMO USO<br />(DESDE) ↓</th>{cats.map((c) => <th key={c.id}>{c.nombre}</th>)}</tr></thead><tbody>
      {cats.map((a, row) => <tr key={a.id}>{<th>{a.nombre}</th>}{cats.map((b, col) => {
        const i = row * cats.length + col;
        const c = celdas[i]; if (!c) return null;
        const diagonal = a.id === b.id;
        const changed = cambios.includes(c);
        const allergen = a.alergeno || b.alergeno;
        const original = vigente.celdas[i];
        const trigger = <Button id={`matriz-${i}`} variant="ghost" onKeyDown={(e) => flechas(e, i)} aria-label={`${a.nombre} → ${b.nombre}: ${c.nivel}${diagonal ? " · automático" : ""}`} aria-disabled={!!borrador && diagonal} title={diagonal ? "Mismo producto: automático (N0), sujeto al tiempo máximo de uso continuo" : undefined} onClick={() => { if (borrador && !diagonal) setCelda({ ...c }); else onNivel(c.nivel); }} className={cn("matrix-cell min-h-14 relative transition-all duration-200 motion-reduce:duration-150", c.nivel === "N0" ? "bg-ok/12 text-ok" : c.nivel === "N1" ? "bg-primary-soft text-primary" : c.nivel === "N3" ? "bg-danger/10 text-danger" : "bg-warn/15 text-foreground", allergen && !diagonal && "matrix-allergen", changed && "ring-2 ring-primary/30")}>
          <b>{c.nivel}</b><small>{diagonal ? "Automático" : c.nivel === "N3" || allergen ? "Sin excepción" : c.excepcion ? "Excepción con motivo" : c.nivel === "N1" ? "Superficial" : "Profunda"}</small>{diagonal && <Lock size={12} className="absolute right-1 top-1 text-muted-foreground" />}{changed && <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />}
        </Button>;
        return <td role="gridcell" key={b.id}>{!borrador || diagonal ? trigger : <Popover open={celda?.desde === a.id && celda?.hacia === b.id} onOpenChange={(open) => { if (!open) setCelda(null); }}><PopoverTrigger asChild>{trigger}</PopoverTrigger><PopoverContent className="w-80 max-w-[calc(100vw-24px)] space-y-4"><h3 className="font-semibold">{a.nombre} → {b.nombre}</h3>{celda && <>
          <div role="group" aria-label="Nivel de limpieza" className="grid grid-cols-4 gap-2">{(["N0","N1","N2","N3"] as const).map((n) => <Button key={n} disabled={n === "N0"} variant="outline" aria-pressed={celda.nivel === n} className={cn("min-h-12", celda.nivel === n && "bg-primary-soft border-primary text-primary")} onClick={() => { const next = { ...celda, nivel:n }; setCelda({ ...next, excepcion:permiteExcepcion(next) && next.excepcion }); }}>{n}</Button>)}</div>
          <p className="text-xs text-muted-foreground">{descripciones[celda.nivel]}</p>
          <label className="flex items-center gap-3 min-h-12 text-sm"><Switch checked={celda.excepcion} disabled={!permiteExcepcion(celda)} onCheckedChange={(v) => setCelda({ ...celda, excepcion:v })} />Permitir excepción (solo calidad, con motivo)</label>
          {!permiteExcepcion(celda) && <p className="text-xs text-danger">Sin excepción posible{allergen ? " · categoría alérgena" : ""}</p>}
          <Button variant="link" className="min-h-12" onClick={() => { if (original) aplicar({ ...original }); }}>Restablecer a v{vigente.version}</Button>
          <div className="flex gap-2"><Button variant="outline" className="min-h-12 flex-1" onClick={() => setCelda(null)}>Cancelar</Button><Button className="min-h-12 flex-1" onClick={() => aplicar(celda)}>Aplicar</Button></div>
        </>}</PopoverContent></Popover>}</td>;
      })}</tr>)}
    </tbody></table></div>
    <div className="matrix-legend">{(["N0","N1","N2","N3"] as const).map((n) => <p key={n}><EstadoChip tono={n === "N3" ? "danger" : n === "N2" ? "warn" : n === "N1" ? "primary" : "ok"}>{n}</EstadoChip>{descripciones[n]}</p>)}</div><EjemploPanel />
    {cambios.length > 0 && <div className="matrix-save-bar" role="status"><span>{cambios.length} celdas modificadas</span><Button variant="outline" className="min-h-12" onClick={() => setDescartar(true)}>Descartar</Button><Button className="min-h-12" onClick={() => setConfirmar(true)}>Guardar nueva versión</Button></div>}
    <AlertDialog open={descartar} onOpenChange={setDescartar}><AlertDialogContent><AlertDialogTitle>¿Descartar los cambios sin guardar?</AlertDialogTitle><AlertDialogDescription>La matriz vigente no se modificará.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel className="min-h-12">Cancelar</AlertDialogCancel><AlertDialogAction className="min-h-12" onClick={() => { setBorrador(null); setCelda(null); }}>Descartar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <Dialog open={confirmar} onOpenChange={setConfirmar}><DialogContent><DialogTitle>Guardar matriz v{vigente.version + 1}</DialogTitle><DialogDescription>Los lotes ya producidos conservan la versión con que se aprobaron. La v{vigente.version} queda en el historial.</DialogDescription><ul className="max-h-48 overflow-y-auto text-sm space-y-2">{cambios.map((c) => { const p = vigente.celdas.find((x) => x.desde === c.desde && x.hacia === c.hacia); return <li key={`${c.desde}-${c.hacia}`}>{nombre(c.desde)} → {nombre(c.hacia)}: {p?.nivel} → {c.nivel} · excepción: {c.excepcion ? "sí" : "no"}</li>; })}</ul><label className="field-label">Motivo del cambio<textarea className="panel-input min-h-20" value={motivo} onChange={(e) => setMotivo(e.target.value)} /></label><div className="flex gap-2"><Button variant="outline" className="min-h-12" onClick={() => setConfirmar(false)}>Cancelar</Button><Button disabled={!motivo.trim()} className="min-h-12" onClick={() => { const error = guardar(celdas, motivo); if (error) { toast.error(error); return; } setBorrador(null); setConfirmar(false); setMotivo(""); toast.success(`Matriz v${vigente.version + 1} guardada`); }}>Confirmar y guardar</Button></div></DialogContent></Dialog>
  </>;
}