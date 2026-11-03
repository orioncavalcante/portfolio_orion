import { Link } from 'react-router-dom';

const assetFiles = import.meta.glob('../assets/*', { eager: true, import: 'default' });

function getAsset(keyword, fallbackUrl, exclude) {
  const foundKey = Object.keys(assetFiles).find((path) => {
    const p = path.toLowerCase();
    return p.includes(keyword.toLowerCase()) && !(exclude && p.includes(exclude.toLowerCase()));
  });
  return foundKey ? assetFiles[foundKey] : fallbackUrl;
}

const cogumeloImg = getAsset('cogumelo', '/assets/cogumelo.png');
const gramaImg = getAsset('grama.png', '/assets/grama.png');
const gramaNoiteImg = getAsset('grama_noite.png', '/assets/grama_noite.png');
const nuvemImg = getAsset('nuvem.png', '/assets/nuvem.png');
const nuvemNoiteImg = getAsset('nuvem_noite.png', '/assets/nuvem_noite.png');

// n unidades "--u" (1u = 1vw, com mínimo de 6px)
const u = (n) => `calc(var(--u) * ${n})`;

// Lua crescente em pixel art para o modo noturno
const MOON_SIZE = 16;
const MOON_LIGHT = '#e8ecf4';
const MOON_SHADE = '#9aa3b8';

const { MOON_LIGHT_PATH, MOON_SHADE_PATH } = (() => {
  const inside = (x, y, cx, cy, r) => (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r;
  const isMoon = (x, y) => inside(x, y, 8, 8, 7.5) && !inside(x, y, 11.5, 6, 6.2);
  const isShade = (x, y) => inside(x, y, 11.5, 6, 8.4);
  const craters = new Set(['3,6', '4,6', '3,7', '6,11', '7,11', '6,12']);
  const isDark = (x, y) => isMoon(x, y) && (isShade(x, y) || craters.has(`${x},${y}`));
  const isLight = (x, y) => isMoon(x, y) && !isDark(x, y);

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
  { alt: 'Cogumelo esquerdo', left: '34.5%', bottom: 5.2, width: 6.8 },
  { alt: 'Cogumelo central', left: '52%', bottom: 9.8, width: 6.2 },
  { alt: 'Cogumelo direito', left: '68%', bottom: 8.6, width: 4.8 },
];

const clouds = [
  { top: '7%', width: 17, opacity: 0.95, anim: 'nf-cloud-1', hideOnMobile: false },
  { top: '9%', width: 12, opacity: 0.9, anim: 'nf-cloud-2', hideOnMobile: false },
  { top: '39%', width: 17, opacity: 0.95, anim: 'nf-cloud-3', hideOnMobile: true },
];

export function NotFound() {
  return (
    <main
      className="relative w-full h-svh min-h-[540px] bg-white dark:bg-zinc-800 overflow-hidden select-none transition-colors duration-300"
      style={{ '--u': 'max(1vw, 6px)' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,900&display=swap');

        @keyframes nf-cloud-drift {
          0% { transform: translateX(-220px); }
          100% { transform: translateX(calc(100vw + 220px)); }
        }
        .nf-cloud-1 { animation: nf-cloud-drift 65s linear infinite; animation-delay: -12s; }
        .nf-cloud-2 { animation: nf-cloud-drift 85s linear infinite; animation-delay: -55s; }
        .nf-cloud-3 { animation: nf-cloud-drift 110s linear infinite; animation-delay: -82s; }
      `}</style>

      {/* NUVENS */}
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

      {/* CONTEÚDO CENTRAL: 404 + OOPS... PÁGINA NÃO ENCONTRADA + BOTÃO VOLTAR */}
      <div
        className="absolute inset-x-0 top-0 z-30 flex flex-col items-center justify-center text-center px-4"
        style={{ bottom: u(22) }}
      >
        <div
          className="text-[#DE1B1B] uppercase"
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontStretch: '125%',
            fontWeight: 900,
          }}
        >
          <h1
            className="leading-[0.82] tracking-[-0.02em]"
            style={{ fontSize: 'min(22vw, 24vh)' }}
          >
            404
          </h1>
          <p
            className="mt-2 sm:mt-3 leading-[0.92] tracking-[-0.01em]"
            style={{ fontSize: 'min(5.2vw, 5.4vh)' }}
          >
            <span className="block">OOPS...</span>
            <span className="block">PÁGINA NÃO</span>
            <span className="block">ENCONTRADA</span>
          </p>
        </div>

        <Link
          to="/"
          className="mt-6 sm:mt-8 font-mono font-black text-xs sm:text-sm uppercase bg-[#FEF08A] dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-zinc-500 px-5 py-2.5 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#DE1B1B] hover:bg-[#DE1B1B] hover:text-white dark:hover:bg-[#DE1B1B] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all cursor-pointer"
        >
          ← VOLTAR PARA A PÁGINA INICIAL
        </Link>
      </div>

      {/* GRAMA */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 overflow-hidden pointer-events-none"
        style={{ height: u(25) }}
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

      {/* LUA (só no modo escuro) */}
      <PixelMoon
        className="hidden dark:block absolute z-25 pointer-events-none -translate-x-1/2 translate-y-1/2"
        style={{ left: '82%', bottom: u(26), width: u(10) }}
      />
    </main>
  );
}
