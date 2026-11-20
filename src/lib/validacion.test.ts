import { describe, expect, it } from 'vitest';
import {
  busqueda, gestionPuestoSchema, loginSchema, moderacionSchema, plantaSchema,
  productoSchema, puestoSchema, registroSchema, resenaSchema, rolPermitido,
} from './validacion';

const id = '20000000-0000-4000-8000-000000000001';
const cuenta = { correo: 'demo@example.invalid', password: 'Ejemplo de validación' };
const puesto = { nombre: 'Hierbas Lima', mercado: 'Feria central', distrito: 'Barranco', direccion: 'Calle de ejemplo', horario: 'Lun a sáb', contacto: 'ventas@example.invalid', latitud: '', longitud: '' };
const oferta = { id, nombre: 'Manzanilla', presentacion: 'Flores secas', precio: '7,50', disponible: 'true', procedencia: 'Cusco', calidad: 'artesanal', planta_id: '' };
const ficha = { nombre: 'Manzanilla', cientifico: 'Matricaria recutita', usos: 'Uso tradicional', preparacion: 'Preparación descrita', precauciones: 'Puede causar alergia', fuente_nombre: 'NCCIH', fuente_url: 'https://www.nccih.nih.gov/health/chamomile', publicada: 'true' };

describe('Cuentas y permisos', () => {
  it('HU-05 permite los dos roles públicos y rechaza administrador', () => {
    for (const rol of ['comprador', 'hierbero']) expect(registroSchema.safeParse({ ...cuenta, rol }).success).toBe(true);
    expect(registroSchema.safeParse({ ...cuenta, rol: 'administrador' }).success).toBe(false);
  });
  it('HU-06 valida las credenciales y exige el rol de la ruta', () => {
    expect(loginSchema.safeParse(cuenta).success).toBe(true);
    expect(loginSchema.safeParse({ ...cuenta, password: '' }).success).toBe(false);
    expect(rolPermitido(null, 'comprador')).toBe(false);
    expect(rolPermitido('hierbero', 'hierbero')).toBe(true);
    expect(rolPermitido('comprador', 'hierbero')).toBe(false);
  });
});

describe('Directorio y catálogo', () => {
  it('HU-08 acepta datos completos y rechaza un nombre vacío', () => {
    expect(puestoSchema.parse(puesto).latitud).toBeNull();
    expect(puestoSchema.safeParse({ ...puesto, nombre: '' }).success).toBe(false);
  });
  it('HU-09 guarda coordenadas solo cuando forman un par válido', () => {
    expect(puestoSchema.parse({ ...puesto, latitud: '-12.1', longitud: '-77.0' })).toMatchObject({ latitud: -12.1, longitud: -77 });
    expect(puestoSchema.safeParse({ ...puesto, latitud: '-91', longitud: '-77' }).success).toBe(false);
    expect(puestoSchema.safeParse({ ...puesto, latitud: '-12' }).success).toBe(false);
  });
  it('HU-13 y HU-14 convierte soles, reconoce agotado y rechaza precios inválidos', () => {
    expect(productoSchema.parse(oferta)).toMatchObject({ precio: 7.5, disponible: true });
    expect(productoSchema.parse({ ...oferta, disponible: 'false' }).disponible).toBe(false);
    for (const precio of ['0', '-1', '4.123', '1e3']) expect(productoSchema.safeParse({ ...oferta, precio }).success).toBe(false);
  });
  it('HU-15 y HU-20 conserva la búsqueda como texto y limita el tamaño', () => {
    expect(busqueda("  <script>manzanilla'; -- ")).toBe("<script>manzanilla'; --");
    expect(busqueda('x'.repeat(101))).toBe('');
  });
  it('HU-21 y HU-22 vincula fichas y restringe la calidad declarada', () => {
    expect(productoSchema.parse({ ...oferta, planta_id: id }).planta_id).toBe(id);
    expect(productoSchema.parse(oferta)).toMatchObject({ planta_id: null, procedencia: 'Cusco', calidad: 'artesanal' });
    expect(productoSchema.safeParse({ ...oferta, calidad: 'certificada' }).success).toBe(false);
  });
});

describe('Fichas y moderación', () => {
  it('HU-18 exige precauciones y una fuente HTTPS', () => {
    expect(plantaSchema.parse(ficha).publicada).toBe(true);
    expect(plantaSchema.safeParse({ ...ficha, precauciones: '' }).success).toBe(false);
    expect(plantaSchema.safeParse({ ...ficha, fuente_url: 'javascript:alert(1)' }).success).toBe(false);
  });
  it('HU-24 y HU-26 restringen los estados a valores explícitos y al rol administrador', () => {
    expect(gestionPuestoSchema.parse({ id, verificado: 'true', suspendido: 'false' })).toMatchObject({ verificado: true, suspendido: false });
    expect(moderacionSchema.parse({ id, visible: 'false' }).visible).toBe(false);
    expect(moderacionSchema.safeParse({ id, visible: 'no' }).success).toBe(false);
    expect(rolPermitido('hierbero', 'administrador')).toBe(false);
  });
  it('HU-25 permite reseñas válidas y rechaza valores fuera de rango', () => {
    expect(resenaSchema.parse({ puesto_id: id, valoracion: '4', comentario: 'Buena atención' }).valoracion).toBe(4);
    expect(resenaSchema.safeParse({ puesto_id: id, valoracion: '6', comentario: 'Buena atención' }).success).toBe(false);
  });
});
