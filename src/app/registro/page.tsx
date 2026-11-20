import Link from 'next/link';
import { registrar } from '@/app/actions';
import { Enviar } from '@/components/enviar';
import { Estado } from '@/components/estado';

export default async function Registro({ searchParams }: PageProps<'/registro'>) {
  const { estado } = await searchParams;
  return <section className="narrow surface auth-card">
    <h1>Crea tu cuenta</h1>
    <Estado estado={estado} />
    <form action={registrar} className="stack">
      <label>Correo electrónico<input type="email" autoComplete="email" name="correo" required maxLength={254} /></label>
      <label>Contraseña <small>Al menos 8 caracteres</small><input type="password" autoComplete="new-password" name="password" required minLength={8} maxLength={72} /></label>
      <label>Quiero registrarme como<select name="rol" required>
        <option value="comprador">Comprador</option>
        <option value="hierbero">Hierbero o tienda naturista</option>
      </select></label>
      <Enviar>Crear cuenta</Enviar>
    </form>
    <p>¿Ya tienes cuenta? <Link href="/ingresar">Inicia sesión</Link>.</p>
  </section>;
}
