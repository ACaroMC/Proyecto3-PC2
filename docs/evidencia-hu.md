# Evidencia de las historias

La columna de evidencia señala el código o la prueba que cubre cada historia. Los ensayos de RLS son reproducibles con PostgreSQL aislado y `supabase/tests/rls.sql`.

| HU | Implementación | Evidencia |
| --- | --- | --- |
| HU-01 | Flujo por ramas y PR | [Ramas y PR del repositorio](https://github.com/ACaroMC/Proyecto3-PC2/pulls?q=is%3Apr) |
| HU-02 | CI desde lockfile | `npm run check` y job `ci` |
| HU-03 | Gitleaks, auditoría completa y RLS | Job `seguridad` |
| HU-04 | Migraciones y Vercel desde main | Job `deploy` en `pipeline.yml` |
| HU-05 | Registro comprador o hierbero | `/registro`, Vitest y trigger probado en SQL |
| HU-06 | Inicio, cierre y panel por rol | `/ingresar`, `/panel` y Vitest |
| HU-07 | RLS y permisos por rol | Migración inicial y ensayo SQL |
| HU-08 | Alta/edición del puesto | `/panel/hierbero`, Vitest y RLS |
| HU-10 | Filtros del directorio | `/puestos` y exclusión SQL de suspendidos |
| HU-11 | Ficha comercial y datos reservados | `/puestos/[id]` y grants SQL por columna |
