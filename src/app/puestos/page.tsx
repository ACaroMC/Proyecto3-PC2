import Link from 'next/link';
import { Foto, fotoPuesto } from '@/components/foto';
import { MapaPuestos } from '@/components/mapa';
import { obtenerPuestos } from '@/lib/datos';
import { busqueda } from '@/lib/validacion';

export const dynamic = 'force-dynamic';

export default async function Directorio({ searchParams }: PageProps<'/puestos'>) {
  const params = await searchParams;
  const distrito = busqueda(params.distrito);
  const mercado = busqueda(params.mercado);
  const puestos = await obtenerPuestos();
  const distritos = [...new Set(puestos.map((puesto) => puesto.distrito))].sort((a, b) => a.localeCompare(b, 'es'));
  const mercados = [...new Set(puestos.map((puesto) => puesto.mercado))].sort((a, b) => a.localeCompare(b, 'es'));
  const resultados = puestos.filter((puesto) => (!distrito || puesto.distrito === distrito) && (!mercado || puesto.mercado === mercado));
  const puntos = resultados.flatMap(({ id, nombre, latitud, longitud }) => latitud === null || longitud === null ? [] : [{ id, nombre, latitud, longitud }]);

  return <div className="stack">
    <header className="page-heading"><h1>Directorio de puestos</h1><p>Encuentra hierberos y tiendas naturistas por distrito o mercado.</p></header>
    <form action="/puestos" className="surface filter-bar">
      <label>Distrito<select name="distrito" defaultValue={distrito}><option value="">Todos los distritos</option>{distritos.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Mercado o feria<select name="mercado" defaultValue={mercado}><option value="">Todos los mercados</option>{mercados.map((item) => <option key={item}>{item}</option>)}</select></label>
      <button className="button primary">Filtrar</button>
      {(distrito || mercado) && <Link href="/puestos">Limpiar filtros</Link>}
    </form>
    {resultados.length ? <>
      <p className="muted" role="status">{resultados.length} {resultados.length === 1 ? 'puesto' : 'puestos'}</p>
      <div className="grid cards">{resultados.map((puesto) => <article className="surface stack" key={puesto.id}>
        <Foto imagen={fotoPuesto} />
        <span className="tag">{puesto.distrito}</span>
        <h2><Link href={'/puestos/' + puesto.id}>{puesto.nombre}</Link></h2>
        {puesto.verificado && <span className="tag verified">Verificado</span>}
        <p>{puesto.mercado}</p><p className="muted">{puesto.direccion}</p>
        <Link className="button secondary" href={'/puestos/' + puesto.id}>Ver puesto</Link>
      </article>)}</div>
      <section className="surface stack"><h2>Ubicaciones</h2><MapaPuestos puntos={puntos} /></section>
    </> : <p className="surface" role="status">Sin resultados. Prueba con otros filtros.</p>}
  </div>;
}
