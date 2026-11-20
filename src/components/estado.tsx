const mensajes = {
  invalido: 'Revisa los campos del formulario y vuelve a enviarlo.',
  error: 'No se pudo guardar el cambio. Inténtalo de nuevo.',
  denegado: 'Tu cuenta no tiene permiso para esta operación.',
  guardado: 'Los cambios se guardaron.',
  eliminado: 'El producto se eliminó del catálogo.',
  credenciales: 'No pudimos iniciar sesión con esas credenciales.',
  registro: 'No se pudo crear la cuenta. Si ya estás registrado, inicia sesión.',
  confirmacion: 'Revisa tu correo para confirmar la cuenta antes de iniciar sesión.',
  enlace: 'El enlace de confirmación dejó de ser válido. Intenta iniciar sesión.',
  sesion: 'Cerraste tu sesión.',
  duplicado: 'Ya publicaste una reseña para este puesto.',
};

export function Estado({ estado }: { estado?: string | string[] }) {
  if (typeof estado !== 'string' || !Object.hasOwn(mensajes, estado)) return null;
  const correcto = ['guardado', 'eliminado', 'confirmacion', 'sesion'].includes(estado);
  return <p role={correcto ? 'status' : 'alert'} className={correcto ? 'notice' : 'notice notice-error'}>{mensajes[estado as keyof typeof mensajes]}</p>;
}
