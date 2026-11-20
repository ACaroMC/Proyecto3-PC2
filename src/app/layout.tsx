import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Raíz Perú · Directorio naturista',
  description: 'Encuentra hierberos y tiendas naturistas del Perú y compara el precio de sus productos.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a className="skip" href="#contenido">Ir al contenido</a>
        <header className="site-header">
          <div className="container topbar">
            <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">R</span>Raíz Perú</Link>
            <nav aria-label="Navegación principal">
              <Link href="/puestos">Directorio</Link><Link href="/productos">Comparar</Link>
              <Link href="/plantas">Plantas</Link><Link href="/panel">Mi cuenta</Link>
            </nav>
          </div>
        </header>
        <main className="container site-main" id="contenido">{children}</main>
        <footer className="site-footer"><div className="container">Raíz Perú · Directorio de hierberos y tiendas naturistas</div></footer>
      </body>
    </html>
  );
}
