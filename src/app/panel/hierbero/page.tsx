import Link from 'next/link';
import { borrarProducto, guardarProducto, guardarPuesto, salir } from '@/app/actions';
import { Enviar } from '@/components/enviar';
import { Estado } from '@/components/estado';
import { ElegirUbicacion } from '@/components/mapa';
import { camposPuesto, datos, soles, type Planta, type Producto, type Puesto } from '@/lib/datos';
import { exigirRol } from '@/lib/sesion';

const campos = [
  ['nombre', 'Nombre del puesto', 2, 100], ['distrito', 'Distrito', 2, 80],
  ['mercado', 'Mercado o feria', 2, 100], ['direccion', 'Dirección', 4, 200],
  ['horario', 'Horario', 3, 120], ['contacto', 'Contacto comercial', 3, 120],
] as const;

type OpcionPlanta = Pick<Planta, 'id' | 'nombre'>;

function FormularioProducto({ producto, plantas }: { producto?: Producto; plantas: OpcionPlanta[] }) {
  return <form action={guardarProducto} className="stack">
    <input type="hidden" name="id" value={producto?.id ?? ''} />
    <div className="grid fields">
      <label>Nombre del producto<input name="nombre" defaultValue={producto?.nombre} minLength={2} maxLength={120} required /></label>
      <label>Presentación<input name="presentacion" defaultValue={producto?.presentacion} minLength={2} maxLength={120} required /></label>
      <label>Precio en soles<input name="precio" inputMode="decimal" placeholder="10,50" defaultValue={producto?.precio} required /></label>
      <label>Disponibilidad<select name="disponible" defaultValue={String(producto?.disponible ?? true)}>
        <option value="true">Disponible</option><option value="false">Agotado</option>
      </select></label>
      <label>Procedencia declarada<input name="procedencia" defaultValue={producto?.procedencia ?? ''} minLength={2} maxLength={160} /></label>
      <label>Calidad declarada<select name="calidad" defaultValue={producto?.calidad ?? ''}>
        <option value="">No declarada</option><option value="seleccionada">Seleccionada</option><option value="estandar">Estándar</option><option value="artesanal">Artesanal</option>
      </select></label>
      <label>Ficha de planta<select name="planta_id" defaultValue={plantas.some(({ id }) => id === producto?.planta_id) ? producto?.planta_id ?? '' : ''}>
        <option value="">Sin ficha vinculada</option>{plantas.map(({ id, nombre }) => <option key={id} value={id}>{nombre}</option>)}
      </select></label>
    </div>
    <div><Enviar>{producto ? 'Guardar producto' : 'Añadir producto'}</Enviar></div>
  </form>;
}

export default async function PanelHierbero({ searchParams }: PageProps<'/panel/hierbero'>) {
  const [{ cliente }, { estado }] = await Promise.all([exigirRol('hierbero'), searchParams]);
  const id = datos(await cliente.rpc('mi_puesto_id'));
  let puesto: Puesto | null = null;
  let productos: Producto[] = [];
  let plantas: OpcionPlanta[] = [];
  if (id) {
    const [perfil, catalogo, fichas] = await Promise.all([
      cliente.from('puestos').select(camposPuesto).eq('id', id).maybeSingle(),
      cliente.from('productos').select('*').eq('puesto_id', id).order('nombre'),
      cliente.from('plantas').select('id,nombre').eq('publicada', true).order('nombre'),
    ]);
    puesto = datos(perfil);
    productos = datos(catalogo) ?? [];
    plantas = datos(fichas) ?? [];
  }
  const posicion = puesto && puesto.latitud !== null && puesto.longitud !== null
    ? { latitud: puesto.latitud, longitud: puesto.longitud } : null;
  return <div className="stack">
    <header className="page-heading"><h1>Mi puesto</h1><p>Gestiona tu ficha comercial, ubicación y catálogo.</p></header>
    <Estado estado={estado} />
    {puesto?.suspendido && <p className="notice notice-error">Tu puesto está suspendido y el catálogo está oculto al público.</p>}
    <section className="surface stack">
      <h2>{puesto ? 'Información del puesto' : 'Registra tu puesto'}</h2>
      <form action={guardarPuesto} className="stack">
        <div className="grid fields">{campos.map(([name, label, min, max]) => (
          <label key={name}>{label}<input name={name} defaultValue={puesto?.[name]} minLength={min} maxLength={max} required /></label>
        ))}</div>
        <details open={Boolean(posicion)}>
          <summary>Ubicación en el mapa</summary>
          <ElegirUbicacion key={posicion ? posicion.latitud + ',' + posicion.longitud : 'sin-ubicacion'} inicial={posicion} />
        </details>
        <div className="actions"><Enviar>{puesto ? 'Guardar puesto' : 'Crear puesto'}</Enviar>
          {puesto && !puesto.suspendido && <Link href={'/puestos/' + puesto.id}>Ver ficha pública</Link>}
        </div>
      </form>
    </section>
    {puesto && <section className="stack">
      <h2>Mi catálogo</h2>
      <details className="surface" open={!productos.length}><summary>Añadir un producto</summary><FormularioProducto plantas={plantas} /></details>
      {productos.map((producto) => <article className="surface stack" key={producto.id}>
        <details><summary>{producto.nombre} · {soles.format(producto.precio)} · {producto.disponible ? 'Disponible' : 'Agotado'}</summary>
          <FormularioProducto producto={producto} plantas={plantas} />
        </details>
        <details><summary>Eliminar este producto</summary>
          <form action={borrarProducto} className="stack"><input type="hidden" name="id" value={producto.id} />
            <p>El producto desaparecerá del catálogo.</p><div><Enviar variant="danger">Confirmar eliminación</Enviar></div>
          </form>
        </details>
      </article>)}
    </section>}
    <form action={salir}><Enviar variant="secondary">Cerrar sesión</Enviar></form>
  </div>;
}
