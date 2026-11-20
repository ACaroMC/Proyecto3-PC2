import { gestionarPuesto, guardarPlanta, moderarResena, salir } from '@/app/actions';
import { Enviar } from '@/components/enviar';
import { Estado } from '@/components/estado';
import { camposPuesto, camposResena, datos, type Planta, type Puesto, type Resena } from '@/lib/datos';
import { exigirRol } from '@/lib/sesion';

const textos = [['usos', 'Usos tradicionales'], ['preparacion', 'Preparación'], ['precauciones', 'Precauciones']] as const;

function FormularioPlanta({ planta }: { planta?: Planta }) {
  return <form action={guardarPlanta} className="stack">
    <input type="hidden" name="id" value={planta?.id ?? ''} />
    <div className="grid fields">
      <label>Nombre común<input name="nombre" defaultValue={planta?.nombre} required minLength={2} maxLength={100} /></label>
      <label>Nombre científico<input name="cientifico" defaultValue={planta?.cientifico} required minLength={3} maxLength={140} /></label>
      <label>Nombre de la fuente<input name="fuente_nombre" defaultValue={planta?.fuente_nombre} required minLength={2} maxLength={120} /></label>
      <label>URL HTTPS de la fuente<input type="url" name="fuente_url" defaultValue={planta?.fuente_url} required maxLength={500} /></label>
    </div>
    {textos.map(([name, label]) => <label key={name}>{label}<textarea name={name} defaultValue={planta?.[name]} required minLength={3} maxLength={1600} /></label>)}
    <label>Estado de la ficha<select name="publicada" defaultValue={String(planta?.publicada ?? true)}>
      <option value="true">Publicada</option><option value="false">Borrador</option>
    </select></label>
    <div><Enviar>Guardar ficha</Enviar></div>
  </form>;
}

export default async function Administracion({ searchParams }: PageProps<'/panel/administracion'>) {
  const [{ cliente }, { estado }] = await Promise.all([exigirRol('administrador'), searchParams]);
  const [puestosQuery, plantasQuery, resenasQuery] = await Promise.all([
    cliente.from('puestos').select(camposPuesto).order('nombre'),
    cliente.from('plantas').select('*').order('nombre'),
    cliente.from('resenas').select(camposResena).order('creada_en', { ascending: false }),
  ]);
  const puestos: Puesto[] = datos(puestosQuery) ?? [];
  const plantas: Planta[] = datos(plantasQuery) ?? [];
  const resenas: Resena[] = datos(resenasQuery) ?? [];
  const nombres = new Map(puestos.map((puesto) => [puesto.id, puesto.nombre]));
  return <div className="stack">
    <header className="page-heading"><h1>Administración</h1><p>Publica fichas, verifica puestos y modera reseñas.</p></header>
    <Estado estado={estado} />
    <section className="surface stack"><h2>Fichas de plantas</h2>
      <details><summary>Nueva ficha</summary><FormularioPlanta /></details>
      {plantas.map((planta) => <details key={planta.id}><summary>{planta.nombre} · {planta.publicada ? 'Publicada' : 'Borrador'}</summary><FormularioPlanta planta={planta} /></details>)}
    </section>
    <section className="surface stack"><h2>Puestos</h2>
      {!puestos.length && <p className="muted">Todavía no hay puestos registrados.</p>}
      {puestos.map((puesto) => <details key={puesto.id}>
        <summary>{puesto.nombre} · {puesto.verificado ? 'Verificado' : 'Pendiente'} · {puesto.suspendido ? 'Suspendido' : 'Activo'}</summary>
        <form action={gestionarPuesto} className="stack">
          <input type="hidden" name="id" value={puesto.id} />
          <div className="grid fields">
            <label>Verificación<select name="verificado" defaultValue={String(puesto.verificado)}><option value="true">Verificado</option><option value="false">Sin verificar</option></select></label>
            <label>Visibilidad<select name="suspendido" defaultValue={String(puesto.suspendido)}><option value="false">Activo</option><option value="true">Suspendido</option></select></label>
          </div>
          <div><Enviar>Guardar estado del puesto</Enviar></div>
        </form>
      </details>)}
    </section>
    <section className="surface stack"><h2>Moderación de reseñas</h2>
      {resenas.length ? <ul className="review-list">{resenas.map((item) => <li key={item.id}>
        <strong>{nombres.get(item.puesto_id)} · {item.valoracion} de 5</strong>
        <p>{item.comentario}</p>
        <form action={moderarResena} className="actions">
          <input type="hidden" name="id" value={item.id} /><input type="hidden" name="visible" value={String(!item.visible)} />
          <span className="tag">{item.visible ? 'Visible' : 'Oculta'}</span>
          <Enviar variant="secondary">{item.visible ? 'Ocultar reseña' : 'Restaurar reseña'}</Enviar>
        </form>
      </li>)}</ul> : <p className="muted">Todavía no hay reseñas para moderar.</p>}
    </section>
    <form action={salir}><Enviar variant="secondary">Cerrar sesión</Enviar></form>
  </div>;
}
