import { describe, expect, it } from "vitest";
import { calcularVencimiento, nivelExigido, pesoNeto, sugerirFEFO } from "@/domain/reglas";

describe("Matriz de limpieza", () => {
  it("pollo → pescado exige N2", () => expect(nivelExigido("ave", "pescado")).toBe("N2"));
  it("hacia crustáceos exige N2 sin excepción", () => expect(nivelExigido("pescado", "crustaceos")).toBe("N2"));
  it("desde moluscos exige N2 sin excepción", () => expect(nivelExigido("moluscos", "vegetal")).toBe("N2"));
  it("mismo producto es N0 automático", () => expect(nivelExigido("pescado", "pescado")).toBe("N0"));
  it("cambio de producto sin especie ni alérgenos exige N1", () => expect(nivelExigido("pescado", "pescado", false, false, false)).toBe("N1"));
  it("cambio de especie en la misma categoría exige N2", () => expect(nivelExigido("pescado", "pescado", false, true, false)).toBe("N2"));
  it("cambio de perfil en la misma categoría exige N2", () => expect(nivelExigido("pescado", "pescado", false, false, true)).toBe("N2"));
});

describe("Recepción", () => {
  it("neto = bruto − contenedores − hielo", () => {
    expect(pesoNeto(51.8, [{ nombre: "Canasta", pesoKg: 0.8, cantidad: 4 }], 0)).toBe(48.6);
  });
});

describe("FEFO", () => {
  it("sugiere primero el que vence antes y excluye cuarentena y vencidos", () => {
    const r = sugerirFEFO([
      { codigo: "B", estante: "", saldoKg: 1, vence: "2026-09-27" },
      { codigo: "A", estante: "", saldoKg: 1, vence: "2026-09-26" },
      { codigo: "Q", estante: "", saldoKg: 1, vence: "2026-09-20", cuarentena: true },
      { codigo: "V", estante: "", saldoKg: 1, vence: "2026-09-01" },
    ], "2026-09-24");
    expect(r.map((l) => l.codigo)).toEqual(["A", "B"]);
  });
});

describe("Vencimiento", () => {
  it("suma la vida útil en días", () => expect(calcularVencimiento("2026-09-24", 5)).toBe("2026-09-29"));
});
