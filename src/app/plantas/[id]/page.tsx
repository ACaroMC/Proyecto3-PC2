import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Foto, fotoPlanta } from '@/components/foto';
import { datos, type Planta } from '@/lib/datos';
import { publicClient } from '@/lib/supabase';
import { idPublico } from '@/lib/validacion';

export const dynamic = 'force-dynamic';

export default async function FichaPlanta({ params }: PageProps<'/plantas/[id]'>) {
  const { id } = await params;
  if (!idPublico.safeParse(id).success) notFound();
  const planta: Planta | null = datos(await publicClient().from('plantas').select('*').eq('id', id).eq('publicada', true).maybeSingle());
  if (!planta) notFound();
  return <article className="stack reading">
    <Link href="/plantas">Volver a las fichas</Link>
    <header className="page-heading"><h1>{planta.nombre}</h1><p><i>{planta.cientifico}</i></p></header>
    <p className="notice">Esta información es referencial y no reemplaza una consulta médica.</p>
    <Foto imagen={fotoPlanta(planta.cientifico)} formato="detalle" />
    <div className="surface stack">
      <section><h2>Usos tradicionales</h2><p>{planta.usos}</p></section>
      <section><h2>Preparación tradicional</h2><p>{planta.preparacion}</p></section>
      <section><h2>Precauciones</h2><p>{planta.precauciones}</p></section>
      <section><h2>Fuente</h2><a href={planta.fuente_url} rel="noreferrer">{planta.fuente_nombre}</a></section>
    </div>
  </article>;
}
