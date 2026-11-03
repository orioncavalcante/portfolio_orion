import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const [abaAtiva, setAbaAtiva] = useState('sobre');
    const [textoSobre, setTextoSobre] = useState('');
    const [stacks, setStacks] = useState('');
    const [mensagens, setMensagens] = useState([]);
    const [salvando, setSalvando] = useState(false);
    const navigate = useNavigate();

    const carregarMensagens = async () => {
        // 1. Pega mensagens salvas localmente (fallback / garantia imediata)
        let locais = [];
        try {
            locais = JSON.parse(localStorage.getItem('mensagens_portfolio') || '[]');
        } catch (e) {
            console.warn(e);
        }

        // 2. Busca todas do Supabase sem .order('data_envio') fixo (pois no Supabase o padrão costuma ser 'created_at')
        const { data: dadosMensagens, error } = await supabase.from('mensagens').select('*');
        if (error) {
            console.warn('Aviso ao buscar mensagens do Supabase:', error.message);
        }

        const doBanco = dadosMensagens || [];

        // 3. Mescla as mensagens do Supabase com as locais (evitando duplicadas de mesmo nome + email + mensagem)
        const mapaRespondidas = JSON.parse(localStorage.getItem('mensagens_respondidas') || '{}');
        const combinadas = [...doBanco];

        for (const msgLocal of locais) {
            const jaExisteNoBanco = combinadas.some(
                (m) =>
                    m.nome === msgLocal.nome &&
                    m.email === msgLocal.email &&
                    m.mensagem === msgLocal.mensagem
            );
            if (!jaExisteNoBanco) {
                combinadas.push(msgLocal);
            }
        }

        // Normaliza data e status de respondida, e ordena da mais recente para a mais antiga
        const formatadas = combinadas
            .map((m) => ({
                ...m,
                respondida: m.respondida ?? mapaRespondidas[m.id] ?? false,
                dataFormatada: m.data_envio || m.created_at || new Date().toISOString(),
            }))
            .sort((a, b) => new Date(b.dataFormatada) - new Date(a.dataFormatada));

        setMensagens(formatadas);
    };

    useEffect(() => {
        async function carregarDados() {
            // 1. Carrega o Sobre e Stacks
            const { data: dadosSobre } = await supabase.from('sobre').select('texto, stacks').eq('id', 1).single();
            if (dadosSobre) {
                setTextoSobre(dadosSobre.texto || '');
                setStacks(dadosSobre.stacks || '');
            }

            // 2. Carrega as Mensagens
            await carregarMensagens();
        }
        carregarDados();
    }, []);

    // Recarrega mensagens sempre que abrir a aba de mensagens
    useEffect(() => {
        if (abaAtiva === 'mensagens') {
            carregarMensagens();
        }
    }, [abaAtiva]);

    const alternarRespondida = async (msg) => {
        const novoStatus = !msg.respondida;

        // Atualiza na tela imediatamente
        setMensagens((prev) =>
            prev.map((item) => (item.id === msg.id ? { ...item, respondida: novoStatus } : item))
        );

        // Salva no localStorage
        try {
            const mapaRespondidas = JSON.parse(localStorage.getItem('mensagens_respondidas') || '{}');
            mapaRespondidas[msg.id] = novoStatus;
            localStorage.setItem('mensagens_respondidas', JSON.stringify(mapaRespondidas));

            const locais = JSON.parse(localStorage.getItem('mensagens_portfolio') || '[]');
            const locaisAtualizadas = locais.map((item) =>
                item.id === msg.id ? { ...item, respondida: novoStatus } : item
            );
            localStorage.setItem('mensagens_portfolio', JSON.stringify(locaisAtualizadas));
        } catch (e) {
            console.warn(e);
        }

        // Tenta atualizar no Supabase também (caso a coluna 'respondida' exista lá)
        await supabase.from('mensagens').update({ respondida: novoStatus }).eq('id', msg.id);
    };

    const salvarSobre = async () => {
        setSalvando(true);
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
            {/* SIDEBAR LATERAL */}
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
                
                {/* Aba: Sobre Mim */}
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

                {/* Aba: Mensagens Recebidas */}
                {abaAtiva === 'mensagens' && (
                    <div className="max-w-4xl">
                        <h3 className="text-3xl font-black mb-6 uppercase border-b-4 border-[#DE1B1B] pb-2 inline-block">Caixa de Entrada</h3>
                        
                        {mensagens.length === 0 ? (
                            <p className="font-bold p-6 border-4 border-black bg-white dark:bg-zinc-800 text-center">
                                Nenhuma mensagem recebida ainda.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {mensagens.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`p-6 border-4 border-black transition-opacity ${
                                            msg.respondida
                                                ? 'bg-zinc-100 dark:bg-zinc-800/60 opacity-75'
                                                : 'bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#FEF08A]'
                                        }`}
                                    >
                                        <div className="flex flex-wrap justify-between items-start gap-2 mb-4 border-b-2 border-zinc-200 dark:border-zinc-700 pb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-lg uppercase text-[#DE1B1B]">{msg.nome}</h4>
                                                    {msg.respondida && (
                                                        <span className="text-[10px] font-black uppercase bg-green-600 text-white px-2 py-0.5 border border-black">
                                                            RESPONDIDA
                                                        </span>
                                                    )}
                                                </div>
                                                <a href={`mailto:${msg.email}`} className="text-sm font-bold opacity-80 hover:underline">{msg.email}</a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold bg-[#FEF08A] text-black px-2 py-1 border-2 border-black">
                                                    {new Date(msg.dataFormatada).toLocaleDateString('pt-BR')}
                                                </span>
                                                <button
                                                    onClick={() => alternarRespondida(msg)}
                                                    className={`text-xs font-black uppercase px-3 py-1 border-2 border-black cursor-pointer transition-colors ${
                                                        msg.respondida
                                                            ? 'bg-zinc-300 text-black hover:bg-zinc-400'
                                                            : 'bg-green-500 text-black hover:bg-green-600 shadow-[2px_2px_0px_#000]'
                                                    }`}
                                                >
                                                    {msg.respondida ? 'Desmarcar' : 'Marcar como respondida'}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="whitespace-pre-wrap">{msg.mensagem}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Módulos em construção */}
                {(abaAtiva === 'experiencias' || abaAtiva === 'projetos') && (
                    <div>
                        <h3 className="text-3xl font-black mb-6 uppercase border-b-4 border-[#DE1B1B] pb-2 inline-block">{abaAtiva}</h3>
                        <p className="font-bold">Módulo em construção para o próximo passo!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
