import { z } from 'zod';

const texto = (min: number, max: number) => z.string().trim().min(min).max(max);
const opcional = (max: number) => z.union([z.literal(''), texto(2, max)]).transform((value) => value || null);
const coordenada = (min: number, max: number) => z.string().trim().pipe(
  z.union([z.literal('').transform(() => null), z.string().regex(/^-?\d+(?:\.\d+)?$/).transform(Number).pipe(z.number().min(min).max(max))]),
);

export const idPublico = z.uuid();
export const rolesRegistro = z.enum(['comprador', 'hierbero']);
export type Rol = z.infer<typeof rolesRegistro> | 'administrador';
export const rolPermitido = (actual: string | null, requerido: Rol) => actual === requerido;
const correo = z.email().trim().max(254).transform((value) => value.toLowerCase());

export const loginSchema = z.object({ correo, password: z.string().min(1).max(72) });
export const registroSchema = loginSchema.extend({ password: z.string().min(8).max(72), rol: rolesRegistro });

export const puestoSchema = z.object({
  nombre: texto(2, 100), distrito: texto(2, 80), mercado: texto(2, 100), direccion: texto(4, 200),
  horario: texto(3, 120), contacto: texto(3, 120),
  latitud: coordenada(-90, 90), longitud: coordenada(-180, 180),
}).refine(({ latitud, longitud }) => (latitud === null) === (longitud === null));

export const calidades = ['seleccionada', 'estandar', 'artesanal'] as const;
export const estados = z.enum(['true', 'false']).transform((value) => value === 'true');
export const productoSchema = z.object({
  id: z.union([z.literal(''), idPublico]).optional(),
  nombre: texto(2, 120), presentacion: texto(2, 120),
  precio: z.string().trim().regex(/^\d{1,7}(?:[.,]\d{1,2})?$/)
    .transform((value) => Number(value.replace(',', '.'))).pipe(z.number().positive().max(9999999.99)),
  disponible: estados, procedencia: opcional(160),
  calidad: z.union([z.literal(''), z.enum(calidades)]).transform((value) => value || null),
  planta_id: z.union([z.literal(''), idPublico]).transform((value) => value || null),
});

export const plantaSchema = z.object({
  id: z.union([z.literal(''), idPublico]).optional(),
  nombre: texto(2, 100), cientifico: texto(3, 140), usos: texto(3, 1600),
  preparacion: texto(3, 1600), precauciones: texto(3, 1600),
  fuente_nombre: texto(2, 120),
  fuente_url: z.string().trim().max(500).pipe(z.url({ protocol: /^https$/ }))
    .refine((value) => /^https:\/\//.test(value)),
  publicada: estados,
});

export const resenaSchema = z.object({
  puesto_id: idPublico,
  valoracion: z.enum(['1', '2', '3', '4', '5']).transform(Number),
  comentario: texto(3, 500),
});

export const gestionPuestoSchema = z.object({ id: idPublico, verificado: estados, suspendido: estados });
export const moderacionSchema = z.object({ id: idPublico, visible: estados });
const consulta = z.string().trim().max(100).catch('');
export const busqueda = (value: unknown) => consulta.parse(value);
