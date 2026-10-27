import { describe, expect, it } from "vitest";
import { ESQUEMA, NOMBRES, RELACIONES, definicion } from "@/modelo/esquema";
import { SEMILLA } from "@/modelo/semilla";
import { impacto, integridad, netoPesaje, nivelCambio, procesarEvento, saldos, trazarPaquete, validarPesaje, validarTransicion } from "@/modelo/consultas";
import { generarSQL, idDe } from "@/modelo/sql";
import { indicesDexie } from "@/modelo/db";

describe("esquema", () => {
  it("tiene 65 tablas y 1 vista", () => {
    expect(NOMBRES.filter((n) => definicion(n).clase !== "V")).toHaveLength(65);
    expect(NOMBRES.filter((n) => definicion(n).clase === "V")).toEqual(["SaldoLote"]);
  });
  it("todas las llaves foráneas apuntan a tablas existentes", () => {
    for (const r of RELACIONES) expect(ESQUEMA[r.hacia]).toBeDefined();
  });
  it("los datos de ejemplo no tienen problemas de integridad", () => {
    expect(integridad(SEMILLA)).toEqual([]);
  });
  it("detecta una llave foránea rota", () => {
    const roto = { ...SEMILLA, Lote: [{ ...SEMILLA.Lote[0]!, producto_id: "no-existe" }] };
    expect(integridad(roto).some((p) => p.tipo === "fk" && p.campo === "producto_id")).toBe(true);
  });
});

describe("reglas", () => {
  it("saldo de LT-0238 en CF-1 es 67 kg", () => {
    expect(saldos(SEMILLA.Movimiento).find((s) => s.id === "lt-0238:ub-cf1")?.saldo_kg).toBe(67);
  });
  it("neto = bruto − tara − hielo", () => expect(netoPesaje(68.2, 3.4, 2.3)).toBe(62.5));
  it("peso manual exige supervisor", () =>
    expect(validarPesaje({ origen: "manual", estable: false, autorizado_por_id: null, motivo_manual: "Falla báscula" })).toBeTruthy());
  it("peso de báscula exige estabilidad", () =>
    expect(validarPesaje({ origen: "bascula", estable: false, autorizado_por_id: null, motivo_manual: "" })).toBeTruthy());
  it("la matriz usa la última versión activa", () =>
    expect(nivelCambio(SEMILLA.MatrizCambio, "cat-vegetal", "cat-pescado")).toBe("N1"));
  it("cambio de crustáceos a pescado exige N2", () =>
    expect(nivelCambio(SEMILLA.MatrizCambio, "cat-crustaceos", "cat-pescado")).toBe("N2"));
  it("solo la ingeniera libera y con conexión", () => {
    expect(validarTransicion("cuarentena", "liberado", "supervisor", "Conforme", true)).toBeTruthy();
    expect(validarTransicion("cuarentena", "liberado", "ingeniera", "Conforme", false)).toBe("Liberar un lote exige conexión.");
    expect(validarTransicion("cuarentena", "liberado", "ingeniera", "Conforme", true)).toBeNull();
    expect(validarTransicion("rechazado", "liberado", "ingeniera", "Conforme", true)).toBeTruthy();
  });
  it("un contador repetido genera conflicto", () =>
    expect(procesarEvento(SEMILLA.EventoSync[1]!, 41).estado).toBe("conflicto"));
});

describe("trazabilidad", () => {
  it("PQ-0301-0001 llega hasta el proveedor y la sede", () => {
    const t = trazarPaquete(SEMILLA, "pq-0301-0001");
    expect(t?.arbol.lote.codigo).toBe("LT-0301");
    expect(t?.arbol.origenes[0]?.proveedor?.nombre).toBe("Pesquera del Pacífico S.A.S.");
    expect(t?.remisiones[0]?.sede).toBe("Sede Norte");
  });
  it("LT-0238 impacta a LT-0301 y LT-0302", () => {
    expect(impacto(SEMILLA, "LT-0238")?.lotes.map((l) => l.codigo).sort()).toEqual(["LT-0238", "LT-0301", "LT-0302"]);
  });
});

describe("salidas", () => {
  it("el SQL crea 65 tablas y la vista", () => {
    const sql = generarSQL(SEMILLA);
    expect(sql.match(/CREATE TABLE /g)).toHaveLength(65);
    expect(sql).toContain("CREATE VIEW inventario_saldolote");
  });
  it("el UUID es estable y válido", () => {
    expect(idDe("lt-0238")).toBe(idDe("lt-0238"));
    expect(idDe("lt-0238")).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it("Dexie indexa 65 tablas sin la vista", () => {
    expect(Object.keys(indicesDexie())).toHaveLength(65);
    expect(indicesDexie()["Lote"]).toContain("&codigo");
  });
});
