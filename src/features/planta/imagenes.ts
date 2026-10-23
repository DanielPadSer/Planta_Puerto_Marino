import type { ZonaId } from "@/domain/types";
import general from "@/assets/planta/general.jpg.asset.json";

interface Pointer { url: string }

const marcadas = import.meta.glob<Pointer>("@/assets/planta/marcada-*.jpg.asset.json", { eager: true, import: "default" });
const detalles = import.meta.glob<Pointer>("@/assets/planta/detalle-*.jpg.asset.json", { eager: true, import: "default" });

function porZona(mods: Record<string, Pointer>, prefijo: string): Partial<Record<ZonaId, string>> {
  const out: Partial<Record<ZonaId, string>> = {};
  for (const [ruta, p] of Object.entries(mods)) {
    const id = ruta.split(`${prefijo}-`)[1]?.replace(".jpg.asset.json", "") as ZonaId | undefined;
    if (id) out[id] = p.url;
  }
  return out;
}

export const PLANTA_GENERAL = general.url;
export const MARCADA = porZona(marcadas, "marcada");
export const DETALLE_IMG = porZona(detalles, "detalle");
