create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;
grant usage on schema privado to authenticated;

create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  rol text not null check (rol in ('comprador', 'hierbero', 'administrador'))
);

create table public.puestos (
  id uuid primary key default gen_random_uuid(),
  propietario_id uuid not null unique default auth.uid() references public.perfiles(id) on delete cascade,
  nombre text not null check (length(btrim(nombre)) between 2 and 100),
  distrito text not null check (length(btrim(distrito)) between 2 and 80),
  mercado text not null check (length(btrim(mercado)) between 2 and 100),
  direccion text not null check (length(btrim(direccion)) between 4 and 200),
  horario text not null check (length(btrim(horario)) between 3 and 120),
  contacto text not null check (length(btrim(contacto)) between 3 and 120),
  latitud double precision check (latitud between -90 and 90),
  longitud double precision check (longitud between -180 and 180),
  verificado boolean not null default false,
  suspendido boolean not null default false,
  check ((latitud is null) = (longitud is null))
);

create table public.plantas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(btrim(nombre)) between 2 and 100),
  cientifico text not null check (length(btrim(cientifico)) between 3 and 140),
  usos text not null check (length(btrim(usos)) between 3 and 1600),
  preparacion text not null check (length(btrim(preparacion)) between 3 and 1600),
  precauciones text not null check (length(btrim(precauciones)) between 3 and 1600),
  fuente_nombre text not null check (length(btrim(fuente_nombre)) between 2 and 120),
  fuente_url text not null check (length(fuente_url) <= 500 and fuente_url ~ '^https://[^[:space:]]+$'),
  publicada boolean not null default false
);

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  puesto_id uuid not null references public.puestos(id) on delete cascade,
  planta_id uuid references public.plantas(id) on delete set null,
  nombre text not null check (length(btrim(nombre)) between 2 and 120),
  presentacion text not null check (length(btrim(presentacion)) between 2 and 120),
  precio numeric(9,2) not null check (precio > 0 and precio <= 9999999.99),
  disponible boolean not null default true,
  procedencia text check (length(btrim(procedencia)) between 2 and 160),
  calidad text check (calidad in ('seleccionada', 'estandar', 'artesanal'))
);

create table public.resenas (
  id uuid primary key default gen_random_uuid(),
  puesto_id uuid not null references public.puestos(id) on delete cascade,
  autor_id uuid not null default auth.uid() references public.perfiles(id) on delete cascade,
  valoracion smallint not null check (valoracion between 1 and 5),
  comentario text not null check (length(btrim(comentario)) between 3 and 500),
  visible boolean not null default true,
  creada_en timestamptz not null default now(),
  unique (puesto_id, autor_id)
);

create index productos_puesto on public.productos (puesto_id);
create index productos_planta on public.productos (planta_id);
create index resenas_autor on public.resenas (autor_id);

alter table public.perfiles enable row level security;
alter table public.puestos enable row level security;
alter table public.productos enable row level security;
alter table public.plantas enable row level security;
alter table public.resenas enable row level security;

revoke all on public.perfiles, public.puestos, public.productos, public.plantas, public.resenas from public, anon, authenticated;
grant select on public.perfiles to authenticated;
grant select (id, nombre, distrito, mercado, direccion, horario, contacto, latitud, longitud, verificado, suspendido)
  on public.puestos to anon, authenticated;
grant insert (nombre, distrito, mercado, direccion, horario, contacto, latitud, longitud),
      update (nombre, distrito, mercado, direccion, horario, contacto, latitud, longitud)
  on public.puestos to authenticated;
grant select on public.productos, public.plantas to anon, authenticated;
grant insert (puesto_id, planta_id, nombre, presentacion, precio, disponible, procedencia, calidad),
      update (planta_id, nombre, presentacion, precio, disponible, procedencia, calidad),
      delete on public.productos to authenticated;
grant insert (nombre, cientifico, usos, preparacion, precauciones, fuente_nombre, fuente_url, publicada),
      update (nombre, cientifico, usos, preparacion, precauciones, fuente_nombre, fuente_url, publicada)
  on public.plantas to authenticated;
grant select (id, puesto_id, valoracion, comentario, visible, creada_en) on public.resenas to anon, authenticated;
grant insert (puesto_id, valoracion, comentario) on public.resenas to authenticated;

create function privado.crear_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
declare elegido text := new.raw_user_meta_data ->> 'rol';
begin
  if elegido is not null and elegido not in ('comprador', 'hierbero') then
    raise exception 'Rol de registro inválido' using errcode = '22023';
  end if;
  insert into public.perfiles (id, rol) values (new.id, coalesce(elegido, 'comprador'));
  return new;
end;
$$;
revoke all on function privado.crear_perfil() from public, anon, authenticated;
create trigger alta_perfil after insert on auth.users
for each row execute function privado.crear_perfil();

insert into public.perfiles (id, rol)
select id, case when raw_user_meta_data ->> 'rol' = 'hierbero' then 'hierbero' else 'comprador' end
from auth.users on conflict (id) do nothing;

create function privado.rol_actual() returns text
language sql stable security definer set search_path = '' as $$
  select rol from public.perfiles where id = (select auth.uid());
$$;
revoke all on function privado.rol_actual() from public, anon, authenticated;
grant execute on function privado.rol_actual() to authenticated;

create function public.mi_puesto_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.puestos
  where propietario_id = (select auth.uid()) and privado.rol_actual() = 'hierbero';
