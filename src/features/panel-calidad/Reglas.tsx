import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelLayout } from "@/app/PanelLayout";
import { useCalidad } from "./store";
import type { ProductoRegla } from "@/domain/calidad";
import { Buscador, TabsPanel, Tabla, EstadoChip, MotivoForm, EjemploPanel, Drawer } from "./ui";
import { BannerSoloLectura, useModoLectura } from "@/ui/permisos";
const ACORDEONES = [
  "Recepción",
  "Cocción",
  "Enfriamiento",
  "Empaque y vida útil",
  "Congelación",
  "Limpieza",
];
export function Reglas() {
  const { productos, guardarProducto } = useCalidad();
  const lectura = useModoLectura("reglas");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [selected, setSelected] = useState("RGL-088");
  const [draft, setDraft] = useState<ProductoRegla | null>(null);
  const [drawer, setDrawer] = useState(false);
  const p = productos.find((x) => x.id === selected);
  const edit = draft ?? p;
  const rows = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "Todos" ||
        p.ruta === filter ||
        (filter === "Alérgenos" && p.alergeno.length > 0) ||
        (filter === "Por validar" && p.estado === "Por validar")),
  );
  const detail = edit && (
    <fieldset disabled={lectura} className="contents">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2>{edit.nombre}</h2>
          <p className="text-xs text-muted-foreground mt-2">
            Versión {p?.version} · vigente desde 08/10/2026
          </p>
        </div>
        <div className="flex gap-1">
          <EstadoChip tono="primary">{edit.categoria}</EstadoChip>
          <EstadoChip tono="muted">{edit.ruta}</EstadoChip>
        </div>
      </div>
      <div className="space-y-3 my-5">
        {ACORDEONES.map((a, i) => (
          <details className="rule-accordion" key={a} open={i === 0 ? true : undefined}>
            <summary>
              <span>
                <b>{i + 1}</b>
                {a}
              </span>
              <small>
                {a === "Cocción"
                  ? `≥ ${edit.temperatura} °C · ${edit.tiempo} min`
                  : a === "Empaque y vida útil"
                    ? `${edit.vida} días`
                    : ""}
              </small>
            </summary>
            <div className="accordion-body">
              {a === "Recepción" ? (
                <>
                  <div className="detail-two">
                    <label className="field-label">
                      Temperatura máx. (°C)
                      <input
                        type="number"
                        className="panel-input"
                        value={edit.recepcionMax ?? 4}
                        onChange={(e) =>
                          setDraft({ ...edit, recepcionMax: Number(e.target.value) })
                        }
                      />
                    </label>
                    <label className="field-label">
                      Hielo en tolva
                      <select
                        className="panel-input"
                        value={edit.hielo ?? "Pesar escurrido"}
                        onChange={(e) => setDraft({ ...edit, hielo: e.target.value })}
                      >
                        <option>Pesar escurrido</option>
                        <option>Descontar hielo</option>
                      </select>
                    </label>
                  </div>
                  <label className="field-label">
                    Criterios de aceptación
                    <input
                      className="panel-input"
                      value={
                        edit.criterios ?? "Olor característico, agallas rojas, empaque íntegro"
                      }
                      onChange={(e) => setDraft({ ...edit, criterios: e.target.value })}
                    />
                  </label>
                </>
              ) : a === "Cocción" ? (
                <div className="detail-two">
                  <label className="field-label">
                    Temperatura (°C)
                    <input
                      className="panel-input"
                      type="number"
                      value={edit.temperatura}
                      onChange={(e) => setDraft({ ...edit, temperatura: Number(e.target.value) })}
                    />
                  </label>
                  <label className="field-label">
                    Tiempo mínimo (min)
                    <input
                      className="panel-input"
                      type="number"
                      min="1"
                      value={edit.tiempo}
                      onChange={(e) => setDraft({ ...edit, tiempo: Number(e.target.value) })}
                    />
                  </label>
                </div>
              ) : a === "Empaque y vida útil" ? (
                <label className="field-label">
                  Vida útil (días)
                  <input
                    className="panel-input"
                    type="number"
                    min="1"
                    value={edit.vida}
                    onChange={(e) => setDraft({ ...edit, vida: Number(e.target.value) })}
                  />
                </label>
              ) : a === "Limpieza" ? (
                <>
                  <p className="text-xs mb-3">Perfil de alérgenos del producto · solo lectura</p>
                  <div className="flex gap-2">
                    {edit.alergeno.length ? (
                      edit.alergeno.map((x) => (
                        <EstadoChip key={x} tono="danger">
                          {x}
                        </EstadoChip>
                      ))
                    ) : (
                      <EstadoChip tono="muted">Sin alérgenos declarados</EstadoChip>
                    )}
                  </div>
                  <Button asChild variant="link" className="mt-3 px-0">
                    <Link to="/panel/catalogos/alergenos">Editar en Catálogos › Alérgenos</Link>
                  </Button>
                  <p className="text-xs mt-2">
                    N2 profunda al cambiar la especie o el perfil de alérgenos.
                  </p>
                </>
              ) : a === "Enfriamiento" ? (
                <label className="field-label">
                  Curva de enfriamiento
                  <input
                    className="panel-input"
                    value={edit.enfriamiento ?? "57 → 21 °C en 2 h; hasta 5 °C en 6 h"}
                    onChange={(e) => setDraft({ ...edit, enfriamiento: e.target.value })}
                  />
                </label>
              ) : (
                <label className="field-label">
                  Temperatura objetivo (°C)
                  <input
                    type="number"
                    className="panel-input"
                    value={edit.congelacion ?? -18}
                    onChange={(e) => setDraft({ ...edit, congelacion: Number(e.target.value) })}
                  />
                  <p className="mt-2 text-xs">Sin recongelar · registrar temperatura de centro.</p>
                </label>
              )}
            </div>
          </details>
        ))}
      </div>
      <div className="version-notice">
        <ShieldCheck size={20} />
        Los cambios crean una nueva versión; los lotes ya producidos conservan la versión con que se
        aprobaron.
      </div>
      {!lectura && (
        <MotivoForm
          label="Guardar como nueva versión"
          onSubmit={(d) => {
            if (edit.temperatura <= 0 || edit.tiempo <= 0 || edit.vida <= 0) {
              toast.error("Los parámetros deben ser mayores que cero.");
              return;
            }
            guardarProducto(edit, d.motivo);
            setDraft(null);
            toast.success(`Nueva versión v${(p?.version ?? 0) + 1} guardada`);
          }}
        />
      )}
      <EjemploPanel />
    </fieldset>
  );
  return (
    <PanelLayout
      title="Reglas por producto"
      subtitle="Parámetros versionados que validas para cada producto"
      active="/panel/reglas"
      action={
        <Button
          onClick={() => {
            setDrawer(true);
          }}
        >
          <Plus size={20} />
          Ver regla
        </Button>
      }
    >
      <BannerSoloLectura recurso="reglas" />
      <div className="rules-grid">
        <section className="panel-surface p-5">
          <Buscador value={search} onChange={setSearch} placeholder="Buscar producto…" />
          <div className="my-3">
            <TabsPanel
              tabs={["Todos", "Cocido", "Marinado", "Alérgenos", "Por validar"]}
              value={filter}
              onChange={setFilter}
            />
          </div>
          <Tabla
            data={rows}
            selected={selected}
            onSelect={(p) => {
              setSelected(p.id);
              setDraft(null);
            }}
            cols={[
              { key: "nombre", label: "Producto" },
              {
                key: "categoria",
                label: "Categoría sanitaria",
                render: (p) => (
                  <span>
                    {p.categoria}
                    {p.alergeno.length > 0 && (
                      <span className="block mt-1">
                        <EstadoChip tono="danger">Alérgeno</EstadoChip>
                      </span>
                    )}
                  </span>
                ),
              },
              { key: "ruta", label: "Ruta" },
              {
                key: "temperatura",
                label: "Cocción",
                render: (p) => (
                  <span className="font-mono">
                    {p.ruta === "Cocido" ? `≥ ${p.temperatura} °C × ${p.tiempo} min` : "—"}
                  </span>
                ),
              },
              {
                key: "vida",
                label: "Vida útil",
                render: (p) => (
                  <span>
                    {p.vida} días
                    <small className="block text-muted-foreground">
                      v{p.version} · {p.estado}
                    </small>
                  </span>
                ),
              },
            ]}
          />
          <EjemploPanel />
        </section>
        <aside className="panel-surface p-5">{detail}</aside>
      </div>
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Regla por producto">
        {detail}
      </Drawer>
    </PanelLayout>
  );
}
