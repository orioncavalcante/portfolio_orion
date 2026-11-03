import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DitherReveal from '../ui/DitherReveal';

// Busca automática de fallback na pasta assets local
const assetFiles = import.meta.glob('../../assets/**/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });

function getAsset(keyword) {
    if (!keyword) return '';
    const foundKey = Object.keys(assetFiles).find((path) =>
        path.toLowerCase().includes(keyword.toLowerCase())
    );
    return foundKey ? assetFiles[foundKey] : ''; 
}

export function Projects() {
    const [projetos, setProjetos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function buscarProjetos() {
            setCarregando(true);
            const { data, error } = await supabase
                .from('projetos')
                .select('*')
                .eq('destaque', true)
                .order('ordem', { ascending: true });

            if (data) setProjetos(data);
            if (error) console.error("Erro ao buscar projetos:", error);
            setCarregando(false);
        }
        
        buscarProjetos();
    }, []);

    // Função para descobrir a URL correta da imagem (Supabase Storage ou Pasta Local)
    const obterImagemProjeto = (projeto) => {
        if (projeto.imagem_url) {
            return projeto.imagem_url; // Se foi enviada pelo painel admin, usa o link do Supabase
        }
        return getAsset(projeto.nome); // Senão, tenta buscar na pasta local assets
    };

    return (
        <section id="projetos" className="py-24 px-6 max-w-[1200px] mx-auto min-h-screen dark:bg-zinc-800 transition-colors duration-300 flex flex-col justify-center">
            
            <div className="mb-16">
                <h2 
                    className="text-[12vw] md:text-[80px] font-black text-[#DE1B1B] uppercase leading-[0.8] tracking-tighter"
                    style={{ fontFamily: "'Archivo Black', sans-serif" }}
                >
                    PROJETOS
                </h2>
                <p className="text-[#DE1B1B] font-bold text-sm md:text-base mt-2 tracking-widest uppercase">
                    O que já construí
                </p>
            </div>

            {carregando && (
                <div className="text-center font-mono font-bold text-lg animate-pulse">
                    CARREGANDO ARQUIVOS...
                </div>
            )}

            {!carregando && projetos.length === 0 && (
                <div className="text-center font-mono text-zinc-500">
                    Nenhum projeto em destaque encontrado.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {!carregando && projetos.map((projeto) => (
                    <div 
                        key={projeto.id}
                        className="group flex flex-col w-full bg-[#EAE8DD] dark:bg-zinc-800 border-4 border-black p-4 md:p-6 shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[12px_12px_0px_#000] transition-all duration-300"
                    >
                        <div className="w-full h-48 sm:h-64 md:h-72 border-4 border-black overflow-hidden mb-6 bg-zinc-200 relative">
                            <DitherReveal image={obterImagemProjeto(projeto)} />
                        </div>

                        <h3 className="text-center text-[#DE1B1B] font-black text-xl md:text-2xl uppercase mb-3">
                            {projeto.nome.replace(/[-_]/g, ' ')}
                        </h3>

                        <p className="text-center font-bold font-mono text-xs md:text-sm text-black dark:text-white leading-relaxed px-2 mb-8 flex-grow">
                            {projeto.descricao}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                            <a 
                                href={projeto.link_github} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 text-center font-black font-mono text-xs py-3 shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
                            >
                                VER CÓDIGO
                            </a>
                            
                            {projeto.link_hospedado && (
                                <a 
                                    href={projeto.link_hospedado} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-[#DE1B1B] text-white border-2 border-black text-center font-black font-mono text-xs py-3 shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
                                >
                                    VER PROJETO
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}