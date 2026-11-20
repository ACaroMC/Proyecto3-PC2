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

update public.perfiles perfil
set rol = 'administrador'
from auth.users cuenta
where perfil.id = cuenta.id
  and cuenta.id = '10000000-0000-4000-8000-000000000005'
  and cuenta.email = 'moderacion@example.invalid'
  and perfil.rol = 'comprador';

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

-- Identificadores fijos para volver a cargar el catálogo sin modificar ofertas existentes.
-- Vincula las ofertas solo con los puestos de las cuentas ficticias.
with puestos_demo (clave, id, propietario_id, email) as (
  values
    ('valle_verde', '20000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'puesto.a@example.invalid'),
    ('la_semilla', '20000000-0000-4000-8000-000000000002'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'puesto.b@example.invalid'),
    ('oculto', '20000000-0000-4000-8000-000000000003'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 'puesto.c@example.invalid')
), ofertas (id, puesto, planta_id, nombre, presentacion, precio, disponible, procedencia, calidad) as (
  values
    ('40000000-0000-4000-8000-000000000001'::uuid, 'valle_verde', '30000000-0000-4000-8000-000000000001'::uuid, 'Manzanilla', 'Flores secas, 50 g', 7.50, true, 'Cusco (declaración ficticia)', 'seleccionada'),
    ('40000000-0000-4000-8000-000000000002', 'la_semilla', '30000000-0000-4000-8000-000000000001', 'Manzanilla', 'Flores secas, 50 g', 10.00, true, null, null),
    ('40000000-0000-4000-8000-000000000003', 'oculto', null, 'Manzanilla', 'Flores secas, 50 g', 1.00, true, null, null),

    ('40000000-0000-4000-8000-000000000004', 'valle_verde', '30000000-0000-4000-8000-000000000001', 'Manzanilla', 'Planta viva en maceta de 10 cm', 12.00, true, null, null),
    ('40000000-0000-4000-8000-000000000005', 'valle_verde', null, 'Hierbaluisa', 'Hojas secas, 50 g', 6.50, true, null, null),
    ('40000000-0000-4000-8000-000000000006', 'valle_verde', null, 'Menta', 'Hojas secas, 30 g', 5.00, true, null, null),
    ('40000000-0000-4000-8000-000000000007', 'valle_verde', null, 'Toronjil', 'Hojas secas, 40 g', 8.00, true, null, null),
    ('40000000-0000-4000-8000-000000000008', 'valle_verde', null, 'Flor de Jamaica', 'Cálices secos, 100 g', 13.50, true, null, null),
    ('40000000-0000-4000-8000-000000000009', 'valle_verde', null, 'Muña', 'Hojas secas, 40 g', 9.00, false, null, null),
    ('40000000-0000-4000-8000-000000000010', 'valle_verde', null, 'Cedrón', 'Hojas secas, 30 g', 7.00, true, null, null),
    ('40000000-0000-4000-8000-000000000011', 'valle_verde', null, 'Romero', 'Ramas frescas, atado de 50 g', 4.50, true, null, null),
    ('40000000-0000-4000-8000-000000000012', 'valle_verde', null, 'Caléndula', 'Flores secas, 25 g', 8.50, false, null, null),
    ('40000000-0000-4000-8000-000000000013', 'valle_verde', null, 'Anís verde', 'Semillas enteras, 60 g', 7.20, true, null, null),

    ('40000000-0000-4000-8000-000000000014', 'la_semilla', null, 'Hierbaluisa', 'Hojas secas, 50 g', 8.90, true, null, null),
    ('40000000-0000-4000-8000-000000000015', 'la_semilla', null, 'Menta', 'Hojas secas, 30 g', 6.40, true, null, null),
    ('40000000-0000-4000-8000-000000000016', 'la_semilla', null, 'Toronjil', 'Hojas secas, 40 g', 9.50, false, null, null),
    ('40000000-0000-4000-8000-000000000017', 'la_semilla', null, 'Flor de Jamaica', 'Cálices secos, 100 g', 11.80, true, null, null),
    ('40000000-0000-4000-8000-000000000018', 'la_semilla', null, 'Hierbabuena', 'Atado fresco, 40 g', 4.00, true, null, null),
    ('40000000-0000-4000-8000-000000000019', 'la_semilla', null, 'Hinojo', 'Semillas enteras, 50 g', 6.80, true, null, null),
    ('40000000-0000-4000-8000-000000000020', 'la_semilla', null, 'Tomillo', 'Hojas secas, 25 g', 7.60, true, null, null),
    ('40000000-0000-4000-8000-000000000021', 'la_semilla', null, 'Orégano', 'Hojas secas, 35 g', 5.90, true, null, null),
    ('40000000-0000-4000-8000-000000000022', 'la_semilla', null, 'Salvia', 'Hojas secas, 30 g', 8.00, false, null, null),
    ('40000000-0000-4000-8000-000000000023', 'la_semilla', null, 'Lavanda', 'Flores secas, 20 g', 10.50, true, null, null)
)
insert into public.productos (id, puesto_id, planta_id, nombre, presentacion, precio, disponible, procedencia, calidad)
select o.id, p.id, o.planta_id, o.nombre, o.presentacion, o.precio, o.disponible, o.procedencia, o.calidad
from ofertas o
join puestos_demo demo on demo.clave = o.puesto
join public.puestos p on p.id = demo.id and p.propietario_id = demo.propietario_id
join auth.users u on u.id = demo.propietario_id and u.email = demo.email
on conflict (id) do nothing;
