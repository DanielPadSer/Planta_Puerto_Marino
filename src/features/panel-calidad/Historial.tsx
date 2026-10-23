import { useState } from "react";
import { ShieldCheck, Fingerprint } from "lucide-react";
import { PanelLayout } from "@/app/PanelLayout";
import { useCalidad } from "./store";
import { Buscador, Tabla, EstadoChip, ReadonlyNote } from "./ui";
export function Historial() {
  const eventos = useCalidad((s) => s.eventos);
  const [sel, setSel] = useState(eventos[0]?.id);
  const [search, setSearch] = useState("");
  const [usuario, setUsuario] = useState("Todos");
  const [tipo, setTipo] = useState("Todas");
  const [desde, setDesde] = useState("2026-10-01");
  const [hasta, setHasta] = useState("2026-10-31");
  const event = eventos.find((e) => e.id === sel);
  const rows = eventos.filter(
    (e) =>
      `${e.entidad} ${e.campo} ${e.motivo}`.toLowerCase().includes(search.toLowerCase()) &&
      (usuario === "Todos" || e.usuario === usuario) &&
      (tipo === "Todas" || e.campo === tipo) &&
      e.fecha.slice(0, 10) >= desde &&
      e.fecha.slice(0, 10) <= hasta,
  );
  return (
    <PanelLayout
      title="Historial de cambios"
      subtitle="Quién cambió qué, cuándo y por qué"
      active="/panel/historial"
    >
      <div className="flex justify-between items-center mb-4">
        <ReadonlyNote />
        <EstadoChip tono="muted">Registro local simulado</EstadoChip>
      </div>
      <div className="audit-filters">
        <Buscador
          value={search}
          onChange={setSearch}
          placeholder="Buscar entidad, campo o motivo…"
        />
        <input
          type="date"
          aria-label="Fecha inicial"
          className="panel-input"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
        />
        <input
          type="date"
          aria-label="Fecha final"
          className="panel-input"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
        />
        <select
          aria-label="Usuario"
          className="panel-input"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        >
          <option value="Todos">Todos los usuarios</option>
          {Array.from(new Set(eventos.map((e) => e.usuario))).map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Tipo de cambio"
          className="panel-input"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="Todas">Todos los cambios</option>
          {Array.from(new Set(eventos.map((e) => e.campo))).map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div className="audit-grid">
        <section className="panel-surface p-5">
          <h2 className="flex gap-2 items-center mb-5">
            <ShieldCheck size={20} />
            Registro de auditoría
          </h2>
          <Tabla
            data={rows}
            selected={sel}
            onSelect={(e) => setSel(e.id)}
            cols={[
              {
                key: "fecha",
                label: "Fecha y hora",
                render: (e) => <code className="text-xs">{e.fecha}</code>,
              },
              { key: "usuario", label: "Usuario" },
              { key: "dispositivo", label: "Dispositivo" },
              { key: "entidad", label: "Entidad" },
              { key: "campo", label: "Campo" },
              {
                key: "nuevo",
                label: "Original → nuevo",
                render: (e) => (
                  <span className="audit-value">
                    {e.original.length > 70 ? `Parámetros v${e.version - 1}` : e.original}
                    <span className="text-muted-foreground"> → </span>
                    {e.nuevo.length > 70 ? `Parámetros v${e.version}` : e.nuevo}
                  </span>
                ),
              },
              { key: "motivo", label: "Motivo" },
            ]}
          />
          <p className="list-footer">
            <ShieldCheck size={20} />
            Historial solo lectura · sin acciones de editar ni borrar
          </p>
        </section>
        <aside className="panel-surface p-5">
          {event && (
            <>
              <div className="flex justify-between">
                <h2>Detalle del cambio</h2>
                <EstadoChip>Registrado</EstadoChip>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Evento {event.id} · {event.entidad}
              </p>
              <div className="audit-diff">
                <div>
                  <small>VALOR ORIGINAL</small>
                  <p>{event.original}</p>
                </div>
                <div>
                  <small>VALOR NUEVO · V{event.version}</small>
                  <p>{event.nuevo}</p>
                </div>
              </div>
              <div className="detail-box font-mono text-xs space-y-4">
                <p>
                  REGISTRO
                  <br />
                  <b className="text-primary">{event.id}</b>
                </p>
                <p>
                  USUARIO {event.usuario}
                  <br />
                  DISPOSITIVO {event.dispositivo}
                </p>
                <p>
                  HORA {event.fecha}
                  <br />
                  VERSIÓN v{event.version}
                </p>
                <p>
                  MOTIVO REGISTRADO
                  <br />
                  {event.motivo}
                </p>
                <p className="flex gap-2">
                  <Fingerprint size={20} />
                  Firma demo · {event.id}-PC-CAL-01
                </p>
              </div>
              <p className="version-notice mt-4">
                Los lotes ya producidos conservan la versión de la regla con que se aprobaron.
              </p>
              <p className="text-xs text-muted-foreground mt-5">
                Firma ilustrativa. Esta simulación no ofrece firma criptográfica ni almacenamiento
                inmutable externo.
              </p>
            </>
          )}
        </aside>
      </div>
    </PanelLayout>
  );
}
