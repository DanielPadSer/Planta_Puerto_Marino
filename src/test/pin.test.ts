import { describe, expect, it } from "vitest";
import { BLOQUEO_MS, intentosRestantes, MAX_INTENTOS, pinValidoFormato } from "@/domain/pin";

describe("PIN de operario", () => {
  it("acepta de 4 a 6 dígitos", () => {
    expect(pinValidoFormato("123")).toBe(false);
    expect(pinValidoFormato("1234")).toBe(true);
    expect(pinValidoFormato("123456")).toBe(true);
    expect(pinValidoFormato("1234567")).toBe(false);
  });
  it("bloquea 30 s tras 3 fallos", () => {
    expect(MAX_INTENTOS).toBe(3);
    expect(BLOQUEO_MS).toBe(30_000);
    expect(intentosRestantes(1)).toBe(2);
  });
});
