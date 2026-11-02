// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const [abaAtiva, setAbaAtiva] = useState('sobre');
    const [textoSobre, setTextoSobre] = useState('');
    const [stacks, setStacks] = useState(''); // Novo estado para as stacks
    const [salvando, setSalvando] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function carregarSobre() {
            // Agora buscamos texto E stacks
            const { data, error } = await supabase.from('sobre').select('texto, stacks').eq('id', 1).single();
            if (data) {
                setTextoSobre(data.texto || '');
                setStacks(data.stacks || '');
            }
            if (error) console.error("Erro ao carregar:", error);
        }
        carregarSobre();
    }, []);

    const salvarSobre = async () => {
        setSalvando(true);
        // Agora salva texto E stacks
        const { error } = await supabase.from('sobre').update({ texto: textoSobre, stacks: stacks }).eq('id', 1);
        setSalvando(false);
        
        if (!error) {
            alert('Dados atualizados com sucesso!');
        } else {
            alert('Erro ao salvar. Verifique o console.');
            console.error(error);
        }
    };

    const sair = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const menu = [
        { id: 'sobre', label: 'Sobre Mim' },
        { id: 'mensagens', label: 'Mensagens Recebidas' },
        { id: 'experiencias', label: 'Experiências' },
        { id: 'projetos', label: 'Projetos em Destaque' }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-900 flex flex-col md:flex-row font-mono transition-colors">
            {/* SIDEBAR LATERAL (Mantida igual) */}
            <aside className="w-full md:w-72 bg-[#FEF08A] dark:bg-zinc-800 border-b-4 md:border-b-0 md:border-r-4 border-black p-6 flex flex-col shrink-0">
                <h2 className="text-2xl font-black text-[#DE1B1B] mb-8 uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                    Painel Admin
                </h2>
                
                <nav className="flex-1 flex flex-col gap-2">
                    {menu.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setAbaAtiva(item.id)}
                            className={`text-left font-bold p-3 border-2 border-black transition-all ${
                                abaAtiva === item.id 
                                ? 'bg-[#DE1B1B] text-white shadow-[4px_4px_0px_#000] translate-x-[-2px] translate-y-[-2px]' 
                                : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <button 
                    onClick={sair}
                    className="mt-8 bg-black text-white font-bold p-3 border-2 border-black hover:bg-zinc-700 transition-colors"
                >
                    SAIR DA CONTA
                </button>
            </aside>

            {/* ÁREA DE CONTEÚDO PRINCIPAL */}
            <main className="flex-1 p-8 text-black dark:text-white overflow-y-auto">
                
                {abaAtiva === 'sobre' && (
                    <div className="max-w-3xl">
                        <h3 className="text-3xl font-black mb-6 uppercase border-b-4 border-[#DE1B1B] pb-2 inline-block">Editar Sobre Mim</h3>
                        
                        <div className="mb-6">
                            <label className="block font-black uppercase mb-2">Texto de Apresentação</label>
                            <textarea
                                value={textoSobre}
                                onChange={(e) => setTextoSobre(e.target.value)}
                                rows={8}
                                className="w-full bg-white dark:bg-zinc-800 border-4 border-black p-4 focus:outline-none focus:border-[#DE1B1B] resize-y shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#FEF08A] text-black dark:text-white"
                            />
                        </div>

                        <div className="mb-8">
                            <label className="block font-black uppercase mb-2">Principais Stacks (Separadas por vírgula)</label>
                            <textarea
                                value={stacks}
                                onChange={(e) => setStacks(e.target.value)}
                                rows={3}
                                placeholder="Ex: Python, React, JavaScript"
                                className="w-full bg-white dark:bg-zinc-800 border-4 border-black p-4 focus:outline-none focus:border-[#DE1B1B] resize-y shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#FEF08A] text-black dark:text-white"
                            />
                        </div>
                        
                        <button
                            onClick={salvarSobre}
                            disabled={salvando}
                            className="bg-[#DE1B1B] text-white font-black text-lg py-3 px-8 border-4 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[0px_0px_0px_#000] transition-all disabled:opacity-50"
                        >
                            {salvando ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                        </button>
                    </div>
                )}

                {abaAtiva !== 'sobre' && (
                    <div>
                        <h3 className="text-3xl font-black mb-6 uppercase border-b-4 border-[#DE1B1B] pb-2 inline-block">{abaAtiva}</h3>
                        <p className="font-bold">Módulo em construção para o próximo passo!</p>
                    </div>
                )}
            </main>
        </div>
    );
}