import { useState, useRef, useLayoutEffect } from 'react';

const assetFiles = import.meta.glob('../../assets/*', { eager: true, import: 'default' });

function getAsset(keyword, fallbackUrl, exclude) {
  const foundKey = Object.keys(assetFiles).find((path) => {
    const p = path.toLowerCase();
    return p.includes(keyword.toLowerCase()) && !(exclude && p.includes(exclude.toLowerCase()));
  });
  return foundKey ? assetFiles[foundKey] : fallbackUrl;
}

const catImg = getAsset('cat', '/assets/cat.png', 'white');
const catWhiteImg = getAsset('cat_white', '/assets/cat_white.png');
const cogumeloImg = getAsset('cogumelo', '/assets/cogumelo.png');
const gramaImg = getAsset('grama.png', '/assets/grama.png');
const gramaNoiteImg = getAsset('grama_noite.png', '/assets/grama_noite.png');
const nuvemImg = getAsset('nuvem.png', '/assets/nuvem.png');
const nuvemNoiteImg = getAsset('nuvem_noite.png', '/assets/nuvem_noite.png');

// n unidades "--u" (1u = 1vw, com mínimo de 6px)
const u = (n) => `calc(var(--u) * ${n})`;

function PixelStar({ className = '', style }) {
  return (
    <svg
      viewBox="0 0 11 11"
      className={`fill-black dark:fill-white transition-colors duration-300 ${className}`}
      style={{ shapeRendering: 'crispEdges', ...style }}
      aria-hidden="true"
    >
      <rect x="5" y="0" width="1" height="11" />
      <rect x="0" y="5" width="11" height="1" />
      <rect x="4" y="2" width="3" height="7" />
      <rect x="2" y="4" width="7" height="3" />
      <rect x="3" y="3" width="5" height="5" />
    </svg>
  );
}

// Lua crescente em pixel art, gerada em grade 16x16:
// círculo grande menos um círculo deslocado
const MOON_SIZE = 16;
const MOON_LIGHT = '#e8ecf4'; // parte iluminada
const MOON_SHADE = '#9aa3b8'; // sombra e crateras

