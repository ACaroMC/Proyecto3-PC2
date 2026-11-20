import Image from 'next/image';

type Imagen = {
  src: string;
  alt: string;
  referencial?: boolean;
  credito?: { autor: string; fuente: string; licencia: string; urlLicencia: string };
};

export const fotoInicio: Imagen = {
  src: '/images/hierbas-mercado.webp',
  alt: 'Hierbas y flores secas en canastas sobre una mesa de madera',
};

export const fotoPuesto: Imagen = {
  src: '/images/puesto-referencial.webp',
  alt: 'Puesto de mercado con bandejas y sacos de hierbas secas',
  referencial: true,
};

const fotoHierbas: Imagen = {
  src: '/images/hierbas-referenciales.webp',
  alt: 'Cuenco de cerámica con una mezcla de hojas y flores secas',
  referencial: true,
};

const fotoManzanillaSeca: Imagen = {
  src: '/images/manzanilla-seca.webp',
  alt: 'Flores secas de manzanilla alemana',
  referencial: true,
  credito: {
    autor: 'Feen',
    fuente: 'https://commons.wikimedia.org/wiki/File:Camomila-vulgar_seca.jpg',
    licencia: 'CC BY-SA 3.0',
    urlLicencia: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
};

const fotoManzanillaFlor: Imagen = {
  src: '/images/manzanilla-flor.webp',
  alt: 'Flores blancas de manzanilla alemana con centros amarillos',
  credito: {
    autor: 'Steffen Bauer (SaatPilot)',
    fuente: 'https://commons.wikimedia.org/wiki/File:Matricaria_recutita_(German_chamomile),_flowers,_close-up_(SaatPilot).jpg',
    licencia: 'CC BY 4.0',
    urlLicencia: 'https://creativecommons.org/licenses/by/4.0/',
  },
};

export function fotoProducto(nombre: string, presentacion: string) {
  if (nombre.trim().toLowerCase() !== 'manzanilla') return fotoHierbas;
  if (/\bsec[ao]s?\b/i.test(presentacion)) return fotoManzanillaSeca;
  if (/^planta\b/i.test(presentacion.trim())) return { ...fotoManzanillaFlor, referencial: true };
  return fotoHierbas;
}

export function fotoPlanta(cientifico: string) {
  return /^matricaria\s+(recutita|chamomilla)(\s+l\.?)?$/i.test(cientifico.trim())
    ? fotoManzanillaFlor : fotoHierbas;
}

const tamanos = {
  hero: '(min-width: 76rem) 23rem, (min-width: 57rem) 32vw, 90vw',
  tarjeta: '(min-width: 76rem) 21rem, (min-width: 57rem) 30vw, (min-width: 38rem) 44vw, 90vw',
  miniatura: '(min-width: 38rem) 10rem, 6rem',
  detalle: '(min-width: 50rem) 46rem, 92vw',
};

export function Foto({ imagen, formato = 'tarjeta' }: { imagen: Imagen; formato?: keyof typeof tamanos }) {
  const destacada = formato === 'hero';
  return (
    <figure className={'photo photo-' + formato}>
      <div className="photo-frame">
        <Image
          src={imagen.src}
          alt={imagen.alt}
          fill
          sizes={tamanos[formato]}
          loading={destacada ? 'eager' : 'lazy'}
          fetchPriority={destacada ? 'high' : undefined}
        />
      </div>
      {(imagen.referencial || imagen.credito) && <figcaption className="photo-caption">
        {imagen.referencial && <span>Imagen referencial</span>}
        {imagen.credito && <span>
          <a href={imagen.credito.fuente}>{imagen.credito.autor}</a> · <a href={imagen.credito.urlLicencia}>{imagen.credito.licencia}</a>
        </span>}
      </figcaption>}
    </figure>
  );
}
