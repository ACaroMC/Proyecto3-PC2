import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function supabaseSettings() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Falta la configuración pública de Supabase.');
  return { url, key };
}

export function publicClient() {
  const { url, key } = supabaseSettings();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}

export async function sessionClient() {
  const { url, key } = supabaseSettings();
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        try {
          for (const { name, value, options } of values) jar.set(name, value, options);
        } catch {
          // Los Server Components reciben las cookies renovadas a través de Proxy.
        }
      },
    },
  });
}
