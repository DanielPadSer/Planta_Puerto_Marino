import { useEffect, useId, type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSesionPanel } from "@/features/auth/sesionPanel";
import {
  puede,
  motivoRestriccion,
  ETIQUETA_ROL,
  type Accion,
  type Recurso,
  type RolPanel,
} from "@/domain/permisos";

export function useRol(): RolPanel {
  return useSesionPanel((s) => s.usuario?.rol ?? "ingeniera");
}

export function usePuede(accion: Accion, recurso: Recurso): boolean {
  const rol = useRol();
  return puede(rol, accion, recurso);
}

/** true cuando el rol ve el recurso pero no puede editarlo. */
export function useModoLectura(recurso: Recurso): boolean {
  const rol = useRol();
  return puede(rol, "ver", recurso) && !puede(rol, "editar", recurso);
}

export function Puede({
  accion,
  recurso,
  fallback = null,
  children,
}: {
  accion: Accion;
  recurso: Recurso;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const rol = useRol();
  return puede(rol, accion, recurso) ? <>{children}</> : <>{fallback}</>;
}

export function RutaProtegida({ recurso, children }: { recurso: Recurso; children: ReactNode }) {
  const rol = useRol();
  const hidratada = useSesionPanel((s) => s.hidratada);
  const hidratar = useSesionPanel((s) => s.hidratar);
  // Espera a que la sesión se recupere de sessionStorage antes de decidir.
  useEffect(() => {
    hidratar();
  }, [hidratar]);
  if (!hidratada) return null;
  if (!puede(rol, "ver", recurso)) return <Navigate to="/panel/sin-acceso" replace />;
  return <>{children}</>;
}

/**
 * Botón de decisión (liberar, rechazar, aprobar, autorizar, bloquear).
 * Sin permiso se queda visible pero deshabilitado, con el motivo en tooltip accesible.
 */
export function BotonRestringido({
  accion,
  recurso,
  children,
  onClick,
  variant,
  className,
  disabled,
}: {
  accion: Accion;
  recurso: Recurso;
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "destructive" | "ghost";
  className?: string;
  disabled?: boolean;
}) {
  const rol = useRol();
  const idMotivo = useId();
  const permitido = puede(rol, accion, recurso);
  if (permitido) {
    return (
      <Button variant={variant} className={className} onClick={onClick} disabled={disabled}>
        {children}
      </Button>
    );
  }
  const motivo = motivoRestriccion(rol, accion, recurso);
  return (
    <span className="inline-flex w-full flex-col gap-1" title={motivo}>
      <Button
        variant={variant ?? "outline"}
        className={className}
        disabled
        aria-disabled="true"
        aria-describedby={idMotivo}
      >
        <LockKeyhole size={20} />
        {children}
      </Button>
      <span id={idMotivo} className="text-xs text-muted-foreground">
        {motivo}
      </span>
    </span>
  );
}

/** Franja suave bajo el título cuando el rol solo puede ver la sección. */
export function BannerSoloLectura({ recurso }: { recurso: Recurso }) {
  const rol = useRol();
  const lectura = puede(rol, "ver", recurso) && !puede(rol, "editar", recurso);
  if (!lectura) return null;
  const quien =
    recurso.startsWith("personal.") || recurso === "usuarios.pin"
      ? "el supervisor o el administrador"
      : recurso === "catalogos.proveedoresSedes" || recurso === "dispositivos.registro"
        ? "el administrador"
        : "la ingeniera de alimentos o el administrador";
  return (
    <p className="readonly-banner" role="status">
      <LockKeyhole size={20} />
      Estás viendo esta sección en modo lectura como {ETIQUETA_ROL[rol]}. Para modificarla,
      solicita el cambio a {quien}.
    </p>
  );
}
