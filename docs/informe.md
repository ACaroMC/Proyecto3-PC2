# Informe del examen

[Repositorio](https://github.com/ACaroMC/Proyecto3-PC2) · [Dominio de producción](https://proyecto3-pc-2.vercel.app) · [Evidencia por historia](evidencia-hu.md) · [Arquitectura DevSecOps](pregunta-3-arquitectura-devsecops.md)

El ciclo de ocho fases, sus controles y la guía de operación se documentan en la **Pregunta 3**. Los [diagramas](diagramas.md) muestran el recorrido de una solicitud y las relaciones del modelo.

En Scrum se conserva la estructura original del [backlog](backlog.md). El Sprint 0 prepara el entorno. En la planificación de cada sprint se ordenan historias por dependencias y se acuerda su alcance. El seguimiento diario detecta bloqueos, la revisión demuestra los criterios y la retrospectiva ajusta el proceso.

El modelo separa cuentas, puestos, productos, plantas y reseñas. Cada producto pertenece a un puesto y puede documentarse mediante una ficha compartida. Los datos privados de cuenta se mantienen en Auth y en la correspondencia protegida por columna. Esta estructura evita repetir datos de comercio o fichas en cada oferta. Las restricciones mantienen integridad y las políticas aplican permisos por rol y propiedad.

La prueba de navegador comprobó el directorio, la comparación y el panel a 360, 768 y 1440 px. La autenticación de este ensayo usó cuentas simuladas. El catálogo y la actualización de stock usaron PostgreSQL local con las políticas de la migración.

- [Directorio a 360 px](capturas/directorio-movil.png)
- [Comparación después del cambio de stock](capturas/comparacion-movil.png)
- [Formulario de disponibilidad del hierbero](capturas/panel-movil.png)
