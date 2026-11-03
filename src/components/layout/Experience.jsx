import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const assetFiles = import.meta.glob('../../assets/*', { eager: true, import: 'default' });

function getAsset(keyword, fallbackUrl) {
  const foundKey = Object.keys(assetFiles).find((path) =>
    path.toLowerCase().includes(keyword.toLowerCase())
  );
  return foundKey ? assetFiles[foundKey] : fallbackUrl;
}

const gramaImg = getAsset('grama.png', '/assets/grama.png');
const gramaNoiteImg = getAsset('grama_noite.png', '/assets/grama_noite.png');
const nuvemImg = getAsset('nuvem.png', '/assets/nuvem.png');
const nuvemNoiteImg = getAsset('nuvem_noite.png', '/assets/nuvem_noite.png');
const pastaImg = getAsset('pasta', '/assets/pasta.png');

export function Experience() {
  const [activeFolder, setActiveFolder] = useState(null);
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    async function fetchExperiences() {
      const { data, error } = await supabase
        .from('experiencias')
        .select('*')
        .order('ordem', { ascending: true });
      
      if (data) setExperiences(data);
      if (error) console.error("Erro ao buscar experiências:", error);
    }
    fetchExperiences();
  }, []);

  return (
    <section id="experiencia" className="relative w-full min-h-[650px] md:min-h-[800px] dark:bg-zinc-800 overflow-hidden select-none transition-colors duration-300 flex flex-col">
      
      <style>{`
        @keyframes cloud-drift {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(calc(100vw + 200px)); }
        }
        .animate-cloud-1 { animation: cloud-drift 60s linear infinite; animation-delay: -25s; }
        .animate-cloud-2 { animation: cloud-drift 90s linear infinite; animation-delay: -65s; }
        .animate-cloud-3 { animation: cloud-drift 120s linear infinite; animation-delay: -10s; }
        
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* NUVENS NO FUNDO */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img src={nuvemImg} alt="Nuvem" className="dark:hidden absolute top-[12%] left-0 w-28 md:w-44 opacity-90 object-contain animate-cloud-1 drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
        <img src={nuvemNoiteImg} alt="Nuvem" className="hidden dark:block absolute top-[12%] left-0 w-28 md:w-44 opacity-90 object-contain animate-cloud-1 drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
        <img src={nuvemImg} alt="Nuvem" className="dark:hidden absolute top-[35%] left-0 w-20 md:w-32 opacity-70 object-contain animate-cloud-2 drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
        <img src={nuvemNoiteImg} alt="Nuvem" className="hidden dark:block absolute top-[35%] left-0 w-20 md:w-32 opacity-70 object-contain animate-cloud-2 drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
        <img src={nuvemImg} alt="Nuvem" className="dark:hidden absolute top-[20%] left-0 w-24 md:w-40 opacity-100 object-contain animate-cloud-3 hidden sm:block drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
        <img src={nuvemNoiteImg} alt="Nuvem" className="hidden dark:sm:block absolute top-[20%] left-0 w-24 md:w-40 opacity-100 object-contain animate-cloud-3 drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
      </div>

      {/* TÍTULO DE FUNDO */}
      <div className="relative self-start left-[4%] mt-12 md:mt-16 z-10 flex flex-col font-black text-[#DE1B1B] leading-[0.82] tracking-tighter pointer-events-none" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
        <span className="text-[15vw] md:text-[130px] scale-x-110 origin-left">EXP</span>
        <span className="text-[15vw] md:text-[130px] scale-x-110 origin-left">ERI</span>
        <span className="text-[15vw] md:text-[130px] scale-x-110 origin-left">ÊN</span>
        <span className="text-[15vw] md:text-[130px] scale-x-110 origin-left">CIA</span>
      </div>

      {/* CHÃO DE GRAMA */}
      <div className="absolute inset-x-0 bottom-0 w-full h-[200px] md:h-[45%] z-20 pointer-events-none">
        <img src={gramaImg} alt="Grama" className="w-full h-full object-cover object-top dark:hidden transition-all duration-500" draggable="false" />
        <img src={gramaNoiteImg} alt="Grama" className="hidden dark:block w-full h-full object-cover object-top scale-[1.25] origin-bottom transition-all duration-500" draggable="false" />
      </div>

      {/* CONTAINER DAS PASTAS (FLEXBOX RESPONSIVO) */}
      <div className="relative w-full z-30 max-w-[1400px] mx-auto px-4 mt-8 pb-48 md:pb-32 flex-1 flex items-end justify-center">
        
        <div className="relative flex flex-col md:flex-row flex-wrap justify-center items-end w-full">
          
          {/* LINHA PONTILHADA VERTICAL (Aparece apenas no celular) */}
          <div className="md:hidden absolute top-[5%] bottom-[10%] left-1/2 -translate-x-1/2 border-l-[4px] border-dashed border-black dark:border-zinc-400 opacity-40 z-0"></div>

          {experiences.map((exp, index) => (
            <div 
              key={exp.id}
              // As classes w-full no mobile e padding horizontal mantêm o distanciamento correto das linhas
              className="relative group cursor-pointer z-10 flex flex-col items-center w-full md:w-auto px-4 md:px-10 py-6 md:py-4"
            >
              
              {/* LINHA PONTILHADA HORIZONTAL (Aparece apenas no desktop) */}
              {/* Desenha uma linha que sai exatamente do centro desta pasta até o centro da próxima */}
              {index < experiences.length - 1 && (
                <div className="hidden md:block absolute top-[40%] left-[50%] w-full border-t-[4px] border-dashed border-black dark:border-zinc-400 opacity-40 -z-10"></div>
              )}

              {/* CARD DE DETALHES AO CLICAR */}
              {activeFolder === exp.id && (
                <div 
                  className="absolute bottom-[105%] left-1/2 -translate-x-1/2 w-[85vw] max-w-[320px] md:max-w-[420px] bg-white dark:bg-zinc-800 border-[3px] border-black p-4 md:p-6 shadow-[6px_6px_0px_#DE1B1B] md:shadow-[8px_8px_0px_#DE1B1B] z-50 cursor-default animate-in fade-in zoom-in duration-200"
                  onClick={(e) => e.stopPropagation()} 
                >
                  <div className="flex justify-between items-start border-b-[3px] border-black pb-2 mb-3 md:mb-4">
                    <div className="pr-2">
                      <h4 className="font-black text-[#DE1B1B] text-sm md:text-lg uppercase leading-tight">{exp.role}</h4>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs md:text-base mt-1">{exp.company}</p>
                    </div>
                    <button 
                      onClick={() => setActiveFolder(null)} 
                      className="text-black dark:text-white hover:text-[#DE1B1B] hover:scale-110 font-black text-xl md:text-2xl px-2 transition-transform"
                    >
                      X
                    </button>
                  </div>
                  
                  <p className="font-mono text-[10px] md:text-sm mb-3 md:mb-4 font-bold bg-zinc-200 dark:bg-zinc-800 inline-block px-2 py-1">{exp.period}</p>
                  
                  <ul className="space-y-2 md:space-y-3 font-mono text-[11px] md:text-sm text-zinc-700 dark:text-zinc-300 max-h-40 md:max-h-56 overflow-y-auto pr-2 hide-scroll">
                    {exp.description.split('\n').filter(line => line.trim() !== '').map((desc, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#DE1B1B] font-black">{'>'}</span>
                        <span className="leading-tight">{desc}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Setinha apontando para baixo */}
                  <div className="absolute -bottom-[14px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-black"></div>
                  <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-white dark:border-t-zinc-800"></div>
                </div>
              )}

              {/* IMAGEM DA PASTA E TEXTO */}
              <div 
                className="relative flex flex-col items-center transition-transform duration-300 hover:-translate-y-3"
                onClick={() => setActiveFolder(activeFolder === exp.id ? null : exp.id)}
              >
                <img 
                  src={pastaImg} 
                  alt="Pasta do projeto" 
                  draggable="false"
                  className="w-28 sm:w-36 md:w-44 object-contain drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] md:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]" 
                  style={{ imageRendering: 'pixelated' }} 
                />
                
                <div className="mt-3 md:mt-4 bg-[#FEF08A] dark:bg-zinc-800 border-2 border-black px-2 py-1 md:px-3 md:py-2 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#DE1B1B] text-center min-w-[150px] md:min-w-[180px]">
                  <span 
                    className="text-[9px] sm:text-[11px] md:text-xs uppercase text-black dark:text-white leading-tight font-bold"
                    style={{ fontFamily: "'Silkscreen', monospace" }}
                  >
                    {exp.role} <br />
                    <span className="text-[#DE1B1B]">{exp.company}</span>
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}