import Link from 'next/link';
import { notFound } from 'next/navigation';
import { datos, obtenerPuesto, soles, type Producto } from '@/lib/datos';
import { publicClient } from '@/lib/supabase';
import { idPublico } from '@/lib/validacion';

export const dynamic = 'force-dynamic';

export default async function DetalleProducto({ params }: PageProps<'/productos/[id]'>) {
  const { id } = await params;
  if (!idPublico.safeParse(id).success) notFound();
  const cliente = publicClient();
  const producto: Producto | null = datos(await cliente.from('productos').select('*').eq('id', id).maybeSingle());
  if (!producto) notFound();
  const [puesto, ficha] = await Promise.all([
    obtenerPuesto(producto.puesto_id),
    producto.planta_id ? cliente.from('plantas').select('id,nombre').eq('id', producto.planta_id).eq('publicada', true).maybeSingle() : null,
  ]);
  if (!puesto) notFound();
  const planta = ficha ? datos(ficha) : null;

  return <article className="stack">
    <Link href="/productos">Volver a la comparación</Link>
    <header className="page-heading"><h1>{producto.nombre}</h1><p>{producto.presentacion}</p></header>
    <div className="surface stack">
      <p className="price">{soles.format(producto.precio)}</p>
      <span className={'tag ' + (producto.disponible ? 'verified' : 'unavailable')}>{producto.disponible ? 'Disponible' : 'Agotado'}</span>
      <Link href={'/puestos/' + puesto.id}>{puesto.nombre}</Link>
      <dl className="grid fields"><div><dt>Procedencia declarada</dt><dd>{producto.procedencia ?? 'No declarada'}</dd></div>
        <div><dt>Calidad declarada</dt><dd>{producto.calidad === 'estandar' ? 'Estándar' : producto.calidad ?? 'No declarada'}</dd></div></dl>
      {planta && <Link href={'/plantas/' + planta.id}>Ver ficha de {planta.nombre}</Link>}
    </div>
  </article>;
}
