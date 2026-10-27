import { tabla, pk, txt, largo, ent, dec, bool, fecha, ts, json, fk, uq, VERSION } from "./tipos";
const M = "seguridad" as const;
export const SEGURIDAD = {
  Sede: tabla("core_sede", "K", M, "Planta y puntos de venta; una sede puede depender de otra.", {
    id: pk(), nombre: uq(txt(80)), tipo: txt(20), sede_id: fk("Sede", true), ...VERSION,
  }),
  CategoriaSanitaria: tabla("catalogos_categoriasanitaria", "K", M, "Especie o familia sanitaria que decide la limpieza entre productos.", {
    id: pk(), nombre: uq(txt(60)), es_alergeno: bool(), ...VERSION,
  }),
  Alergeno: tabla("catalogos_alergeno", "K", M, "Alérgenos de declaración obligatoria.", {
    id: pk(), codigo: uq(txt(20)), nombre: uq(txt(60)), ...VERSION,
  }),
  Ubicacion: tabla("catalogos_ubicacion", "K", M, "Cuartos fríos, estantes y áreas físicas con temperatura objetivo.", {
    id: pk(), codigo: uq(txt(20)), nombre: txt(80), tipo: txt(20), temp_objetivo_c: dec("5,1", true), ...VERSION,
  }),
  Usuario: tabla("core_usuario", "K", M, "Personas que firman cada registro; PIN guardado solo como hash.", {
    id: pk(), nombre: txt(120), rol: txt(20), documento: uq(txt(20, true)), pin_hash: txt(128), sede_id: fk("Sede", true), ...VERSION,
  }),
  Estacion: tabla("core_estacion", "K", M, "Estaciones del proceso (1 Recepción … 6 Despacho).", {
    id: pk(), codigo: uq(txt(4)), nombre: uq(txt(80)), tipo: txt(20), ubicacion_id: fk("Ubicacion", true), ...VERSION,
  }),
  Producto: tabla("catalogos_producto", "K", M, "Materias primas, insumos, productos terminados y kits.", {
    id: pk(), codigo: uq(txt(30)), nombre: uq(txt(120)), tipo: txt(20), unidad: txt(5), ruta: txt(15), categoria_sanitaria_id: fk("CategoriaSanitaria"), ...VERSION,
  }),
  Dispositivo: tabla("core_dispositivo", "S", M, "Tabletas y PCs autorizados; el token se guarda como hash.", {
    id: pk(), nombre: uq(txt(80)), tipo: txt(10), token_hash: txt(128), estacion_id: fk("Estacion", true), propietario_id: fk("Usuario", true), revocado: bool(),
  }),
  Auditoria: tabla("core_auditoria", "S", M, "Bitácora inmutable: antes, después, motivo, usuario y dispositivo.", {
    id: pk(), entidad: txt(80), entidad_id: txt(64), accion: txt(20), antes: json(true), despues: json(true), motivo: txt(255), usuario_id: fk("Usuario", true), dispositivo_id: fk("Dispositivo", true), creado_en: ts(),
  }),
  Proveedor: tabla("catalogos_proveedor", "K", M, "Proveedores de materia prima e insumos.", {
    id: pk(), nombre: uq(txt(120)), nit: uq(txt(20)), contacto: txt(120), ...VERSION,
  }),
  Contenedor: tabla("catalogos_contenedor", "K", M, "Tipos de canastilla o caja con su tara.", {
    id: pk(), nombre: uq(txt(60)), tara_kg: dec("10,3"), retornable: bool(), ...VERSION,
  }),
  ProductoAlergeno: tabla("catalogos_productoalergeno", "K", M, "Alérgenos que contiene cada producto.", {
    id: pk(), producto_id: fk("Producto"), alergeno_id: fk("Alergeno"),
  }),
  Receta: tabla("catalogos_receta", "K", M, "Receta versionada de un producto terminado o kit.", {
    id: pk(), producto_id: fk("Producto"), version: ent(), rendimiento_esperado_pct: dec("5,2"), vigente_desde: fecha(), activo: bool(),
  }),
  ItemReceta: tabla("catalogos_itemreceta", "K", M, "Insumos y cantidades por unidad de cada receta.", {
    id: pk(), receta_id: fk("Receta"), insumo_id: fk("Producto"), cantidad_por_unidad: dec("10,4"), merma_esperada_pct: dec("5,2"),
  }),
  CausaMerma: tabla("catalogos_causamerma", "K", M, "Causas tipificadas de merma por etapa.", {
    id: pk(), nombre: uq(txt(80)), etapa: txt(20), ...VERSION,
  }),
  Parametro: tabla("catalogos_parametro", "K", M, "Parámetros generales (tolerancias, vida útil…).", {
    id: pk(), clave: uq(txt(60)), valor: txt(255), tipo: txt(10), descripcion: txt(255), ...VERSION,
  }),
  ReglaControl: tabla("catalogos_reglacontrol", "K", M, "Límites de temperatura y tiempo por producto y control.", {
    id: pk(), producto_id: fk("Producto"), tipo_control: txt(15), temp_min_c: dec("5,1", true), temp_max_c: dec("5,1", true), tiempo_min_min: ent(true), tiempo_max_min: ent(true), exige_temp_centro: bool(), version_regla: ent(), vigente_desde: fecha(),
  }),
};
