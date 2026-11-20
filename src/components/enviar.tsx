'use client';

import { useFormStatus } from 'react-dom';

export function Enviar({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger' }) {
  const { pending } = useFormStatus();
  return <button className={'button ' + variant} type="submit" disabled={pending}>{pending ? 'Enviando…' : children}</button>;
}
