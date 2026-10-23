import { Users, ShieldCheck } from "lucide-react";
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
      <section className="pending-section">
        {alergenos ? <ShieldCheck size={40} /> : <Users size={40} />}
        <h2>{alergenos ? "Catálogo de alérgenos" : "Personal y BPM"}</h2>
        <EstadoChip tono="warn">Pendiente · siguiente fase</EstadoChip>
      </section>
    </PanelLayout>
  );
}
