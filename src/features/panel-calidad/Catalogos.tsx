import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Box, Scale, ShieldCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelLayout } from "@/app/PanelLayout";
import { useCalidad } from "./store";
import { Tabla, Buscador, EstadoChip, Drawer, MotivoForm, EjemploPanel } from "./ui";
import type { ContenedorCalidad } from "@/domain/calidad";
import { CATEGORIAS_SANITARIAS } from "@/domain/matriz";
import { BannerSoloLectura, useModoLectura, usePuede } from "@/ui/permisos";
const catalogs = [
  "Contenedores y tara",
  "Categorías sanitarias",
  "Proveedores",
  "Equipos",
  "Alérgenos",
  "Ingredientes",
  "Productos",
];
const generic: Record<string, { id: string; nombre: string; estado: string }[]> = {
  "Categorías sanitarias": CATEGORIAS_SANITARIAS.map((c, i) => ({ id: `CAT-${i + 1}`, nombre: c.nombre, estado: "Vigente" })),
  Proveedores: [
    { id: "PRO-01", nombre: "Pescados del Caribe S.A.S.", estado: "Activo" },
    { id: "PRO-02", nombre: "Mariscos del Pacífico", estado: "Activo" },
  ],
  Equipos: [
    { id: "EQ-01", nombre: "Marmita 1", estado: "Liberado" },
    { id: "EQ-02", nombre: "Marinador 1", estado: "Por verificar" },
  ],
  Ingredientes: [
    { id: "ING-01", nombre: "Sal marina", estado: "Vigente" },
    { id: "ING-02", nombre: "Jugo de limón", estado: "Vigente" },
  ],
  Productos: [
    { id: "PR-01", nombre: "Filete de mojarra", estado: "Vigente" },
    { id: "PR-02", nombre: "Camarón marinado", estado: "Por validar" },
  ],
};
export function Catalogos({ initial = "Contenedores y tara" }: { initial?: string }) {
  const { contenedores, guardarTara } = useCalidad();
  const [catalog, setCatalog] = useState(initial);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<ContenedorCalidad | null>(null);
  return (
    <PanelLayout
      title="Catálogos"
      subtitle="Datos base y parámetros compartidos de la planta"
      active="/panel/catalogos"
      action={
        <Button
          variant="outline"
          onClick={() => {
            const c = contenedores[0];
            if (c) setDraft({ ...c });
          }}
        >
          <Scale size={20} />
          Editar tara
        </Button>
      }
    >
      <div className="catalogs-grid">
        <aside className="catalog-index">
          <h3 className="section-eyebrow">CATÁLOGOS MAESTROS</h3>
          {catalogs.map((c) =>
            c === "Alérgenos" ? (
              <Button key={c} asChild variant="ghost" className="w-full justify-start">
                <Link to="/panel/catalogos/alergenos">
                  <ShieldCheck size={20} />
                  {c}
                </Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                key={c}
                className={`w-full justify-start ${catalog === c ? "bg-primary-soft text-primary" : ""}`}
                onClick={() => {
                  setCatalog(c);
                  setSearch("");
                }}
              >
                <Box size={20} />
                {c}
              </Button>
            ),
          )}
        </aside>
        <section className="panel-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h2>{catalog}</h2>
            <EstadoChip tono="muted">
              {catalog === "Contenedores y tara"
                ? contenedores.length
                : (generic[catalog]?.length ?? 0)}{" "}
              registros
            </EstadoChip>
          </div>
          <Buscador value={search} onChange={setSearch} placeholder="Buscar en catálogo…" />
          <div className="mt-4">
            {catalog === "Contenedores y tara" ? (
              <Tabla
                data={contenedores.filter((c) =>
                  c.nombre.toLowerCase().includes(search.toLowerCase()),
                )}
                onSelect={(c) => setDraft({ ...c })}
                cols={[
                  { key: "nombre", label: "Nombre" },
                  {
                    key: "tara",
                    label: "Tara (kg)",
                    render: (c) => (
                      <span className="font-mono text-primary">
                        {c.tara.toLocaleString("es-CO", { minimumFractionDigits: 2 })} kg
                      </span>
                    ),
                  },
                  {
                    key: "retornable",
                    label: "Retornable",
                    render: (c) => (
                      <EstadoChip tono={c.retornable ? "ok" : "muted"}>
                        {c.retornable ? "Sí" : "No"}
                      </EstadoChip>
                    ),
                  },
                  {
                    key: "version",
                    label: "Versión",
                    render: (c) => (
                      <span>
                        Validada v{c.version}
                        <small className="block text-muted-foreground">08/10/2026</small>
                      </span>
                    ),
                  },
                ]}
              />
            ) : (
              <Tabla
                data={(generic[catalog] ?? []).filter((c) =>
                  c.nombre.toLowerCase().includes(search.toLowerCase()),
                )}
                cols={[
                  { key: "id", label: "Código" },
                  { key: "nombre", label: "Nombre" },
                  {
                    key: "estado",
                    label: "Estado",
                    render: (c) => <EstadoChip>{c.estado}</EstadoChip>,
                  },
                ]}
              />
            )}
          </div>
          <EjemploPanel />
          <div className="mt-8 pt-5 border-t">
            <h3 className="section-eyebrow">CATEGORÍAS SANITARIAS VINCULADAS AL FLUJO</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {generic["Categorías sanitarias"]?.map((c) => (
                <EstadoChip key={c.id} tono={c.nombre.includes("Crustáceos") ? "danger" : "muted"}>
                  {c.nombre}
                </EstadoChip>
              ))}
            </div>
          </div>
        </section>
        <aside className="panel-surface p-5">
          <h2>Contenedores y tara</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Las pesadas ya hechas conservan la tara que usaron históricamente en su lote.
          </p>
          <div className="detail-box mt-5">
            <Scale size={20} />
            <h3 className="mt-3">Medición de tara</h3>
            <p className="mt-2 text-xs">Báscula Recepción 1 · promedio de contenedores vacíos.</p>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              const c = contenedores[0];
              if (c) setDraft({ ...c });
            }}
          >
            Seleccionar contenedor
          </Button>
        </aside>
      </div>
      <Drawer
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.nombre ?? "Contenedor"}
      >
        {draft && (
          <>
            <EstadoChip>Validada v{draft.version}</EstadoChip>
            <label className="field-label">
              Nombre del contenedor
              <input
                className="panel-input"
                value={draft.nombre}
                onChange={(e) => setDraft({ ...draft, nombre: e.target.value })}
              />
            </label>
            <label className="field-label">
              Tara en kg
              <input
                type="number"
                min="0"
                step="0.01"
                className="panel-input"
                value={draft.tara}
                onChange={(e) => setDraft({ ...draft, tara: Number(e.target.value) })}
              />
            </label>
            <label className="flex justify-between text-sm">
              Contenedor retornable
              <input
                type="checkbox"
                checked={draft.retornable}
                onChange={(e) => setDraft({ ...draft, retornable: e.target.checked })}
              />
            </label>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setDraft({ ...draft, tara: 1.81 });
                toast.success("Medición simulada estable: 1,81 kg");
              }}
            >
              <Scale size={20} />
              Medir ahora con la báscula
            </Button>
            <p className="version-notice">Las pesadas históricas conservan la tara original.</p>
            <MotivoForm
              label="Guardar nueva versión"
              onSubmit={(d) => {
                if (draft.tara <= 0 || !draft.nombre.trim()) {
                  toast.error("Completa nombre y tara mayor que cero.");
                  return;
                }
                guardarTara(draft, d.motivo);
                setDraft(null);
                toast.success("Tara versionada y guardada");
              }}
            />
            <EjemploPanel />
          </>
        )}
      </Drawer>
    </PanelLayout>
  );
}
