import { useState, useEffect } from 'react';
import DitherReveal from '../ui/DitherReveal';

// Busca automática das imagens na pasta assets
const assetFiles = import.meta.glob('../../assets/**/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });

function getAsset(keyword) {
    const foundKey = Object.keys(assetFiles).find((path) =>
        path.toLowerCase().includes(keyword.toLowerCase())
    );
    return foundKey ? assetFiles[foundKey] : ''; 
}

export function Projects() {
    const [projetos, setProjetos] = useState([]);
    const [carregando, setCarregando] = useState(false);

    // ==========================================
    // 1. CONFIGURAÇÃO DOS PROJETOS
    // ==========================================
    const githubUsername = 'orioncavalcante';
    
    const reposSelecionados = [
        {
            nome: 'projeto_audiovisual', 
            descricao: 'Mistérios de Tainã — Desenvolvimento de um site para um projeto audiovisual realizado por um grupo de estudantes do curso de Audiovisual do Senac. Fui responsável pelo desenvolvimento da plataforma, criando uma interface web para apresentar e complementar a experiência do projeto.',
            linkHospedado: 'https://osmisteriosdetaina.netlify.app/' 
        },
        {
            nome: 'json_to_xlsx',
            descricao: 'Uma ferramenta simples, rápida e poderosa para converter arquivos JSON em Excel (.xlsx) diretamente no navegador. Não precisa instalar nada. Basta abrir a página, arrastar o arquivo ou selecionar, e o Excel é baixado automaticamente.',
            linkHospedado: 'https://orioncavalcante.github.io/json_to_xlsx/' 
        }
    ];

    // ==========================================
    // 2. BUSCA NA API COM FALLBACK DE SEGURANÇA
    // ==========================================
    useEffect(() => {
        async function buscarProjetos() {
            setCarregando(true);
            
            const promessas = reposSelecionados.map(async (repoConfig) => {
                try {
                    const resposta = await fetch(`https://api.github.com/repos/${githubUsername}/${repoConfig.nome}`);
                    
                    if (!resposta.ok) {
                        throw new Error(`Erro ${resposta.status}: Repositório '${repoConfig.nome}' não encontrado no GitHub.`);
                    }
                    
                    const dados = await resposta.json();
                    
                    return {
                        ...dados,
                        descricaoCustomizada: repoConfig.descricao,
                        linkHospedado: repoConfig.linkHospedado
                    };
                } catch(erro) {
                    // O console.warn avisa você do erro, mas o código não quebra a tela!
                    console.warn(erro.message);
                    
                    // FALLBACK: Cria um objeto de projeto "falso" usando os dados que você digitou lá em cima
                    return {
                        id: Math.random().toString(), // ID aleatório só para o React não reclamar no loop
                        name: repoConfig.nome,
                        html_url: `https://github.com/${githubUsername}/${repoConfig.nome}`,
                        description: repoConfig.descricao,
                        descricaoCustomizada: repoConfig.descricao,
                        linkHospedado: repoConfig.linkHospedado
                    };
                }
            });
            
            // Espera todos terminarem, seja com sucesso (API) ou usando Fallback (catch)
            const dados = await Promise.all(promessas);
            setProjetos(dados);
            setCarregando(false);
        }
        
        buscarProjetos();
    }, []);

    // ==========================================
    // 3. LAYOUT DA TELA
    // ==========================================
    return (
        <section id="projetos" className="py-24 px-6 max-w-[1200px] mx-auto min-h-screen dark:bg-zinc-900 transition-colors duration-300 flex flex-col justify-center">
            
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
                    Nenhum projeto encontrado.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {!carregando && projetos.map((projeto) => (
                    <div 
                        key={projeto.id}
                        className="group flex flex-col w-full bg-[#EAE8DD] dark:bg-zinc-800 border-4 border-black p-4 md:p-6 shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[12px_12px_0px_#000] transition-all duration-300"
                    >
                        
                        {/* AQUI ESTÁ O EFEITO WEBGL DO DITHER REVEAL */}
                        {/* Removemos o grayscale do Tailwind porque o shader WebGL já cuida do preto e branco */}
                        <div className="w-full h-48 sm:h-64 md:h-72 border-4 border-black overflow-hidden mb-6 bg-zinc-200 relative">
                            <DitherReveal image={getAsset(projeto.name)} />
                        </div>

                        <h3 className="text-center text-[#DE1B1B] font-black text-xl md:text-2xl uppercase mb-3">
                            {projeto.name.replace(/[-_]/g, ' ')}
                        </h3>

                        <p className="text-center font-bold font-mono text-xs md:text-sm text-black dark:text-white leading-relaxed px-2 mb-8 flex-grow">
                            {projeto.descricaoCustomizada || projeto.description || 'Sem descrição.'}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                            <a 
                                href={projeto.html_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-zinc-700 text-center font-black font-mono text-xs py-3 shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
                            >
                                VER CÓDIGO
                            </a>
                            
                            {projeto.linkHospedado && (
                                <a 
                                    href={projeto.linkHospedado} 
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