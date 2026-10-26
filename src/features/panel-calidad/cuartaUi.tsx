import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { EstadoChip } from "./ui";
import {
  diasHasta,
  vigenciaDocumento,
  type DocumentoPersonal,
  type Vigencia,
} from "@/domain/cuartaFase";
import { HOY_DEMO } from "@/mocks/cuartaFase";
export function DrawerCuarta({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <SheetContent className="cuarta-drawer w-full sm:max-w-[440px] overflow-y-auto bg-surface">
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>Puerto Marino · Datos simulados</SheetDescription>
        <div className="mt-6 space-y-5">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
export function ToggleCuarta({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-4 text-sm">
      <span>{label}</span>
      <Switch aria-label={label} checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
export function VigenciaChip({ estado, doc }: { estado: Vigencia; doc?: DocumentoPersonal }) {
  const dias = doc ? diasHasta(doc.venceEn, HOY_DEMO) : 0;
  return (
    <EstadoChip
      tono={
        estado === "vigente"
          ? "ok"
          : estado === "por_vencer"
            ? "warn"
            : estado === "vencido"
              ? "danger"
              : "muted"
      }
    >
      {estado === "vigente"
        ? "Vigente"
        : estado === "por_vencer"
          ? `Vence en ${dias} días`
          : estado === "vencido"
            ? `Vencido hace ${Math.abs(dias)} días`
            : "Sin documento"}
    </EstadoChip>
  );
}
export function DocumentoChip({
  doc,
  diasAviso = 30,
}: {
  doc?: DocumentoPersonal;
  diasAviso?: number;
}) {
  return (
    <VigenciaChip
      estado={doc ? vigenciaDocumento(doc, HOY_DEMO, diasAviso) : "sin_documento"}
      {...(doc ? { doc } : {})}
    />
  );
}
export function Notice({ children, danger = false }: { children: ReactNode; danger?: boolean }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-lg border p-4 text-sm ${danger ? "border-danger/25 bg-danger/8 text-danger" : "border-primary/20 bg-primary-soft text-foreground"}`}
    >
      {children}
    </div>
  );
}
