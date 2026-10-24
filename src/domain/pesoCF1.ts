/** Reglas aisladas de captura; autorización simulada, sin hardware ni backend. */
export function validarPesoCF1(peso: number, saldo: number, codigo: string): string | null {
  if (!Number.isFinite(peso) || peso <= 0) return "El peso debe ser mayor que cero";
  if (peso > saldo) return `El peso supera el saldo de ${codigo} (${saldo.toLocaleString("es-CO", { minimumFractionDigits: 1 })} kg)`;
  return null;
}
export function autorizarManualCF1(pin: string, motivo: string): string | null {
  if (pin !== "4321") return "PIN de supervisor incorrecto";
  if (!motivo.trim()) return "El motivo es obligatorio";
  return null;
}