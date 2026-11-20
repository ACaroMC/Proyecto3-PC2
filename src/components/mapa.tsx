'use client';

import { useEffect, useRef, useState } from 'react';

export type Punto = { id: string; nombre: string; latitud: number; longitud: number };
type Coordenadas = { latitud: number; longitud: number };
const inicio: [number, number] = [-9.19, -75.015];

function Mapa({ puntos, centro, elegir }: { puntos: Punto[]; centro?: Coordenadas | null; elegir?: (point: Coordenadas) => void }) {
  const elemento = useRef<HTMLDivElement>(null);
  const elegido = useRef(elegir);
  const centroInicial = useRef(centro);
  const [fallo, setFallo] = useState(false);

  useEffect(() => { elegido.current = elegir; }, [elegir]);

  useEffect(() => {
    let cancelar = false;
    let retirar: (() => void) | undefined;
    const nodo = elemento.current;
    if (!nodo) return;
    void import('leaflet').then((L) => {
      if (cancelar) return;
      const editable = Boolean(elegido.current);
      const guardado = centroInicial.current;
      const inicial: [number, number] = guardado ? [guardado.latitud, guardado.longitud] : inicio;
      const mapa = L.map(nodo, { scrollWheelZoom: false }).setView(inicial, guardado ? 15 : 5);
      const dimensiones = new ResizeObserver(() => mapa.invalidateSize({ pan: false }));
      dimensiones.observe(nodo);
      retirar = () => { dimensiones.disconnect(); mapa.remove(); };
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapa);
      const icon = L.divIcon({ className: 'map-pin', iconSize: [24, 24], iconAnchor: [12, 24] });
      if (editable) {
        let marca = guardado ? L.marker(inicial, { icon }).addTo(mapa) : null;
        const situar = (latitud: number, longitud: number) => {
          const coordenadas = { latitud, longitud: ((longitud + 180) % 360 + 360) % 360 - 180 };
          const posicion: [number, number] = [coordenadas.latitud, coordenadas.longitud];
          marca = marca?.setLatLng(posicion) ?? L.marker(posicion, { icon }).addTo(mapa);
          elegido.current?.(coordenadas);
        };
        mapa.on('click', ({ latlng }) => situar(latlng.lat, latlng.lng));
      } else {
        const ubicaciones: [number, number][] = [];
        for (const punto of puntos) {
          const coordenada: [number, number] = [punto.latitud, punto.longitud];
          ubicaciones.push(coordenada);
          const enlace = document.createElement('a');
          enlace.href = '/puestos/' + encodeURIComponent(punto.id);
          enlace.textContent = punto.nombre;
          L.marker(coordenada, { icon, title: punto.nombre, alt: punto.nombre }).addTo(mapa).bindPopup(enlace);
        }
        if (ubicaciones.length) mapa.fitBounds(ubicaciones, { maxZoom: 15, padding: [28, 28] });
      }
    }).catch(() => { if (!cancelar) setFallo(true); });
    return () => { cancelar = true; retirar?.(); };
  }, [puntos]);

  return fallo ? <p role="status">No pudimos cargar el mapa. Puedes consultar la dirección del puesto.</p>
    : <div className="mapa" ref={elemento} aria-label="Mapa de puestos" />;
}

export function MapaPuestos({ puntos }: { puntos: Punto[] }) {
  return puntos.length ? <Mapa puntos={puntos} /> : <p className="muted">Los puestos sin coordenadas muestran su dirección en la ficha.</p>;
}

const mapaVacio: Punto[] = [];

export function ElegirUbicacion({ inicial }: { inicial: Coordenadas | null }) {
  const [latitud, setLatitud] = useState(inicial ? String(inicial.latitud) : '');
  const [longitud, setLongitud] = useState(inicial ? String(inicial.longitud) : '');
  const [version, setVersion] = useState(0);
  const elegir = ({ latitud, longitud }: Coordenadas) => {
    setLatitud(latitud.toFixed(6));
    setLongitud(longitud.toFixed(6));
  };
  return <div className="stack">
    <p className="muted">Marca un punto en el mapa o escribe las coordenadas.</p>
    <Mapa key={version} puntos={mapaVacio} centro={version ? null : inicial} elegir={elegir} />
    <div className="grid fields">
      <label>Latitud<input name="latitud" type="number" step="any" min={-90} max={90} value={latitud} onChange={(event) => setLatitud(event.target.value)} /></label>
      <label>Longitud<input name="longitud" type="number" step="any" min={-180} max={180} value={longitud} onChange={(event) => setLongitud(event.target.value)} /></label>
    </div>
    <div><button className="button secondary" type="button" onClick={() => { setLatitud(''); setLongitud(''); setVersion(version + 1); }}>Quitar coordenadas</button></div>
  </div>;
}
