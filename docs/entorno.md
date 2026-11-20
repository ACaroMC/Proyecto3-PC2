# Sprint 0 · Entorno del examen DevSecOps

Repositorio del examen [Proyecto3-PC2](https://github.com/ACaroMC/Proyecto3-PC2).

## Ejecutar en Windows

Usa Node.js 22. Si descargaste la copia local de Node durante la preparación, puedes activarla para la sesión de PowerShell.

```powershell
$env:Path = "$(Resolve-Path .tools/node22/node_modules/node/bin);$env:Path"
node --version
npm.cmd ci
npm.cmd run check
npm.cmd run dev
```

Abre `http://localhost:3000`. En otra terminal, comprueba la respuesta `{"status":"ok"}`.

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

## GitHub Actions

El workflow ejecuta ESLint, TypeScript, Vitest y el build. Después, Gitleaks revisa el historial, `npm audit` comprueba las dependencias de la aplicación y PostgreSQL ejecuta las pruebas de RLS. Los PR hacia `develop` o `main` ejecutan ambas etapas. El despliegue de este examen se ejecuta desde `main`.

Para habilitar el despliegue, configura `production` en **Settings → Environments** de GitHub.

| Dónde | Configuración |
| --- | --- |
| GitHub → Variables del repositorio | `DEPLOY_PRODUCTION=true` habilita el despliegue desde `main`. |
| GitHub → Secretos de `production` | `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`. Puedes verificar los IDs del vínculo local en `.vercel/repo.json` o `.vercel/project.json`. |
| GitHub → Secretos de `production` | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID` (referencia del proyecto) y `SUPABASE_DB_PASSWORD`. El pipeline aplica las migraciones de `supabase/migrations/`. |
| GitHub → Variables del entorno `production` | `APP_URL`, con el dominio público de producción. El pipeline comprueba `/api/health`. |
| Vercel → Settings → Environment Variables | `NEXT_PUBLIC_SUPABASE_URL` con la URL base del proyecto y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, con los valores de cada entorno. |

Para desarrollo local, copia `.env.example` a `.env.local` y usa la URL base y la clave publicable del proyecto de pruebas. Git ignora `.env.local`. Guarda los tokens y la contraseña de la base de datos directamente en GitHub Secrets cuando configures el entorno.

Para el ensayo, vuelve a ejecutar el workflow de `main` mediante **Actions → Pipeline DevSecOps → Run workflow** tras habilitar el despliegue. Comprueba el job `deploy` y abre el endpoint público.

## Jira y comienzo del examen

El [backlog](backlog.md) mantiene la distribución en los sprints 1 a 4. El Sprint 0 corresponde a esta preparación.
