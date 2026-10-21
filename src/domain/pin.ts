export const PIN_MIN = 4;
export const PIN_MAX = 6;
export const MAX_INTENTOS = 3;
export const BLOQUEO_MS = 30_000;

export function pinValidoFormato(pin: string): boolean {
  return /^\d+$/.test(pin) && pin.length >= PIN_MIN && pin.length <= PIN_MAX;
}

export function intentosRestantes(fallos: number): number {
  return Math.max(0, MAX_INTENTOS - fallos);
}
