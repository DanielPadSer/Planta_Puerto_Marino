import { describe, it, expect, afterEach } from "vitest";
import {
  puede,
  recursosVisibles,
  motivoRestriccion,
  assertPuede,
  CONFIG_PERMISOS,
  ErrorPermiso,
} from "./permisos";

describe("matriz de permisos del panel", () => {
  afterEach(() => {
    CONFIG_PERMISOS.adminPuedeFirmarCalidad = false;
    CONFIG_PERMISOS.ingenieraEditaPlantillasBPM = false;
  });

  it("la ingeniera firma cuarentenas y no edita personal.operarios", () => {
    expect(puede("ingeniera", "firmar", "bandeja.cuarentenas")).toBe(true);
    expect(puede("ingeniera", "editar", "personal.operarios")).toBe(false);
  });

  it("el supervisor edita personal.operarios y no edita reglas", () => {
    expect(puede("supervisor", "editar", "personal.operarios")).toBe(true);
    expect(puede("supervisor", "editar", "reglas")).toBe(false);
  });

  it("el administrador edita dispositivos.registro y no firma cuarentenas", () => {
    expect(puede("administrador", "editar", "dispositivos.registro")).toBe(true);
    expect(puede("administrador", "firmar", "bandeja.cuarentenas")).toBe(false);
  });

  it("nadie edita auditoria ni historial", () => {
    for (const rol of ["ingeniera", "supervisor", "administrador"] as const) {
      expect(puede(rol, "editar", "auditoria")).toBe(false);
      expect(puede(rol, "editar", "historial")).toBe(false);
    }
  });

  it("con adminPuedeFirmarCalidad el administrador sí firma", () => {
    CONFIG_PERMISOS.adminPuedeFirmarCalidad = true;
    expect(puede("administrador", "firmar", "bandeja.cuarentenas")).toBe(true);
    expect(puede("administrador", "firmar", "trazabilidad.bloqueo")).toBe(true);
  });

  it("con ingenieraEditaPlantillasBPM la ingeniera edita plantillas", () => {
    expect(puede("ingeniera", "editar", "personal.plantillas")).toBe(false);
    CONFIG_PERMISOS.ingenieraEditaPlantillasBPM = true;
    expect(puede("ingeniera", "editar", "personal.plantillas")).toBe(true);
  });

  it("recursosVisibles devuelve listas distintas para los tres roles", () => {
    const i = recursosVisibles("ingeniera");
    const s = recursosVisibles("supervisor");
    const a = recursosVisibles("administrador");
    expect(i).not.toEqual(s);
    expect(s).not.toEqual(a);
    expect(i).not.toEqual(a);
    expect(a).toContain("usuarios.gestion");
    expect(i).not.toContain("usuarios.gestion");
    expect(s).toContain("usuarios.pin");
  });

  it("motivoRestriccion explica en español y assertPuede lanza 403", () => {
    expect(motivoRestriccion("supervisor", "firmar", "bandeja.cuarentenas")).toContain(
      "ingeniera de alimentos",
    );
    expect(motivoRestriccion("administrador", "editar", "historial")).toContain("auditoría");
    expect(() => assertPuede("supervisor", "editar", "reglas")).toThrow(ErrorPermiso);
    try {
      assertPuede("ingeniera", "editar", "personal.operarios");
    } catch (e) {
      expect((e as ErrorPermiso).status).toBe(403);
    }
    expect(() => assertPuede("ingeniera", "firmar", "bandeja.cuarentenas")).not.toThrow();
  });
});
