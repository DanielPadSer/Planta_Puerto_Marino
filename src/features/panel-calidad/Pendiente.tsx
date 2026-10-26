import { Users, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PanelLayout } from "@/app/PanelLayout";
import { EstadoChip } from "./ui";
export function Pendiente({ alergenos = false }: { alergenos?: boolean }) {
  return (
    <PanelLayout
      title={alergenos ? "Alérgenos" : "Personal y BPM"}
      subtitle={
        alergenos
          ? "Catálogos · Perfiles de alérgenos por producto"
          : "Documentación y cumplimiento del personal"
      }
      active={alergenos ? "/panel/catalogos/alergenos" : "/panel/personal"}
    >
      {alergenos ? (
        <div className="grid items-start gap-[18px] lg:grid-cols-[190px_minmax(0,1fr)]">
          <aside className="catalog-index">
            <h3 className="section-eyebrow">CATÁLOGOS MAESTROS</h3>
            <nav aria-label="Catálogos maestros" className="flex flex-wrap gap-1 lg:flex-col">
              {["Contenedores y tara", "Categorías sanitarias", "Proveedores", "Equipos", "Alérgenos", "Ingredientes", "Productos"].map((catalogo) => (
                <Button
                  key={catalogo}
                  asChild
                  variant="ghost"
                  className={`min-h-12 w-full justify-start ${catalogo === "Alérgenos" ? "bg-primary-soft text-primary" : "text-muted-foreground"}`}
                >
                  {catalogo === "Alérgenos" ? (
                    <Link to="/panel/catalogos/alergenos" aria-current="page">
                      <ShieldCheck size={20} />{catalogo}
                    </Link>
                  ) : (
                    <Link to="/panel/catalogos" search={{ catalogo }}>{catalogo}</Link>
                  )}
                </Button>
              ))}
            </nav>
          </aside>
          <section className="panel-surface overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="kpi-icon bg-primary-soft text-primary"><ShieldCheck size={20} /></span>
                <h2>Catálogo de alérgenos</h2>
              </div>
              <EstadoChip tono="warn">Pendiente · siguiente fase</EstadoChip>
            </div>
            <div className="empty-state flex min-h-80 flex-col items-center justify-center gap-4">
              <span className="kpi-icon bg-muted text-muted-foreground"><ShieldCheck size={20} /></span>
              <h3 className="section-eyebrow">ALÉRGENOS</h3>
              <EstadoChip tono="muted">Pendiente · siguiente fase</EstadoChip>
            </div>
          </section>
        </div>
      ) : (
        <section className="pending-section">
          <Users size={40} />
          <h2>Personal y BPM</h2>
          <EstadoChip tono="warn">Pendiente · siguiente fase</EstadoChip>
        </section>
      )}
    </PanelLayout>
  );
}
