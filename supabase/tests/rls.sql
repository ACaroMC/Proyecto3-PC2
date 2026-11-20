begin;

-- HU-05 y HU-07, roles y protección del alta
do $$
begin
  if (select rol from public.perfiles where id = '10000000-0000-4000-8000-000000000001') <> 'hierbero' then
    raise exception 'No se aprovisionó el perfil válido';
  end if;
  begin
    insert into auth.users (raw_user_meta_data) values ('{"rol":"administrador"}');
    raise exception 'El alta aceptó un rol privilegiado';
  exception when invalid_parameter_value then null;
  end;
end;
$$;

set local role anon;
do $$
begin
  if (select count(id) from public.puestos) <> 2 then raise exception 'La consulta pública debe excluir suspendidos'; end if;
  if (select array_agg(precio) from public.buscar_ofertas('manzanilla', 'Manzanilla')) <> array[7.50, 10.00] then
    raise exception 'Las ofertas activas deben salir de menor a mayor precio';
  end if;
  if (select count(*) from public.buscar_ofertas('manzanilla''; --', null)) <> 0 then raise exception 'La búsqueda debe tratar la entrada como texto'; end if;
  if (select count(id) from public.plantas) <> 1 then raise exception 'El borrador es visible'; end if;
  begin
    insert into public.productos (puesto_id, nombre, presentacion, precio) values (gen_random_uuid(), 'Prueba', 'Prueba', 1);
    raise exception 'Anónimo pudo escribir';
  exception when insufficient_privilege then null;
  end;
  begin
    perform propietario_id from public.puestos;
    raise exception 'Se expuso el identificador de cuenta';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000001';
do $$
declare n integer;
begin
  if (select count(*) from public.productos) <> 1 then raise exception 'El hierbero debe ver solo su catálogo con sesión'; end if;
  update public.productos set precio = 8.75, disponible = false where id = '40000000-0000-4000-8000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'El hierbero no pudo actualizar su producto'; end if;
  update public.productos set planta_id = null, procedencia = 'Lima' where id = '40000000-0000-4000-8000-000000000002';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Se modificó un producto ajeno'; end if;
  delete from public.productos where id = '40000000-0000-4000-8000-000000000002';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Se eliminó un producto ajeno'; end if;
  update public.puestos set latitud = -12.1, longitud = -77.0 where id = '20000000-0000-4000-8000-000000000002';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Se editó la ubicación ajena'; end if;
  begin
    perform public.gestionar_puesto(public.mi_puesto_id(), true, false);
    raise exception 'El hierbero pudo autoverificarse';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.resenas (puesto_id, valoracion, comentario) values (public.mi_puesto_id(), 5, 'Prueba de bloqueo');
    raise exception 'El hierbero pudo reseñarse';
  exception when insufficient_privilege then null;
  end;
end;
$$;

set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000004';
do $$
begin
  if not exists (select 1 from public.buscar_ofertas('Manzanilla') where precio = 8.75 and not disponible) then
    raise exception 'El comprador no vio la actualización real de precio y stock';
  end if;
  if (select count(*) from public.perfiles) <> 1 then raise exception 'Se expusieron perfiles ajenos'; end if;
  begin
    insert into public.resenas (id, puesto_id, autor_id, valoracion, comentario)
      select gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 5, 'Inaccesible' where false;
    raise exception 'Se concedió escritura sobre el autor de la reseña';
  exception when insufficient_privilege then null;
  end;
end;
$$;
insert into public.resenas (puesto_id, valoracion, comentario) values
  ('20000000-0000-4000-8000-000000000001', 4, 'Prueba de reseña');
do $$
begin
  begin
    insert into public.puestos (nombre, distrito, mercado, direccion, horario, contacto)
      values ('Prueba', 'Lima', 'Mercado', 'Lugar ficticio', 'Todo el día', 'contacto@example.invalid');
    raise exception 'El comprador pudo crear un puesto';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.perfiles set rol = 'administrador' where id = auth.uid();
    raise exception 'El comprador pudo escalar su rol';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.moderar_resena((select id from public.resenas limit 1), false);
    raise exception 'El comprador pudo moderar';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.productos (puesto_id, nombre, presentacion, precio)
      values ('20000000-0000-4000-8000-000000000001', 'Prueba', 'Prueba', 1);
    raise exception 'El comprador pudo modificar un catálogo';
  exception when insufficient_privilege then null;
  end;
end;
$$;

set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000005';
do $$
begin
  if (select count(*) from public.plantas) <> 2 then raise exception 'El administrador no ve borradores'; end if;
  if not public.moderar_resena((select id from public.resenas limit 1), false) then raise exception 'No se moderó la reseña'; end if;
  if not public.gestionar_puesto('20000000-0000-4000-8000-000000000002', true, true) then raise exception 'No se pudo suspender/verificar'; end if;
end;
$$;

reset role;
set local role anon;
do $$
begin
  if (select count(*) from public.buscar_ofertas('manzanilla')) <> 1 then raise exception 'Una oferta suspendida quedó visible'; end if;
  if (select count(id) from public.resenas) <> 0 then raise exception 'Una reseña moderada quedó visible'; end if;
end;
$$;

rollback;
