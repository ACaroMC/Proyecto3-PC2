import Link from 'next/link';
import { redirect } from 'next/navigation';
import { salir } from '@/app/actions';
import { Estado } from '@/components/estado';
import { Enviar } from '@/components/enviar';
import { exigirRol } from '@/lib/sesion';

export default async function Panel({ searchParams }: PageProps<'/panel'>) {
  const [{ rol }, { estado }] = await Promise.all([exigirRol(), searchParams]);
  if (!estado && rol === 'hierbero') redirect('/panel/hierbero');
  if (!estado && rol === 'administrador') redirect('/panel/administracion');
  return <section className="stack">
    <h1>{rol === 'comprador' ? 'Panel de comprador' : 'Mi cuenta'}</h1>
    <Estado estado={estado} />
    <div className="surface stack">
      <p>Encuentra comercios, compara precios y comparte tu experiencia en el directorio.</p>
      <div className="actions">
        <Link className="button primary" href="/puestos">Ver puestos</Link>
        <Link className="button secondary" href="/productos">Comparar precios</Link>
        {rol === 'hierbero' && <Link className="button secondary" href="/panel/hierbero">Gestionar mi puesto</Link>}
        {rol === 'administrador' && <Link className="button secondary" href="/panel/administracion">Administración</Link>}
      </div>
      <form action={salir}><Enviar variant="secondary">Cerrar sesión</Enviar></form>
    </div>
  </section>;
}
