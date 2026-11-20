import Link from 'next/link';
import { obtenerOfertas, soles } from '@/lib/datos';
import { busqueda } from '@/lib/validacion';

export const dynamic = 'force-dynamic';

export default async function Comparar({ searchParams }: PageProps<'/productos'>) {
  const params = await searchParams;
  const q = busqueda(params.q);
  const producto = busqueda(params.producto);
  const resultados = await obtenerOfertas(q, producto || null);

  return <div className="stack">
    <header className="page-heading"><h1>Compara precios</h1><p>Busca una planta o preparado y revisa cuánto cuesta en cada puesto.</p></header>
    <form action="/productos" className="surface filter-bar">
      <label>Producto o planta<input type="search" name="q" maxLength={100} defaultValue={q} placeholder="Manzanilla" /></label>
      <button className="button primary">Buscar</button>
      {(q || producto) && <Link href="/productos">Ver todas las ofertas</Link>}
    </form>
    <h2>{producto ? 'Ofertas de ' + producto : q ? 'Resultados para «' + q + '»' : 'Ofertas del directorio'}</h2>
    {resultados.length ? <>
      <p role="status" className="muted">{resultados.length} {resultados.length === 1 ? 'oferta' : 'ofertas'} · de menor a mayor precio</p>
      <ul className="list offers">{resultados.map((oferta) => <li key={oferta.id} className="surface offer">
        <div className="stack">
          <h3><Link href={'/productos/' + oferta.id}>{oferta.nombre}</Link></h3>
          <p className="muted">{oferta.presentacion}</p>
          <p><Link href={'/puestos/' + oferta.puesto_id}>{oferta.puesto}</Link> · {oferta.distrito}</p>
          {!producto && <Link href={{ pathname: '/productos', query: { producto: oferta.nombre } }}>Comparar este producto</Link>}
        </div>
        <div className="offer-price"><strong className="price">{soles.format(oferta.precio)}</strong><span className={'tag ' + (oferta.disponible ? 'verified' : 'unavailable')}>{oferta.disponible ? 'Disponible' : 'Agotado'}</span></div>
      </li>)}</ul>
    </> : <p className="surface" role="status">Sin resultados. Prueba con otro nombre de producto o planta.</p>}
  </div>;
}
