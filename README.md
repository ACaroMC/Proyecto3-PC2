# Raíz Perú

Directorio de hierberos y tiendas naturistas para consultar puestos, comparar precios y encontrar fichas de plantas con fuentes.

- [Pregunta 3 · Arquitectura y ciclo DevSecOps](docs/pregunta-3-arquitectura-devsecops.md)
- [Informe del examen](docs/informe.md)
- [Cobertura de las 26 historias](docs/evidencia-hu.md)

## Ejecutar

Usa Node 22. Para contar con datos editables en local, inicia Supabase CLI con Docker. Puede tardar mientras descarga las imágenes iniciales.

```powershell
npm.cmd ci
npx.cmd supabase start
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm.cmd run dev
```

Si ya tienes `.env.local`, conserva el archivo. Configura en él la API URL y la clave publicable del proyecto de pruebas que usarás. La aplicación se abre en `http://localhost:3000`. La inicialización local aplica las migraciones y carga `supabase/seed.sql`, con dos ofertas comparables de manzanilla. Las cuentas ficticias de esa semilla carecen de contraseña. Para un ensayo con la interfaz, registra un hierbero y un comprador propios en el entorno de pruebas.

En Supabase alojado, configura **Auth → URL Configuration** con el dominio que usarás y agrega `https://<dominio>/auth/confirm` a las URL permitidas para confirmar por correo. Para confirmar desde otro navegador, el correo puede usar el enlace `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}` con el dominio configurado como Site URL.

### Administrador

Una persona autorizada en Supabase registra y confirma primero la cuenta. Luego ejecuta en **SQL Editor** una actualización para el correo exacto de esa cuenta y verifica que devuelva una fila.

```sql
update public.perfiles p
set rol = 'administrador'
from auth.users u
where p.id = u.id
  and u.email = 'correo-del-administrador@example.invalid'
  and u.email_confirmed_at is not null
  and p.rol = 'comprador'
returning p.id, p.rol;
```

## Probar

```powershell
npm.cmd run check
npm.cmd audit --audit-level=high
```

El job `seguridad` prueba en PostgreSQL la misma migración de producción con un esquema de identidad de pruebas. El ensayo usa roles de anónimo, comprador, hierbero y administrador y revierte las escrituras al final. En la interfaz, registra un hierbero, crea su puesto, publica una oferta de manzanilla y márcala como agotada. Abre `/productos?producto=Manzanilla` como comprador para ver el cambio. La actualización se lee de la base en la siguiente consulta.

## Desplegar

El flujo de revisión es `hu/HU-XX → develop → main`. GitHub Actions valida cada cambio. Para habilitar producción, configura el entorno `production` de GitHub y las variables de Supabase en Vercel. El job `deploy` se habilita desde `main` con `DEPLOY_PRODUCTION=true` en las variables del repositorio. Vercel recibe el resultado después de CI, seguridad y migraciones. La siembra de demostración se reserva para una base de pruebas.

El workflow usa Supabase CLI fijada en el lockfile de la app y una versión fija de Vercel CLI en el job de despliegue. Configura `APP_URL` con el dominio de producción. Más detalles en la [guía de entorno](docs/entorno.md).
