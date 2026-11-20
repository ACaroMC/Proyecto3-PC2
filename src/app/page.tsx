import Link from 'next/link';

export default function Home() {
  return (
    <div className="stack home">
      <section className="hero">
        <div>
          <h1>Encuentra hierberos y tiendas naturistas del Perú</h1>
          <p>Busca un producto, compara precios y encuentra un puesto cerca de ti.</p>
          <div className="actions">
            <Link className="button primary" href="/puestos">Explorar directorio</Link>
            <Link className="button secondary" href="/productos">Comparar precios</Link>
          </div>
        </div>
        <form className="surface stack hero-search" action="/productos">
          <label>¿Qué producto buscas?<input type="search" name="q" maxLength={100} placeholder="Manzanilla" /></label>
          <button className="button primary">Buscar ofertas</button>
        </form>
      </section>
      <div className="grid cards home-cards">
        <section className="surface stack"><h2>Directorio</h2><p>Consulta dirección, horario y contacto de cada puesto.</p><Link href="/puestos">Buscar por distrito o mercado</Link></section>
        <section className="surface stack"><h2>Guía de plantas</h2><p>Lee los usos tradicionales, las precauciones y las fuentes.</p><Link href="/plantas">Consultar las fichas</Link></section>
        <section className="surface stack"><h2>Para hierberos</h2><p>Publica tu puesto y mantén actualizado el precio y la disponibilidad de tus productos.</p><Link href="/registro">Registrar mi cuenta</Link></section>
      </div>
    </div>
  );
}
