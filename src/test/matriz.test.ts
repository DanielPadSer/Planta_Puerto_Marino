import { expect, it } from "vitest";
import { validarCelda, permiteExcepcion, MATRIZ_INICIAL } from "@/domain/matriz";
import { useCalidad } from "@/features/panel-calidad/store";
it("N0 no aplica entre categorías distintas", () => expect(validarCelda({ desde:"ave", hacia:"pescado", nivel:"N0", excepcion:false })).toBe(false));
it("diagonal exige N0 automático", () => expect(validarCelda({ desde:"ave", hacia:"ave", nivel:"N2", excepcion:false })).toBe(false));
it("N3 no permite excepción", () => expect(permiteExcepcion({ desde:"ave", hacia:"pescado", nivel:"N3", excepcion:true })).toBe(false));
it("alérgeno no permite excepción", () => expect(permiteExcepcion({ desde:"crustaceos", hacia:"pescado", nivel:"N2", excepcion:true })).toBe(false));
it("N1 sin alérgeno permite excepción", () => expect(permiteExcepcion({ desde:"ave", hacia:"pescado", nivel:"N1", excepcion:true })).toBe(true));
it("guardar exige motivo", () => expect(useCalidad.getState().guardarMatriz(MATRIZ_INICIAL.celdas, "")).toBeTruthy());
it("guarda v3 sin borrar v2 ni cambiar lotes", () => {
  useCalidad.setState({ matrices:[MATRIZ_INICIAL] });
  const lotes = useCalidad.getState().lotes;
  const celdas = MATRIZ_INICIAL.celdas.map((c) => c.desde === "ave" && c.hacia === "pescado" ? { ...c, nivel:"N3" as const } : c);
  expect(useCalidad.getState().guardarMatriz(celdas, "Validación sanitaria")).toBeNull();
  expect(useCalidad.getState().matrices.map((m) => m.version)).toEqual([2,3]);
  expect(useCalidad.getState().matrices[0]?.celdas).toEqual(MATRIZ_INICIAL.celdas);
  expect(useCalidad.getState().lotes).toBe(lotes);
  expect(useCalidad.getState().eventos[0]?.version).toBe(3);
});