const { MOON_LIGHT_PATH, MOON_SHADE_PATH } = (() => {
  const inside = (x, y, cx, cy, r) => (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r;

  const isMoon = (x, y) => inside(x, y, 8, 8, 7.5) && !inside(x, y, 11.5, 6, 6.2);
  // faixa de sombra junto à borda interna do crescente
  const isShade = (x, y) => inside(x, y, 11.5, 6, 8.4);
  const craters = new Set(['3,6', '4,6', '3,7', '6,11', '7,11', '6,12']);
  const isDark = (x, y) => isMoon(x, y) && (isShade(x, y) || craters.has(`${x},${y}`));
  const isLight = (x, y) => isMoon(x, y) && !isDark(x, y);

  // junta pixels vizinhos de uma linha em retângulos únicos
  const build = (pred) => {
    let d = '';
    for (let y = 0; y < MOON_SIZE; y++) {
      let x = 0;
      while (x < MOON_SIZE) {
        if (pred(x, y)) {
          let w = 0;
          while (x + w < MOON_SIZE && pred(x + w, y)) w++;
          d += `M${x} ${y}h${w}v1h-${w}z`;
          x += w;
        } else {
          x++;
        }
      }
    }
    return d;
  };

  return { MOON_LIGHT_PATH: build(isLight), MOON_SHADE_PATH: build(isDark) };
})();

function PixelMoon({ className = '', style }) {
  return (
    <svg
      viewBox={`0 0 ${MOON_SIZE} ${MOON_SIZE}`}
      className={className}
      style={{
        shapeRendering: 'crispEdges',
        filter: 'drop-shadow(0 0 6px rgba(200, 210, 255, 0.35))',
        ...style,
      }}
      aria-hidden="true"
    >
      <path d={MOON_LIGHT_PATH} fill={MOON_LIGHT} />
      <path d={MOON_SHADE_PATH} fill={MOON_SHADE} />
    </svg>
  );
}
const mushrooms = [
  { alt: 'Cogumelo esquerdo', left: '36.5%', bottom: 5.6, width: 5.3 },
  { alt: 'Cogumelo central', left: '50.5%', bottom: 10.3, width: 4.9 },
  { alt: 'Cogumelo direito', left: '63.5%', bottom: 9.9, width: 3.6 },
];

const stars = [
  { left: '72%', bottom: 21.5 },
  { left: '79.4%', bottom: 17.8 },
  { left: '71.5%', bottom: 13.8 },
];

const clouds = [
  { top: '10%', width: 14, opacity: 0.9, anim: 'hero-cloud-1', hideOnMobile: false },
  { top: '34%', width: 10, opacity: 0.7, anim: 'hero-cloud-2', hideOnMobile: false },
  { top: '20%', width: 12, opacity: 1, anim: 'hero-cloud-3', hideOnMobile: true },
];

export function Hero() {
  const [catClicked, setCatClicked] = useState(false);
  const sectionRef = useRef(null);
  const [height, setHeight] = useState(null);

  // Altura = viewport - posição onde a seção começa (funciona com qualquer header)
  useLayoutEffect(() => {
    const fit = () => {
      if (!sectionRef.current) return;
      const top = sectionRef.current.getBoundingClientRect().top + window.scrollY;
      setHeight(Math.max(480, window.innerHeight - top));
    };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white dark:bg-zinc-800 overflow-hidden select-none transition-colors duration-300"
      style={{ '--u': 'max(1vw, 6px)', height: height ?? '100svh' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,900&display=swap');

        @keyframes hero-cloud-drift {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(calc(100vw + 200px)); }
        }
        .hero-cloud-1 { animation: hero-cloud-drift 60s linear infinite; animation-delay: -25s; }
        .hero-cloud-2 { animation: hero-cloud-drift 90s linear infinite; animation-delay: -65s; }
        .hero-cloud-3 { animation: hero-cloud-drift 120s linear infinite; animation-delay: -10s; }
      `}</style>

      {/* NUVENS (atrás de tudo) */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        {clouds.map((c, i) => (
          <div key={i} className={c.hideOnMobile ? 'hidden sm:block' : ''}>
            <img
              src={nuvemImg}
              alt=""
              draggable={false}
              className={`dark:hidden absolute left-0 object-contain drop-shadow-md ${c.anim}`}
              style={{ top: c.top, width: u(c.width), opacity: c.opacity, imageRendering: 'pixelated' }}
            />
            <img
              src={nuvemNoiteImg}
              alt=""
              draggable={false}
              className={`hidden dark:block absolute left-0 object-contain drop-shadow-md ${c.anim}`}
              style={{ top: c.top, width: u(c.width), opacity: c.opacity, imageRendering: 'pixelated' }}
            />
          </div>
        ))}
      </div>

      {/* TÍTULO */}
      <div
        className="absolute inset-x-0 top-0 z-[25] flex items-center justify-center text-center pointer-events-none"
        style={{ bottom: u(14) }}
      >
        <h1
          className="text-[#DE1B1B] uppercase"
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontStretch: '125%',
            fontWeight: 900,
            fontSize: 'min(14vw, 21vh)',
            lineHeight: 0.85,
            letterSpacing: '-0.01em',
          }}
        >
          <span className="block">ORION</span>
          <span className="block">FRANÇA</span>
        </h1>
      </div>

      {/* GRAMA */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 overflow-hidden pointer-events-none"
        style={{ height: u(20) }}
      >
        <img
          src={gramaImg}
          alt="Colina de grama verde"
          fetchPriority="high"
          draggable={false}
          className="w-full h-full object-cover object-top dark:hidden transition-all duration-500"
        />
        <img
          src={gramaNoiteImg}
          alt="Colina de grama noturna"
          draggable={false}
          className="hidden dark:block w-full h-full object-cover object-top scale-[1.75] origin-bottom transition-all duration-500"
        />
      </div>

      {/* GATO: preto no claro, branco no escuro */}
      <button
        type="button"
        onClick={() => setCatClicked(!catClicked)}
        title="Clique no gato!"
        className="absolute z-30 cursor-pointer group focus:outline-none"
        style={{ left: '8.5%', bottom: u(3), width: u(28) }}
      >
        {catClicked && (
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white dark:bg-white dark:text-black font-mono text-xs px-2 py-1 border-2 border-red-600 whitespace-nowrap animate-bounce z-40">
            Miau! Role para ver os projetos ↓
          </span>
        )}
        <img
          src={catImg}
          alt="Gato preto em pixel art"
          draggable={false}
          className="block dark:invisible w-full h-auto object-contain group-hover:-translate-y-1 transition-transform"
          style={{ imageRendering: 'pixelated' }}
        />
        <img
          src={catWhiteImg}
          alt="Gato branco em pixel art"
          draggable={false}
          className="hidden dark:block absolute inset-0 w-full h-full object-contain object-bottom group-hover:-translate-y-1 transition-transform"
          style={{ imageRendering: 'pixelated' }}
        />
      </button>

      {/* COGUMELOS */}
      {mushrooms.map((m) => (
        <img
          key={m.alt}
          src={cogumeloImg}
          alt={m.alt}
          draggable={false}
          className="absolute z-30 pointer-events-none -translate-x-1/2"
          style={{
            left: m.left,
            bottom: u(m.bottom),
            width: u(m.width),
            imageRendering: 'pixelated',
          }}
        />
      ))}

      {/* ESTRELAS (só no modo claro) */}
      {stars.map((s, i) => (
        <PixelStar
          key={i}
          className="dark:hidden absolute z-30 pointer-events-none -translate-x-1/2 translate-y-1/2"
          style={{ left: s.left, bottom: u(s.bottom), width: u(5.7) }}
        />
      ))}

      {/* LUA (só no modo escuro) */}
      <PixelMoon
        className="hidden dark:block absolute z-30 pointer-events-none -translate-x-1/2 translate-y-1/2"
        style={{ left: '75%', bottom: u(18), width: u(11) }}
      />
    </section>
  );
}