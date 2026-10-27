// Servicios simulados de escritura: toda mutación pasa por assertPuede,
// como haría el servidor. Sin permiso lanza ErrorPermiso (403) y la UI
// muestra un toast con el motivo.
import { assertPuede, type Accion, type Recurso, type RolPanel } from "@/domain/permisos";

export function ejecutarEscritura<T>(
  rol: RolPanel,
  accion: Accion,
  recurso: Recurso,
  escritura: () => T,
): T {
  assertPuede(rol, accion, recurso);
  return escritura();
}
