import Link from 'next/link';
import { notFound } from 'next/navigation';
import { publicarResena } from '@/app/actions';
import { Enviar } from '@/components/enviar';
import { Estado } from '@/components/estado';
import { Foto, fotoProducto, fotoPuesto } from '@/components/foto';
import { MapaPuestos } from '@/components/mapa';
import { obtenerPuesto, datos, camposResena, soles, fecha, type Producto, type Resena } from '@/lib/datos';
import { sesion } from '@/lib/sesion';
import { publicClient } from '@/lib/supabase';
import { idPublico } from '@/lib/validacion';

export default async function FichaPuesto({ params, searchParams }: PageProps<'/puestos/[id]'>) {
  const { id } = await params;
  if (!idPublico.safeParse(id).success) notFound();
  const puesto = await obtenerPuesto(id);
  if (!puesto) notFound();
  const cliente = publicClient();
  const [ofertas, comentarios, cuenta, query] = await Promise.all([
    cliente.from('productos').select('*').eq('puesto_id', id).order('nombre'),
    cliente.from('resenas').select(camposResena).eq('puesto_id', id).order('creada_en', { ascending: false }),
    sesion(), searchParams,
  ]);
  const productos: Producto[] = datos(ofertas) ?? [];
  const resenas: Resena[] = datos(comentarios) ?? [];
  const promedio = resenas.reduce((total, item) => total + item.valoracion, 0) / resenas.length;
  const puntos = puesto.latitud === null || puesto.longitud === null ? [] : [{ id, nombre: puesto.nombre, latitud: puesto.latitud, longitud: puesto.longitud }];

  return <article className="stack">
    <Link href="/puestos">Volver al directorio</Link>
    <header className="page-heading"><h1>{puesto.nombre}</h1><p>{puesto.mercado} · {puesto.distrito}</p>{puesto.verificado && <span className="tag verified">Verificado</span>}</header>
    <Foto imagen={fotoPuesto} formato="detalle" />
    <div className="surface stack">
      <h2>Visita el puesto</h2>
      <dl className="grid fields">
        <div><dt>Dirección</dt><dd>{puesto.direccion}</dd></div>
        <div><dt>Horario</dt><dd>{puesto.horario}</dd></div>
        <div><dt>Contacto comercial</dt><dd>{puesto.contacto}</dd></div>
      </dl>
      {puntos.length > 0 && <MapaPuestos puntos={puntos} />}
    </div>
    <section className="stack"><h2>Catálogo</h2>
      {productos.length ? <div className="grid cards">{productos.map((producto) => <article className="surface stack" key={producto.id}>
        <Foto imagen={fotoProducto(producto.nombre, producto.presentacion)} />
        <h3><Link href={'/productos/' + producto.id}>{producto.nombre}</Link></h3><p className="muted">{producto.presentacion}</p>
        <p className="price">{soles.format(producto.precio)}</p>
        <span className={'tag ' + (producto.disponible ? 'verified' : 'unavailable')}>{producto.disponible ? 'Disponible' : 'Agotado'}</span>
      </article>)}</div> : <p>No hay productos publicados en este puesto.</p>}
    </section>
    <section className="surface stack" id="resenas">
      <h2>Reseñas</h2><Estado estado={query.estado} />
      {resenas.length ? <>
        <p><strong>{promedio.toLocaleString('es-PE', { maximumFractionDigits: 1 })} de 5</strong> · {resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'}</p>
        <ul className="review-list">{resenas.map((resena) => <li key={resena.id}><strong>{resena.valoracion} de 5</strong> <time dateTime={resena.creada_en}>{fecha.format(new Date(resena.creada_en))}</time><p>{resena.comentario}</p></li>)}</ul>
      </> : <p>Todavía no hay reseñas publicadas.</p>}
      {cuenta?.rol === 'comprador' && <form action={publicarResena} className="stack">
        <input type="hidden" name="puesto_id" value={id} />
        <label>Valoración<select name="valoracion" required defaultValue=""><option value="" disabled>Elige una valoración</option>{[1, 2, 3, 4, 5].map((valor) => <option key={valor}>{valor}</option>)}</select></label>
        <label>Comentario<textarea name="comentario" required minLength={3} maxLength={500} /></label>
        <div><Enviar>Publicar reseña</Enviar></div>
      </form>}
      {!cuenta && <p><Link href="/ingresar">Inicia sesión</Link> con tu cuenta de comprador para publicar una reseña.</p>}
    </section>
  </article>;
}
