import { describe, it, expect, beforeEach } from 'vitest';
import { vigenciaDocumento, vigenciaOperario, alergenosDeReceta, leyendaContiene, cambiaPerfilAlergenos, limpiezaPorPerfil, validarReceta, validarTrazas, documentoSchema } from '@/domain/cuartaFase';
import { PERSONAL_DEMO, ALERGENOS_DEMO, PERFILES_DEMO, RECETAS_DEMO, PLANTILLAS_DEMO, LOTES_ALERGENOS, HOY_DEMO } from '@/mocks/cuartaFase';
import { useCuarta } from '@/features/panel-calidad/cuartaStore';
import { useCalidad } from '@/features/panel-calidad/store';
describe('Cuarta fase: reglas concretas',()=>{
 const op=PERSONAL_DEMO[0];const receta=RECETAS_DEMO[0];if(!op||!receta)throw Error('Mocks requeridos');
 it('avisa exactamente a 30 días',()=>{const doc=op.documentos[1];if(!doc)throw Error('Documento requerido');expect(vigenciaDocumento(doc,HOY_DEMO)).toBe('por_vencer');expect(vigenciaDocumento({...doc,venceEn:'2026-11-26'},HOY_DEMO)).toBe('vigente');});
 it('distingue vencido y sin documento',()=>{const vencido=PERSONAL_DEMO[2];const falta=PERSONAL_DEMO[4];if(!vencido||!falta)throw Error('Personal requerido');expect(vigenciaOperario(vencido,HOY_DEMO)).toBe('vencido');expect(vigenciaOperario(falta,HOY_DEMO)).toBe('sin_documento');});
 it('un kit calcula unión sin duplicar',()=>{expect(alergenosDeReceta(receta,PERFILES_DEMO)).toEqual(['ALG-002','ALG-004']);});
 it('CONTIENE se genera en mayúscula',()=>{expect(leyendaContiene([{nombreRotulado:'pescado'},{nombreRotulado:'crustáceos'}])).toBe('CONTIENE: PESCADO, CRUSTÁCEOS');});
 it('un cambio exige N2 sin excepción',()=>{expect(cambiaPerfilAlergenos(['ALG-004'],['ALG-002'])).toBe(true);expect(limpiezaPorPerfil(['ALG-004'],['ALG-002'])).toEqual({nivel:'N2',excepcion:false});expect(cambiaPerfilAlergenos(['a','b'],['b','a','a'])).toBe(false);});
 it('bloquea recetas con ingrediente sin perfil',()=>{expect(validarReceta(receta,PERFILES_DEMO)).not.toBeNull();expect(validarReceta(receta,PERFILES_DEMO.map(p=>({...p,estadoFicha:'validado'})))).toBeNull();});
 it('las trazas requieren justificación',()=>{expect(validarTrazas(true,'')).not.toBeNull();expect(validarTrazas(true,'Evaluación técnica')).toBeNull();});
 it('renovación exige archivo y fechas ordenadas',()=>{expect(documentoSchema.safeParse({tipo:'capacitacion_bpm',emitidoEn:'2026-10-26',venceEn:'2026-10-25',horas:10,entidad:'Demo',archivoNombre:''}).success).toBe(false);});
});
describe('Versiones auditadas e inmutables',()=>{
 beforeEach(()=>{useCuarta.setState({personal:PERSONAL_DEMO,alergenos:ALERGENOS_DEMO,versionesAlergenos:ALERGENOS_DEMO,perfiles:PERFILES_DEMO,versionesPerfiles:PERFILES_DEMO,plantillas:PLANTILLAS_DEMO,lotes:LOTES_ALERGENOS});useCalidad.setState({eventos:[]});});
 it('alérgeno requiere motivo y conserva lote v3',()=>{const a=ALERGENOS_DEMO[3];if(!a)throw Error('Alérgeno requerido');expect(()=>useCuarta.getState().guardarAlergeno(a,'')).toThrow();useCuarta.getState().guardarAlergeno({...a,nombreRotulado:'pescado actualizado'},'Cambio normativo');expect(useCuarta.getState().alergenos[3]?.version).toBe(4);expect(useCuarta.getState().versionesAlergenos[3]?.nombreRotulado).toBe('Pescado');expect(useCuarta.getState().lotes[0]?.version).toBe(3);expect(useCalidad.getState().eventos[0]?.motivo).toBe('Cambio normativo');});
 it('perfil requiere motivo y crea snapshot',()=>{const p=PERFILES_DEMO[1];if(!p)throw Error('Perfil requerido');expect(()=>useCuarta.getState().guardarPerfil(p,'')).toThrow();useCuarta.getState().guardarPerfil({...p,alergenoIds:['ALG-002']},'Nueva ficha técnica');expect(useCuarta.getState().versionesPerfiles[1]?.alergenoIds).toEqual(['ALG-004']);expect(useCuarta.getState().perfiles[1]?.version).toBe(4);});
 it('plantilla requiere motivo y preserva v2',()=>{const p=PLANTILLAS_DEMO[1];if(!p)throw Error('Plantilla requerida');expect(()=>useCuarta.getState().publicarPlantilla(p,'')).toThrow();useCuarta.getState().publicarPlantilla({...p,items:p.items.slice(1)},'Revisión de checklist');expect(useCuarta.getState().plantillas.at(-1)?.version).toBe(3);expect(useCuarta.getState().plantillas[1]?.items.length).toBe(10);});
});
