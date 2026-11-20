import { redirect } from 'next/navigation';
import { sessionClient } from './supabase';
import { rolPermitido, type Rol } from './validacion';

export async function sesion() {
  const cliente = await sessionClient();
  const { data } = await cliente.auth.getClaims();
  const id = data?.claims.sub;
  if (!id) return null;
  const { data: perfil, error } = await cliente.from('perfiles').select('rol').eq('id', id).maybeSingle();
  if (error) throw new Error('No se pudo consultar el perfil.');
  if (!perfil) return null;
  return { cliente, id, rol: perfil.rol as Rol };
}

export async function exigirRol(rol?: Rol) {
  const actual = await sesion();
  if (!actual) redirect('/ingresar');
  if (rol && !rolPermitido(actual.rol, rol)) redirect('/panel?estado=denegado');
  return actual;
}
