import { Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelLayout } from "@/app/PanelLayout";
import { useSesionPanel } from "@/features/auth/sesionPanel";
import { ETIQUETA_ROL } from "@/domain/permisos";

export function SinAcceso() {
  const usuario = useSesionPanel((s) => s.usuario);
  const rol = usuario?.rol ?? "ingeniera";
  return (
    <PanelLayout
      title="Sin acceso"
      subtitle="Esta sección no corresponde a tu rol"
      active=""
    >
      <section className="panel-surface sin-acceso-card">
        <ShieldAlert size={40} className="mx-auto text-warn" />
        <h2 className="mt-4">No tienes acceso a esta sección</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Estás viendo el panel como <b>{ETIQUETA_ROL[rol]}</b>. El criterio de acceso no es de
          jerarquía sino de responsabilidad: cada perfil ve y hace solo lo que le corresponde.
        </p>
        <Button asChild className="mt-6 min-h-12">
          <Link to="/panel/bandeja">
            <ArrowLeft size={20} />
            Volver a la bandeja
          </Link>
        </Button>
      </section>
    </PanelLayout>
  );
}
