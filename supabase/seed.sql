-- Datos de demostración para supabase start o supabase db reset en local.
-- Las cuentas de ejemplo no tienen contraseña y usan correos no entregables.
insert into auth.users (id, email, raw_user_meta_data, aud, role)
values
  ('10000000-0000-4000-8000-000000000001', 'puesto.a@example.invalid', '{"rol":"hierbero"}', 'authenticated', 'authenticated'),
  ('10000000-0000-4000-8000-000000000002', 'puesto.b@example.invalid', '{"rol":"hierbero"}', 'authenticated', 'authenticated'),
  ('10000000-0000-4000-8000-000000000003', 'puesto.c@example.invalid', '{"rol":"hierbero"}', 'authenticated', 'authenticated'),
  ('10000000-0000-4000-8000-000000000004', 'comprador@example.invalid', '{"rol":"comprador"}', 'authenticated', 'authenticated'),
  ('10000000-0000-4000-8000-000000000005', 'moderacion@example.invalid', '{"rol":"comprador"}', 'authenticated', 'authenticated')
on conflict (id) do nothing;

update public.perfiles set rol = 'administrador' where id = '10000000-0000-4000-8000-000000000005';

insert into public.puestos
  (id, propietario_id, nombre, distrito, mercado, direccion, horario, contacto, latitud, longitud, verificado, suspendido)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Herbolario Valle Verde (demo)', 'Surquillo',
   'Mercado de demostración Surquillo', 'Puesto ficticio A, Surquillo', 'Lun–Sáb, 08:00–16:00', 'valleverde@example.invalid', -12.1141, -77.0272, true, false),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Tiendita La Semilla (demo)', 'Barranco',
   'Feria de demostración Barranco', 'Puesto ficticio B, Barranco', 'Mar–Dom, 09:00–17:00', 'lasemilla@example.invalid', null, null, false, false),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'Puesto oculto (demo)', 'Lima',
   'Mercado de demostración Lima', 'Puesto ficticio C, Cercado', 'Lun–Vie, 09:00–15:00', 'oculto@example.invalid', -12.047, -77.031, false, true)
on conflict (id) do nothing;

insert into public.plantas (id, nombre, cientifico, usos, preparacion, precauciones, fuente_nombre, fuente_url, publicada)
values
  ('30000000-0000-4000-8000-000000000001', 'Manzanilla', 'Matricaria recutita', 'Se ha usado tradicionalmente en infusiones y para molestias como el dolor de estómago. La evidencia clínica sobre su eficacia es limitada.',
   'La infusión es una forma tradicional de consumir las flores.', 'Puede causar alergias e interactuar con algunos medicamentos. Consulta a un profesional si tomas medicación.',
   'NCCIH · Chamomile: Usefulness and Safety', 'https://www.nccih.nih.gov/health/chamomile', true),
  ('30000000-0000-4000-8000-000000000002', 'Ficha de demostración en borrador', 'Matricaria recutita', 'Pendiente de revisión.',
   'Pendiente de revisión.', 'Pendiente de revisión.', 'NCCIH', 'https://www.nccih.nih.gov/health/chamomile', false)
on conflict (id) do nothing;

insert into public.productos (id, puesto_id, planta_id, nombre, presentacion, precio, disponible, procedencia, calidad)
values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'Manzanilla', 'Flores secas, 50 g', 7.50, true, 'Cusco (declaración ficticia)', 'seleccionada'),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'Manzanilla', 'Flores secas, 50 g', 10.00, true, null, null),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003', null, 'Manzanilla', 'Flores secas, 50 g', 1.00, true, null, null)
on conflict (id) do nothing;
