import { publicClient } from './supabase';

export const camposPuesto = 'id,nombre,distrito,mercado,direccion,horario,contacto,latitud,longitud,verificado,suspendido';
export const camposResena = 'id,puesto_id,valoracion,comentario,visible,creada_en';

export type Puesto = {
  id: string; nombre: string; distrito: string; mercado: string; direccion: string; horario: string;
  contacto: string; latitud: number | null; longitud: number | null; verificado: boolean; suspendido: boolean;
};
export type Producto = {
  id: string; puesto_id: string; planta_id: string | null; nombre: string; presentacion: string;
  precio: number; disponible: boolean; procedencia: string | null; calidad: string | null;
};
export type Planta = {
  id: string; nombre: string; cientifico: string; usos: string; preparacion: string; precauciones: string;
  fuente_nombre: string; fuente_url: string; publicada: boolean;
};
export type Resena = {
  id: string; puesto_id: string; valoracion: number; comentario: string; visible: boolean; creada_en: string;
};
export type Oferta = Pick<Producto, 'id' | 'puesto_id' | 'nombre' | 'presentacion' | 'precio' | 'disponible'> & {
  puesto: string; distrito: string;
};

export function datos<T>({ data, error }: { data: T; error: unknown }): T {
  if (error) throw new Error('No se pudo consultar el directorio.');
  return data;
}

export async function obtenerPuestos(): Promise<Puesto[]> {
  const resultado = await publicClient().from('puestos').select(camposPuesto).eq('suspendido', false).order('nombre');
  return datos(resultado) ?? [];
}

export async function obtenerPuesto(id: string): Promise<Puesto | null> {
  return datos(await publicClient().from('puestos').select(camposPuesto).eq('id', id).eq('suspendido', false).maybeSingle());
}

export async function obtenerOfertas(texto: string, nombre: string | null): Promise<Oferta[]> {
  return datos(await publicClient().rpc('buscar_ofertas', { p_texto: texto, p_nombre: nombre })) ?? [];
}

export const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
export const fecha = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone: 'America/Lima' });
