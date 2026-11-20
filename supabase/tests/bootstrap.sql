-- Representa la identidad PostgreSQL que Supabase asigna después de verificar el JWT.
-- Se usa solo en el PostgreSQL desechable de CI y en la prueba local aislada.
create role anon nologin;
create role authenticated nologin;
create schema auth;
grant usage on schema auth to anon, authenticated;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb,
  aud text,
  role text
);
create function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
