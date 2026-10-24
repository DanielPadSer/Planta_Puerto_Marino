import { expect, it } from "vitest";
import { autorizarManualCF1, validarPesoCF1 } from "@/domain/pesoCF1";
it("rechaza peso cero", () => expect(validarPesoCF1(0, 20.8, "LT-0238")).toBe("El peso debe ser mayor que cero"));
it("rechaza peso superior a 20,8 kg", () => expect(validarPesoCF1(20.9, 20.8, "LT-0238")).toBeTruthy());
it("permite captura de 20,8 kg", () => expect(validarPesoCF1(20.8, 20.8, "LT-0238")).toBeNull());
it("exige PIN de supervisor", () => expect(autorizarManualCF1("1234", "Contingencia")).toBeTruthy());
it("exige motivo manual", () => expect(autorizarManualCF1("4321", " ")).toBeTruthy());