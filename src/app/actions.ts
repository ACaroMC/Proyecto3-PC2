'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { exigirRol } from '@/lib/sesion';
import { sessionClient } from '@/lib/supabase';
import {
  gestionPuestoSchema, idPublico, loginSchema, moderacionSchema, plantaSchema,
  productoSchema, puestoSchema, registroSchema, resenaSchema,
} from '@/lib/validacion';

export async function registrar(form: FormData) {
  const entrada = registroSchema.safeParse(Object.fromEntries(form));
  if (!entrada.success) redirect('/registro?estado=invalido');
  const cliente = await sessionClient();
  const { correo, password, rol } = entrada.data;
  const originHeader = (await headers()).get('origin');
  const origen = originHeader ? URL.parse(originHeader) : null;
  const emailRedirectTo = origen && (origen.protocol === 'https:' || origen.hostname === 'localhost')
    ? new URL('/auth/confirm', origen.origin).href : undefined;
  const { data, error } = await cliente.auth.signUp({ email: correo, password, options: { data: { rol }, emailRedirectTo } });
  if (error || data.user?.identities?.length === 0) redirect('/registro?estado=registro');
  if (data.session) redirect('/panel');
  redirect('/ingresar?estado=confirmacion');
}

export async function ingresar(form: FormData) {
  const entrada = loginSchema.safeParse(Object.fromEntries(form));
  if (!entrada.success) redirect('/ingresar?estado=credenciales');
  const cliente = await sessionClient();
  const { error } = await cliente.auth.signInWithPassword({ email: entrada.data.correo, password: entrada.data.password });
  if (error) redirect('/ingresar?estado=credenciales');
  redirect('/panel');
}

export async function salir() {
  const cliente = await sessionClient();
  const { error } = await cliente.auth.signOut({ scope: 'local' });
  if (error) redirect('/panel?estado=error');
  redirect('/ingresar?estado=sesion');
}

const panelHierbero = '/panel/hierbero';
const panelAdmin = '/panel/administracion';

export async function guardarPuesto(form: FormData) {
  const { cliente } = await exigirRol('hierbero');
  const entrada = puestoSchema.safeParse(Object.fromEntries(form));
  if (!entrada.success) redirect(panelHierbero + '?estado=invalido');
  const puesto = await cliente.rpc('mi_puesto_id');
  if (puesto.error) redirect(panelHierbero + '?estado=error');
  const resultado = puesto.data
    ? await cliente.from('puestos').update(entrada.data).eq('id', puesto.data).select('id').maybeSingle()
    : await cliente.from('puestos').insert(entrada.data).select('id').maybeSingle();
  redirect(panelHierbero + (resultado.error || !resultado.data ? '?estado=error' : '?estado=guardado'));
}

export async function guardarProducto(form: FormData) {
  const { cliente } = await exigirRol('hierbero');
  const entrada = productoSchema.safeParse(Object.fromEntries(form));
  if (!entrada.success) redirect(panelHierbero + '?estado=invalido');
  const puesto = await cliente.rpc('mi_puesto_id');
  if (puesto.error || !puesto.data) redirect(panelHierbero + '?estado=denegado');
  const { id, ...producto } = entrada.data;
  const respuesta = id
    ? await cliente.from('productos').update(producto).eq('id', id).eq('puesto_id', puesto.data).select('id').maybeSingle()
    : await cliente.from('productos').insert({ ...producto, puesto_id: puesto.data }).select('id').maybeSingle();
  redirect(panelHierbero + (respuesta.error || !respuesta.data ? '?estado=error' : '?estado=guardado'));
}

export async function borrarProducto(form: FormData) {
  const { cliente } = await exigirRol('hierbero');
  const id = idPublico.safeParse(form.get('id'));
  if (!id.success) redirect(panelHierbero + '?estado=invalido');
  const puesto = await cliente.rpc('mi_puesto_id');
  if (puesto.error || !puesto.data) redirect(panelHierbero + '?estado=denegado');
  const respuesta = await cliente.from('productos').delete().eq('id', id.data).eq('puesto_id', puesto.data).select('id').maybeSingle();
  redirect(panelHierbero + (respuesta.error || !respuesta.data ? '?estado=denegado' : '?estado=eliminado'));
}

export async function guardarPlanta(form: FormData) {
  const { cliente } = await exigirRol('administrador');
  const entrada = plantaSchema.safeParse(Object.fromEntries(form));
  if (!entrada.success) redirect(panelAdmin + '?estado=invalido');
  const { id, ...ficha } = entrada.data;
  const resultado = id
    ? await cliente.from('plantas').update(ficha).eq('id', id).select('id').maybeSingle()
    : await cliente.from('plantas').insert(ficha).select('id').maybeSingle();
  redirect(panelAdmin + (resultado.error || !resultado.data ? '?estado=error' : '?estado=guardado'));
}

export async function gestionarPuesto(form: FormData) {
  const { cliente } = await exigirRol('administrador');
  const inicio = gestionPuestoSchema.safeParse(Object.fromEntries(form));
  if (!inicio.success) redirect(panelAdmin + '?estado=invalido');
  const { id, verificado, suspendido } = inicio.data;
  const resultado = await cliente.rpc('gestionar_puesto', { p_id: id, p_verificado: verificado, p_suspendido: suspendido });
  redirect(panelAdmin + (resultado.error || !resultado.data ? '?estado=error' : '?estado=guardado'));
}

export async function publicarResena(form: FormData) {
  const { cliente } = await exigirRol('comprador');
  const puesto = idPublico.safeParse(form.get('puesto_id'));
  if (!puesto.success) redirect('/puestos');
  const ficha = '/puestos/' + puesto.data;
  const inicio = resenaSchema.safeParse(Object.fromEntries(form));
  if (!inicio.success) redirect(ficha + '?estado=invalido#resenas');
  const resultado = await cliente.from('resenas').insert(inicio.data);
  const estado = resultado.error?.code === '23505' ? 'duplicado' : resultado.error ? 'error' : 'guardado';
  redirect(ficha + '?estado=' + estado + '#resenas');
}

export async function moderarResena(form: FormData) {
  const { cliente } = await exigirRol('administrador');
  const inicio = moderacionSchema.safeParse(Object.fromEntries(form));
  if (!inicio.success) redirect(panelAdmin + '?estado=invalido');
  const resultado = await cliente.rpc('moderar_resena', { p_id: inicio.data.id, p_visible: inicio.data.visible });
  redirect(panelAdmin + (resultado.error || !resultado.data ? '?estado=error' : '?estado=guardado'));
}
