import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const [abaAtiva, setAbaAtiva] = useState('sobre');
    const [textoSobre, setTextoSobre] = useState('');
    const [stacks, setStacks] = useState('');
    const [mensagens, setMensagens] = useState([]);
    
    // Estados para Experiências
    const [experiencias, setExperiencias] = useState([]);
    const [editandoExp, setEditandoExp] = useState(null);
    const [mostrarFormExp, setMostrarFormExp] = useState(false);
    const [formExp, setFormExp] = useState({ role: '', company: '', period: '', description: '', position_classes: '' });
    
    const [salvando, setSalvando] = useState(false);
    const navigate = useNavigate();

    const carregarMensagens = async () => {
        let locais = [];
        try { locais = JSON.parse(localStorage.getItem('mensagens_portfolio') || '[]'); } catch (e) {}
        const { data: dadosMensagens } = await supabase.from('mensagens').select('*');
        const doBanco = dadosMensagens || [];
        const mapaRespondidas = JSON.parse(localStorage.getItem('mensagens_respondidas') || '{}');
        const combinadas = [...doBanco];

        for (const msgLocal of locais) {
            const jaExisteNoBanco = combinadas.some(
                (m) => m.nome === msgLocal.nome && m.email === msgLocal.email && m.mensagem === msgLocal.mensagem
            );
            if (!jaExisteNoBanco) combinadas.push(msgLocal);
        }

        const formatadas = combinadas
            .map((m) => ({
                ...m,
                respondida: m.respondida ?? mapaRespondidas[m.id] ?? false,
                dataFormatada: m.data_envio || m.created_at || new Date().toISOString(),
            }))
            .sort((a, b) => new Date(b.dataFormatada) - new Date(a.dataFormatada));

        setMensagens(formatadas);
    };

    const carregarExperiencias = async () => {
        const { data } = await supabase.from('experiencias').select('*').order('ordem', { ascending: true });
        if (data) setExperiencias(data);
    };

    useEffect(() => {
        async function carregarDados() {
            const { data: dadosSobre } = await supabase.from('sobre').select('texto, stacks').eq('id', 1).single();
            if (dadosSobre) {
                setTextoSobre(dadosSobre.texto || '');
                setStacks(dadosSobre.stacks || '');
            }
            await carregarMensagens();
            await carregarExperiencias();
        }
        carregarDados();
    }, []);

    useEffect(() => {
        if (abaAtiva === 'mensagens') carregarMensagens();
        if (abaAtiva === 'experiencias') carregarExperiencias();
    }, [abaAtiva]);

    const alternarRespondida = async (msg) => {
        const novoStatus = !msg.respondida;
        setMensagens((prev) => prev.map((item) => (item.id === msg.id ? { ...item, respondida: novoStatus } : item)));
        try {
            const mapaRespondidas = JSON.parse(localStorage.getItem('mensagens_respondidas') || '{}');
            mapaRespondidas[msg.id] = novoStatus;
            localStorage.setItem('mensagens_respondidas', JSON.stringify(mapaRespondidas));
        } catch (e) {}
        await supabase.from('mensagens').update({ respondida: novoStatus }).eq('id', msg.id);
    };

    const salvarSobre = async () => {
        setSalvando(true);
        const { error } = await supabase.from('sobre').update({ texto: textoSobre, stacks: stacks }).eq('id', 1);
        setSalvando(false);
        if (!error) alert('Dados atualizados com sucesso!');
    };

    // --- FUNÇÕES DE EXPERIÊNCIA ATUALIZADAS ---
    const salvarExperiencia = async (e) => {
        e.preventDefault();
        setSalvando(true);
        
        let erroSupabase = null;

        try {
            if (editandoExp) {
                const { error } = await supabase.from('experiencias').update(formExp).eq('id', editandoExp);
                erroSupabase = error;
            } else {
                const novaOrdem = experiencias.length > 0 ? Math.max(...experiencias.map(e => e.ordem || 0)) + 1 : 1;
                const { error } = await supabase.from('experiencias').insert([{ ...formExp, ordem: novaOrdem }]);
                erroSupabase = error;
            }

            if (erroSupabase) {
                console.error("Erro do Supabase:", erroSupabase);
                alert("Erro ao gravar: " + erroSupabase.message);
            } else {
                alert("Experiência guardada com sucesso!");
                setEditandoExp(null);
                setMostrarFormExp(false);
                setFormExp({ role: '', company: '', period: '', description: '', position_classes: '' });
                await carregarExperiencias();
            }
        } catch (err) {
            console.error(err);
            alert("Ocorreu um erro inesperado no código.");
        }
        
        setSalvando(false);
    };

    const deletarExperiencia = async (id) => {
        if (!window.confirm('Tem a certeza que deseja apagar esta experiência?')) return;
        await supabase.from('experiencias').delete().eq('id', id);
        await carregarExperiencias();
    };

    const reordenarExperiencia = async (index, direcao) => {
        if ((direcao === -1 && index === 0) || (direcao === 1 && index === experiencias.length - 1)) return;
        const novasExp = [...experiencias];
        const atual = novasExp[index];
        const trocarCom = novasExp[index + direcao];
        
        atual.ordem += direcao;
        trocarCom.ordem -= direcao;
        
        novasExp[index] = trocarCom;
        novasExp[index + direcao] = atual;
        setExperiencias(novasExp);

        await supabase.from('experiencias').update({ ordem: atual.ordem }).eq('id', atual.id);
        await supabase.from('experiencias').update({ ordem: trocarCom.ordem }).eq('id', trocarCom.id);
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

    const inputClass = "w-full bg-white dark:bg-zinc-800 border-4 border-black p-3 focus:outline-none focus:border-[#DE1B1B] shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#FEF08A] text-black dark:text-white";

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-900 flex flex-col md:flex-row font-mono transition-colors">
            <aside className="w-full md:w-72 bg-[#FEF08A] dark:bg-zinc-800 border-b-4 md:border-b-0 md:border-r-4 border-black p-6 flex flex-col shrink-0">
                <h2 className="text-2xl font-black text-[#DE1B1B] mb-8 uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Painel Admin</h2>
                <nav className="flex-1 flex flex-col gap-2">
                    {menu.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { 
                                setAbaAtiva(item.id); 
                                setEditandoExp(null); 
                                setMostrarFormExp(false);
                            }}
                            className={`text-left font-bold p-3 border-2 border-black transition-all ${
                                abaAtiva === item.id ? 'bg-[#DE1B1B] text-white shadow-[4px_4px_0px_#000] translate-x-[-2px] translate-y-[-2px]' : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
                <button onClick={sair} className="mt-8 bg-black text-white font-bold p-3 border-2 border-black hover:bg-zinc-700 transition-colors">SAIR DA CONTA</button>
            </aside>

            <main className="flex-1 p-8 text-black dark:text-white overflow-y-auto">
                {abaAtiva === 'sobre' && (
                    <div className="max-w-3xl">
                        <h3 className="text-3xl font-black mb-6 uppercase border-b-4 border-[#DE1B1B] pb-2 inline-block">Editar Sobre Mim</h3>
                        <div className="mb-6">
                            <label className="block font-black uppercase mb-2">Texto de Apresentação</label>
                            <textarea value={textoSobre} onChange={(e) => setTextoSobre(e.target.value)} rows={8} className={inputClass} />
                        </div>
                        <div className="mb-8">
                            <label className="block font-black uppercase mb-2">Principais Stacks (Separadas por vírgula)</label>
                            <textarea value={stacks} onChange={(e) => setStacks(e.target.value)} rows={3} className={inputClass} />
                        </div>
                        <button onClick={salvarSobre} disabled={salvando} className="bg-[#DE1B1B] text-white font-black py-3 px-8 border-4 border-black shadow-[4px_4px_0px_#000]">
                            {salvando ? 'A GRAVAR...' : 'SALVAR ALTERAÇÕES'}
                        </button>
                    </div>
                )}

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

                {abaAtiva === 'experiencias' && (
                    <div className="max-w-4xl">
                        <h3 className="text-3xl font-black mb-6 uppercase border-b-4 border-[#DE1B1B] pb-2 inline-block">Gerenciar Experiências</h3>
                        
                        {!mostrarFormExp ? (
                            <>
                                <button 
                                    onClick={() => {
                                        setFormExp({ role: '', company: '', period: '', description: '', position_classes: 'md:left-[10%] md:bottom-[10%]' });
                                        setMostrarFormExp(true);
                                    }} 
                                    className="mb-8 bg-green-500 text-black font-black py-3 px-6 border-4 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-1"
                                >
                                    + ADICIONAR EXPERIÊNCIA
                                </button>

                                <div className="flex flex-col gap-4">
                                    {experiencias.map((exp, index) => (
                                        <div key={exp.id} className="flex flex-col md:flex-row justify-between md:items-center bg-white dark:bg-zinc-800 border-4 border-black p-4 shadow-[4px_4px_0px_#000] gap-4">
                                            <div>
                                                <h4 className="font-black text-lg text-[#DE1B1B]">{exp.role}</h4>
                                                <p className="font-bold">{exp.company}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button onClick={() => reordenarExperiencia(index, -1)} className="p-2 border-2 border-black bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300">↑</button>
                                                <button onClick={() => reordenarExperiencia(index, 1)} className="p-2 border-2 border-black bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300">↓</button>
                                                <button 
                                                    onClick={() => { 
                                                        setEditandoExp(exp.id); 
                                                        setFormExp(exp); 
                                                        setMostrarFormExp(true);
                                                    }} 
                                                    className="p-2 border-2 border-black bg-[#FEF08A] text-black font-bold uppercase"
                                                >
                                                    Editar
                                                </button>
                                                <button onClick={() => deletarExperiencia(exp.id)} className="p-2 border-2 border-black bg-red-500 text-white font-bold uppercase">Apagar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <form onSubmit={salvarExperiencia} className="bg-white dark:bg-zinc-800 border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
                                <h4 className="font-black text-xl mb-6">{editandoExp ? 'EDITAR EXPERIÊNCIA' : 'NOVA EXPERIÊNCIA'}</h4>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div><label className="block font-black mb-1">Cargo</label><input required value={formExp.role} onChange={(e) => setFormExp({...formExp, role: e.target.value})} className={inputClass} placeholder="Ex: DESENVOLVEDOR" /></div>
                                    <div><label className="block font-black mb-1">Empresa</label><input required value={formExp.company} onChange={(e) => setFormExp({...formExp, company: e.target.value})} className={inputClass} placeholder="Ex: OVERBANK" /></div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div><label className="block font-black mb-1">Período</label><input required value={formExp.period} onChange={(e) => setFormExp({...formExp, period: e.target.value})} className={inputClass} placeholder="Ex: out. 2026 - o momento" /></div>
                                    <div>
                                        <label className="block font-black mb-1">Posição na Tela (Tailwind)</label>
                                        <input required value={formExp.position_classes} onChange={(e) => setFormExp({...formExp, position_classes: e.target.value})} className={inputClass} placeholder="Ex: md:left-[18%] md:bottom-[15%]" />
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block font-black mb-1">Descrição (Cada linha vira um tópico no card)</label>
                                    <textarea required rows={5} value={formExp.description} onChange={(e) => setFormExp({...formExp, description: e.target.value})} className={inputClass} placeholder="Linha 1...&#10;Linha 2..." />
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <button type="submit" disabled={salvando} className="bg-[#DE1B1B] text-white font-black py-3 px-8 border-4 border-black">{salvando ? 'A GRAVAR...' : 'SALVAR'}</button>
                                    <button type="button" onClick={() => { setEditandoExp(null); setMostrarFormExp(false); setFormExp({ role: '', company: '', period: '', description: '', position_classes: '' }); }} className="bg-zinc-300 text-black font-black py-3 px-8 border-4 border-black">CANCELAR</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {abaAtiva === 'projetos' && (
                    <div>
                        <h3 className="text-3xl font-black mb-6 uppercase border-b-4 border-[#DE1B1B] pb-2 inline-block">{abaAtiva}</h3>
                        <p className="font-bold">Módulo em construção para o próximo passo!</p>
                    </div>
                )}
            </main>
        </div>
    );
}