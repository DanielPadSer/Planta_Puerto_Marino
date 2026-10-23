import { describe, it, expect, beforeEach } from 'vitest';
import { validarAcceso, DEMO_USUARIO, DEMO_CLAVE, validarDecision, siguienteVersion } from '@/domain/calidad';
import { useCalidad } from '@/features/panel-calidad/store';
import { LOTES, PRODUCTOS, EVENTOS } from '@/mocks/calidad';
describe('Reglas del panel de calidad',()=>{
 it('solo acepta el usuario demo correcto',()=>{expect(validarAcceso(DEMO_USUARIO,DEMO_CLAVE)).toBe(true);expect(validarAcceso('otro@correo.com',DEMO_CLAVE)).toBe(false);expect(validarAcceso(DEMO_USUARIO,'incorrecta')).toBe(false);});
 it('liberar exige conexión',()=>expect(validarDecision('ingeniera',false,'Inspección conforme')).not.toBeNull());
 it('solo la ingeniera decide lotes',()=>{expect(validarDecision('operario',true,'Inspección conforme')).not.toBeNull();expect(validarDecision('ingeniera',true,'Inspección conforme')).toBeNull();});
 it('el motivo es obligatorio',()=>expect(validarDecision('ingeniera',true,'')).not.toBeNull());
 it('rechazar exige destino',()=>{expect(validarDecision('ingeniera',true,'Olor no conforme',true,'')).not.toBeNull();expect(validarDecision('ingeniera',true,'Olor no conforme',true,'Devolución')).toBeNull();});
 it('la nueva versión es v+1',()=>{expect(siguienteVersion(3,'Validación térmica')).toBe(4);expect(()=>siguienteVersion(3,'')).toThrow();});
});
describe('Decisiones locales auditadas',()=>{
 beforeEach(()=>useCalidad.setState({lotes:LOTES,productos:PRODUCTOS,versiones:PRODUCTOS,eventos:EVENTOS}));
 it('una decisión sin conexión no modifica el lote ni el historial',()=>{expect(useCalidad.getState().decidir('LT-0245','Inspección conforme',false,false,'')).not.toBeNull();expect(useCalidad.getState().lotes[0]?.estado).toBe('Cuarentena');expect(useCalidad.getState().eventos.length).toBe(5);});
 it('liberar conserva versión y añade un evento',()=>{expect(useCalidad.getState().decidir('LT-0245','Inspección conforme',true,false,'')).toBeNull();expect(useCalidad.getState().lotes[0]?.estado).toBe('Liberado');expect(useCalidad.getState().lotes[0]?.version).toBe(3);expect(useCalidad.getState().eventos.length).toBe(6);expect(useCalidad.getState().eventos[0]?.motivo).toBe('Inspección conforme');});
 it('cambiar regla conserva la versión previa y la del lote',()=>{const p=PRODUCTOS[0];if(!p)throw new Error('Falta producto');useCalidad.getState().guardarProducto({...p,tiempo:3},'Validación térmica');expect(useCalidad.getState().productos[0]?.version).toBe(4);expect(useCalidad.getState().versiones[0]?.tiempo).toBe(2);expect(useCalidad.getState().lotes[0]?.version).toBe(3);});
});
