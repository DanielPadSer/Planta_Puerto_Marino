import { useEffect, useState, type ReactNode } from "react";
import { Search, ArrowUpDown, X, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { motivoSchema, type MotivoDatos } from "@/domain/calidad";
import { cn } from "@/lib/utils";
import { useSortableTable } from "@/hooks/useSortableTable";
export function useConexion() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}
export function EstadoChip({
  children,
  tono = "ok",
}: {
  children: ReactNode;
  tono?: "ok" | "warn" | "danger" | "muted" | "primary";
}) {
  return (
    <span
      className={cn("status-chip", {
        "bg-ok/12 text-ok": tono === "ok",
        "bg-warn/15 text-warn": tono === "warn",
        "bg-danger/12 text-danger": tono === "danger",
        "bg-muted text-muted-foreground": tono === "muted",
        "bg-primary-soft text-primary": tono === "primary",
      })}
    >
      {children}
    </span>
  );
}
export function TabsPanel({
  tabs,
  value,
  onChange,
  disabled = [],
}: {
  tabs: readonly string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: string[];
}) {
  return (
    <div className="panel-tabs">
      {tabs.map((t) => (
        <Button
          key={t}
          variant="ghost"
          disabled={disabled.includes(t)}
          onClick={() => onChange(t)}
          className={cn("tab-button", value === t && "bg-surface text-primary shadow-sm")}
        >
          {t}
        </Button>
      ))}
    </div>
  );
}
export function Buscador({
  value,
  onChange,
  placeholder = "Buscar…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="panel-search">
      <Search size={20} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <Button
          size="icon"
          variant="ghost"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange("")}
        >
          <X size={20} />
        </Button>
      )}
    </label>
  );
}
export function KPIs({
  items,
}: {
  items: { label: string; value: string | number; icon: ReactNode; danger?: boolean }[];
}) {
  return (
    <div className="kpi-grid">
      {items.map((i) => (
        <div className="kpi" key={i.label}>
          <div>
            <strong className={i.danger ? "text-danger" : ""}>{i.value}</strong>
            <p>{i.label}</p>
          </div>
          <span
            className={cn(
              "kpi-icon",
              i.danger ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground",
            )}
          >
            {i.icon}
          </span>
        </div>
      ))}
    </div>
  );
}
export interface Col<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => ReactNode;
}
export function Tabla<T extends { id: string }>({
  data,
  cols,
  onSelect,
  selected,
}: {
  data: readonly T[];
  cols: Col<T>[];
  onSelect?: (row: T) => void;
  selected?: string | undefined;
}) {
  const initial = cols[0]?.key ?? "id";
  const { rows, sort, toggle } = useSortableTable(data, initial);
  return (
    <div className="panel-table-wrap">
      <table className="panel-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={String(c.key)}>
                <Button variant="ghost" onClick={() => toggle(c.key)} className="table-sort">
                  {c.label}
                  <ArrowUpDown
                    size={20}
                    className={sort.key === c.key ? "text-primary" : "opacity-30"}
                  />
                </Button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={cn(selected === row.id && "selected-row", onSelect && "cursor-pointer")}
              onClick={() => onSelect?.(row)}
            >
              {cols.map((c, i) => (
                <td key={String(c.key)}>
                  {i === 0 && onSelect ? (
                    <Button
                      variant="link"
                      className="table-select"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(row);
                      }}
                    >
                      {c.render ? c.render(row) : String(row[c.key])}
                    </Button>
                  ) : c.render ? (
                    c.render(row)
                  ) : (
                    String(row[c.key])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className="empty-state">No hay registros para estos filtros.</p>}
    </div>
  );
}
export function MotivoForm({
  onSubmit,
  children,
  label = "Guardar cambios",
  danger = false,
  rechazo = false,
}: {
  onSubmit: (data: MotivoDatos) => void;
  children?: ReactNode;
  label?: string;
  danger?: boolean;
  rechazo?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MotivoDatos>({
    resolver: zodResolver(motivoSchema),
    defaultValues: { motivo: "", destino: "" },
  });
  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <label className="field-label">
        Motivo del cambio o decisión <span className="text-danger">* obligatorio</span>
        <textarea
          {...register("motivo")}
          placeholder="Describe la justificación técnica…"
          className="panel-input min-h-20"
        />
      </label>
      {errors.motivo && (
        <p role="alert" className="text-xs text-danger">
          {errors.motivo.message}
        </p>
      )}
      {rechazo && (
        <label className="field-label">
          Destino del lote
          <input
            {...register("destino")}
            className="panel-input"
            placeholder="Devolución, destrucción…"
          />
        </label>
      )}
      {children}
      <Button
        type="submit"
        variant={danger ? "destructive" : "default"}
        className="w-full min-h-12"
      >
        {label}
      </Button>
    </form>
  );
}
export function Drawer({
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
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent className="panel-drawer sm:max-w-lg">
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>Puerto Marino · Control de calidad</SheetDescription>
        <div className="mt-6 space-y-5">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
export function EjemploPanel() {
  return (
    <p className="example-note">
      Valores de ejemplo: los reales los define la ingeniería de alimentos.
    </p>
  );
}
export function ReadonlyNote() {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <LockKeyhole size={20} />
      Solo lectura · nada se borra ni se edita
    </span>
  );
}
export function downloadJSON(name: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
