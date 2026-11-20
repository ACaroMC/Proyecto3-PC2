'use client';

import Link from 'next/link';

export default function ErrorPagina({ reset }: { reset: () => void }) {
  return <section className="surface stack">
    <h1>No pudimos cargar esta página</h1>
    <p role="alert">Intenta nuevamente en unos segundos.</p>
    <div className="actions"><button type="button" className="button primary" onClick={reset}>Reintentar</button>
      <Link href="/">Volver al inicio</Link></div>
  </section>;
}