$$;
revoke all on function public.mi_puesto_id() from public, anon, authenticated;
grant execute on function public.mi_puesto_id() to authenticated;

create policy perfiles_propios on public.perfiles for select to authenticated
using (id = (select auth.uid()) or (select privado.rol_actual()) = 'administrador');

create policy puestos_publicos on public.puestos for select to anon using (not suspendido);
create policy puestos_sesion on public.puestos for select to authenticated
using (not suspendido or propietario_id = (select auth.uid()) or (select privado.rol_actual()) = 'administrador');
create policy puestos_crear on public.puestos for insert to authenticated
with check (propietario_id = (select auth.uid()) and (select privado.rol_actual()) = 'hierbero');
create policy puestos_editar on public.puestos for update to authenticated
using (propietario_id = (select auth.uid()) and (select privado.rol_actual()) = 'hierbero')
with check (propietario_id = (select auth.uid()) and (select privado.rol_actual()) = 'hierbero');

create policy productos_publicos on public.productos for select to anon
using (exists (select 1 from public.puestos where id = puesto_id and not suspendido));
create policy productos_sesion on public.productos for select to authenticated
using (
  puesto_id = (select public.mi_puesto_id())
  or (select privado.rol_actual()) = 'administrador'
  or (
    (select privado.rol_actual()) = 'comprador'
    and exists (select 1 from public.puestos where id = puesto_id and not suspendido)
  )
);
create policy productos_crear on public.productos for insert to authenticated
with check (
  puesto_id = (select public.mi_puesto_id())
  and (planta_id is null or exists (select 1 from public.plantas where id = planta_id and publicada))
);
create policy productos_editar on public.productos for update to authenticated
using (puesto_id = (select public.mi_puesto_id()))
with check (
  puesto_id = (select public.mi_puesto_id())
  and (planta_id is null or exists (select 1 from public.plantas where id = planta_id and publicada))
);
create policy productos_borrar on public.productos for delete to authenticated
using (puesto_id = (select public.mi_puesto_id()));

create policy plantas_publicas on public.plantas for select to anon using (publicada);
create policy plantas_sesion on public.plantas for select to authenticated
using (publicada or (select privado.rol_actual()) = 'administrador');
create policy plantas_crear on public.plantas for insert to authenticated
with check ((select privado.rol_actual()) = 'administrador');
create policy plantas_editar on public.plantas for update to authenticated
using ((select privado.rol_actual()) = 'administrador')
with check ((select privado.rol_actual()) = 'administrador');

create policy resenas_publicas on public.resenas for select to anon
using (visible and exists (select 1 from public.puestos where id = puesto_id and not suspendido));
create policy resenas_sesion on public.resenas for select to authenticated
using (
  (select privado.rol_actual()) = 'administrador'
  or (visible and exists (select 1 from public.puestos where id = puesto_id and not suspendido))
);
create policy resenas_crear on public.resenas for insert to authenticated
with check (
  (select privado.rol_actual()) = 'comprador' and autor_id = (select auth.uid())
  and exists (select 1 from public.puestos where id = puesto_id and not suspendido)
);

create function public.gestionar_puesto(p_id uuid, p_verificado boolean, p_suspendido boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if privado.rol_actual() is distinct from 'administrador' then
    raise exception 'Acceso denegado' using errcode = '42501';
  end if;
  update public.puestos set verificado = p_verificado, suspendido = p_suspendido where id = p_id;
  return found;
end;
$$;

create function public.moderar_resena(p_id uuid, p_visible boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if privado.rol_actual() is distinct from 'administrador' then
    raise exception 'Acceso denegado' using errcode = '42501';
  end if;
  update public.resenas set visible = p_visible where id = p_id;
  return found;
end;
$$;

revoke all on function public.gestionar_puesto(uuid, boolean, boolean), public.moderar_resena(uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.gestionar_puesto(uuid, boolean, boolean), public.moderar_resena(uuid, boolean)
  to authenticated;

create function public.buscar_ofertas(p_texto text default '', p_nombre text default null)
returns table (
  id uuid, puesto_id uuid, puesto text, distrito text, nombre text,
  presentacion text, precio numeric, disponible boolean
) language sql stable security invoker set search_path = '' as $$
  select p.id, p.puesto_id, s.nombre, s.distrito, p.nombre, p.presentacion, p.precio, p.disponible
  from public.productos p
  join public.puestos s on s.id = p.puesto_id and not s.suspendido
  left join public.plantas f on f.id = p.planta_id and f.publicada
  where (p_nombre is null or lower(btrim(p.nombre)) = lower(btrim(p_nombre)))
    and strpos(lower(concat_ws(' ', p.nombre, f.nombre, f.cientifico)), lower(left(coalesce(p_texto, ''), 100))) > 0
  order by p.precio, s.nombre, p.id
  limit 100;
$$;

create function public.buscar_plantas(p_texto text default '')
returns table (id uuid, nombre text, cientifico text, usos text)
language sql stable security invoker set search_path = '' as $$
  select f.id, f.nombre, f.cientifico, f.usos from public.plantas f
  where f.publicada and strpos(lower(concat_ws(' ', f.nombre, f.cientifico, f.usos)), lower(left(coalesce(p_texto, ''), 100))) > 0
  order by f.nombre, f.id limit 100;
$$;

revoke all on function public.buscar_ofertas(text, text), public.buscar_plantas(text) from public, anon, authenticated;
grant execute on function public.buscar_ofertas(text, text), public.buscar_plantas(text) to anon, authenticated;
