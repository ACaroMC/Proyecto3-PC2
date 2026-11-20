import Link from 'next/link';
import { ingresar } from '@/app/actions';
import { Enviar } from '@/components/enviar';
import { Estado } from '@/components/estado';

export default async function Ingresar({ searchParams }: PageProps<'/ingresar'>) {
  const { estado } = await searchParams;
  return <section className="narrow surface auth-card">
    <h1>Inicia sesión</h1>
    <Estado estado={estado} />
    <form action={ingresar} className="stack">
      <label>Correo electrónico<input type="email" autoComplete="email" name="correo" required maxLength={254} /></label>
      <label>Contraseña<input type="password" autoComplete="current-password" name="password" required maxLength={72} /></label>
      <Enviar>Entrar a mi cuenta</Enviar>
    </form>
    <p>¿Primera vez? <Link href="/registro">Crea una cuenta</Link>.</p>
  </section>;
}
