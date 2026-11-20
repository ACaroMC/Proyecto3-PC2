import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { sessionClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const token = z.string().min(16).max(500).safeParse(request.nextUrl.searchParams.get('token_hash'));
  const code = z.uuid().safeParse(request.nextUrl.searchParams.get('code'));
  if (token.success) {
    const supabase = await sessionClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: token.data, type: 'email' });
    if (!error) return NextResponse.redirect(new URL('/panel', request.url));
  }
  if (code.success) {
    const supabase = await sessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code.data);
    if (!error) return NextResponse.redirect(new URL('/panel', request.url));
  }
  return NextResponse.redirect(new URL('/ingresar?estado=enlace', request.url));
}
