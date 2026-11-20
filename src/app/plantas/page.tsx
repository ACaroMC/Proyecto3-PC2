import Link from 'next/link';
import { Foto, fotoPlanta } from '@/components/foto';
import { datos, type Planta } from '@/lib/datos';
import { publicClient } from '@/lib/supabase';
import { busqueda } from '@/lib/validacion';

export const dynamic = 'force-dynamic';

export default async function Plantas({ searchParams }: PageProps<'/plantas'>) {
  const params = await searchParams;
  const q = busqueda(params.q);
  const plantas: Pick<Planta, 'id' | 'nombre' | 'cientifico' | 'usos'>[] = datos(await publicClient().rpc('buscar_plantas', { p_texto: q })) ?? [];
  return <div className="stack">
    <header className="page-heading"><h1>Fichas de plantas</h1><p>Consulta usos tradicionales, precauciones y fuentes.</p></header>
    <form action="/plantas" className="surface filter-bar">
      <label>Nombre o uso tradicional<input type="search" name="q" defaultValue={q} placeholder="Manzanilla" maxLength={100} /></label>
      <button className="button primary">Buscar</button>{q && <Link href="/plantas">Limpiar búsqueda</Link>}
    </form>
    {plantas.length ? <div className="grid cards">{plantas.map((planta) => <article key={planta.id} className="surface stack">
      <Foto imagen={fotoPlanta(planta.cientifico)} />
      <h2><Link href={'/plantas/' + planta.id}>{planta.nombre}</Link></h2><p><i>{planta.cientifico}</i></p><p className="muted">{planta.usos}</p>
    </article>)}</div> : <p className="surface" role="status">Sin resultados. Prueba con otro nombre o uso.</p>}
  </div>;
}
