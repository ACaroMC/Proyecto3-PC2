import Link from 'next/link';

export default function NoEncontrado() {
  return <section className="surface stack"><h1>Página no encontrada</h1><p>El puesto, producto o ficha puede haber dejado de estar disponible.</p><Link href="/puestos">Volver al directorio</Link></section>;
}
