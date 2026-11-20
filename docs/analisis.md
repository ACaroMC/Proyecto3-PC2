# Análisis del directorio

Los compradores necesitan encontrar hierberos y tiendas naturistas, y comparar precios antes de visitarlos.
Los puestos necesitan publicar sus datos comerciales y mantener su inventario al día.
El administrador verifica puestos, publica fichas con fuentes y modera reseñas.

| Actor | Funciones |
| --- | --- |
| Visitante | Consulta el directorio, los catálogos y las fichas publicadas. Puede registrarse. |
| Comprador | Usa las consultas públicas y puede publicar una reseña por puesto. |
| Hierbero | Gestiona el perfil y los productos de su propio puesto. |
| Administrador | Gestiona fichas, verifica o suspende puestos y modera reseñas. |

| Requisito | Alcance | Prioridad |
| --- | --- | --- |
| RF-01 | Registro, sesión y acceso por rol | Must |
| RF-02 | Directorio, filtros y detalle comercial | Must |
| RF-03 | Alta de productos, precios, disponibilidad y comparación | Must |
| RF-04 | Fichas publicadas, fuentes y aviso informativo | Must |
| RF-05 | Procedencia y calidad declaradas | Must |
| RF-06 | Ubicación, mapa, búsqueda de fichas y vinculación a productos | Should |
| RF-07 | Eliminación de ofertas, verificación y reseñas | Should |
| RF-08 | Moderación de reseñas | Could |
| RF-09 | Revisión por PR, CI, seguridad y despliegue trazable | Must |

Las operaciones privadas requieren sesión verificada. PostgreSQL restringe las escrituras por rol y propiedad. La app presenta controles utilizables desde móvil y limita las búsquedas a solicitudes acotadas. El endpoint de salud comprueba la disponibilidad de la aplicación desplegada.

Para el examen se usa un puesto por cuenta de hierbero y una reseña por comprador y puesto. Los filtros agrupan los valores declarados por los comercios. Las fichas informativas enlazan a una fuente institucional y describen con cautela los usos tradicionales.
