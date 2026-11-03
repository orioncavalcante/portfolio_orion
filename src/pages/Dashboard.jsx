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

    // Estados para Projetos
    const [projetos, setProjetos] = useState([]);
    const [editandoProj, setEditandoProj] = useState(null);
    const [mostrarFormProj, setMostrarFormProj] = useState(false);
    const [formProj, setFormProj] = useState({ nome: '', descricao: '', link_hospedado: '', link_github: '', destaque: true, imagem_url: '' });
    const [arquivoImagem, setArquivoImagem] = useState(null); // Estado para o arquivo selecionado
    
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

    const carregarProjetos = async () => {
        const { data } = await supabase.from('projetos').select('*').order('ordem', { ascending: true });
        if (data) setProjetos(data);
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
            await carregarProjetos();
        }
        carregarDados();
    }, []);

    useEffect(() => {
        if (abaAtiva === 'mensagens') carregarMensagens();
        if (abaAtiva === 'experiencias') carregarExperiencias();
        if (abaAtiva === 'projetos') carregarProjetos();
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

    // --- FUNÇÕES DE EXPERIÊNCIA ---
    const salvarExperiencia = async (e) => {
        e.preventDefault();
        setSalvando(true);
        let erroSupabase = null;

        if (editandoExp) {
            const { error } = await supabase.from('experiencias').update(formExp).eq('id', editandoExp);
            erroSupabase = error;
        } else {
            const novaOrdem = experiencias.length > 0 ? Math.max(...experiencias.map(e => e.ordem || 0)) + 1 : 1;
            const { error } = await supabase.from('experiencias').insert([{ ...formExp, ordem: novaOrdem }]);
            erroSupabase = error;
        }

        if (erroSupabase) {
            alert("Erro ao gravar: " + erroSupabase.message);
        } else {
            alert("Experiência guardada com sucesso!");
            setEditandoExp(null);
            setMostrarFormExp(false);
            setFormExp({ role: '', company: '', period: '', description: '', position_classes: '' });
            await carregarExperiencias();
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

    // --- FUNÇÕES DE PROJETOS COM UPLOAD DE IMAGEM ---
    const salvarProjeto = async (e) => {
        e.preventDefault();
        setSalvando(true);
        let imagemUrlFinal = formProj.imagem_url;

        // Se o usuário selecionou um arquivo de imagem novo, faz o upload para o Supabase Storage
        if (arquivoImagem) {
            const nomeArquivo = `${Date.now()}-${arquivoImagem.name.replace(/\s+/g, '_')}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('projetos')
                .upload(nomeArquivo, arquivoImagem);

            if (uploadError) {
                alert("Erro ao enviar imagem: " + uploadError.message);
                setSalvando(false);
                return;
            }

            // Pega a URL pública da imagem recém enviada
            const { data: publicUrlData } = supabase.storage
                .from('projetos')
                .getPublicUrl(uploadData.path);

            imagemUrlFinal = publicUrlData.publicUrl;
        }

        const dadosParaSalvar = {
            ...formProj,
            imagem_url: imagemUrlFinal
        };

        let erroSupabase = null;

        if (editandoProj) {
            const { error } = await supabase.from('projetos').update(dadosParaSalvar).eq('id', editandoProj);
            erroSupabase = error;
        } else {
            const novaOrdem = projetos.length > 0 ? Math.max(...projetos.map(p => p.ordem || 0)) + 1 : 1;
            const { error } = await supabase.from('projetos').insert([{ ...dadosParaSalvar, ordem: novaOrdem }]);
            erroSupabase = error;
        }

        if (erroSupabase) {
            alert("Erro ao gravar projeto: " + erroSupabase.message);
        } else {
            alert("Projeto guardado com sucesso!");
            setEditandoProj(null);
            setMostrarFormProj(false);
            setArquivoImagem(null);
            setFormProj({ nome: '', descricao: '', link_hospedado: '', link_github: '', destaque: true, imagem_url: '' });
            await carregarProjetos();
        }
        setSalvando(false);
    };

    const deletarProjeto = async (id) => {
        if (!window.confirm('Tem a certeza que deseja apagar este projeto?')) return;
        await supabase.from('projetos').delete().eq('id', id);
        await carregarProjetos();
    };

    const reordenarProjeto = async (index, direcao) => {
        if ((direcao === -1 && index === 0) || (direcao === 1 && index === projetos.length - 1)) return;
        const novosProj = [...projetos];
        const atual = novosProj[index];
        const trocarCom = novosProj[index + direcao];
        
        atual.ordem += direcao;
        trocarCom.ordem -= direcao;
        
        novosProj[index] = trocarCom;
        novosProj[index + direcao] = atual;
        setProjetos(novosProj);

        await supabase.from('projetos').update({ ordem: atual.ordem }).eq('id', atual.id);
        await supabase.from('projetos').update({ ordem: trocarCom.ordem }).eq('id', trocarCom.id);
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
                                setEditandoExp(null); setMostrarFormExp(false);
                                setEditandoProj(null); setMostrarFormProj(false);
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
                                                <button onClick={() => reordenarExperiencia(index, -1)} className="p-2 border-2 border-black bg-zinc-200 dark:bg-zinc-700">↑</button>
                                                <button onClick={() => reordenarExperiencia(index, 1)} className="p-2 border-2 border-black bg-zinc-200 dark:bg-zinc-700">↓</button>
                                                <button onClick={() => { setEditandoExp(exp.id); setFormExp(exp); setMostrarFormExp(true); }} className="p-2 border-2 border-black bg-[#FEF08A] text-black font-bold uppercase">Editar</button>
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
                                    <div><label className="block font-black mb-1">Cargo</label><input required value={formExp.role} onChange={(e) => setFormExp({...formExp, role: e.target.value})} className={inputClass} /></div>
                                    <div><label className="block font-black mb-1">Empresa</label><input required value={formExp.company} onChange={(e) => setFormExp({...formExp, company: e.target.value})} className={inputClass} /></div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div><label className="block font-black mb-1">Período</label><input required value={formExp.period} onChange={(e) => setFormExp({...formExp, period: e.target.value})} className={inputClass} /></div>
                                    <div><label className="block font-black mb-1">Posição na Tela</label><input required value={formExp.position_classes} onChange={(e) => setFormExp({...formExp, position_classes: e.target.value})} className={inputClass} /></div>
                                </div>
                                <div className="mb-6"><label className="block font-black mb-1">Descrição</label><textarea required rows={5} value={formExp.description} onChange={(e) => setFormExp({...formExp, description: e.target.value})} className={inputClass} /></div>
                                <div className="flex gap-4">
                                    <button type="submit" disabled={salvando} className="bg-[#DE1B1B] text-white font-black py-3 px-8 border-4 border-black">{salvando ? 'A GRAVAR...' : 'SALVAR'}</button>
                                    <button type="button" onClick={() => { setEditandoExp(null); setMostrarFormExp(false); }} className="bg-zinc-300 text-black font-black py-3 px-8 border-4 border-black">CANCELAR</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {abaAtiva === 'projetos' && (
                    <div className="max-w-4xl">
                        <h3 className="text-3xl font-black mb-6 uppercase border-b-4 border-[#DE1B1B] pb-2 inline-block">Gerenciar Projetos</h3>
                        
                        {!mostrarFormProj ? (
                            <>
                                <button 
                                    onClick={() => {
                                        setFormProj({ nome: '', descricao: '', link_hospedado: '', link_github: '', destaque: true, imagem_url: '' });
                                        setArquivoImagem(null);
                                        setMostrarFormProj(true);
                                    }} 
                                    className="mb-8 bg-green-500 text-black font-black py-3 px-6 border-4 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-1"
                                >
                                    + ADICIONAR PROJETO
                                </button>

                                <div className="flex flex-col gap-4">
                                    {projetos.map((proj, index) => (
                                        <div key={proj.id} className="flex flex-col md:flex-row justify-between md:items-center bg-white dark:bg-zinc-800 border-4 border-black p-4 shadow-[4px_4px_0px_#000] gap-4">
                                            <div className="flex items-center gap-4">
                                                {proj.imagem_url && (
                                                    <img src={proj.imagem_url} alt="" className="w-16 h-12 object-cover border-2 border-black shrink-0" />
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-lg text-[#DE1B1B] uppercase">{proj.nome.replace(/[-_]/g, ' ')}</h4>
                                                        {proj.destaque ? (
                                                            <span className="text-[10px] font-black bg-green-500 text-black px-2 py-0.5 border border-black uppercase">DESTAQUE HOME</span>
                                                        ) : (
                                                            <span className="text-[10px] font-black bg-zinc-300 text-zinc-700 px-2 py-0.5 border border-black uppercase">OCULTO DA HOME</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-mono opacity-80 mt-1 line-clamp-1">{proj.descricao}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button onClick={() => reordenarProjeto(index, -1)} className="p-2 border-2 border-black bg-zinc-200 dark:bg-zinc-700">↑</button>
                                                <button onClick={() => reordenarProjeto(index, 1)} className="p-2 border-2 border-black bg-zinc-200 dark:bg-zinc-700">↓</button>
                                                <button onClick={() => { setEditandoProj(proj.id); setFormProj(proj); setArquivoImagem(null); setMostrarFormProj(true); }} className="p-2 border-2 border-black bg-[#FEF08A] text-black font-bold uppercase">Editar</button>
                                                <button onClick={() => deletarProjeto(proj.id)} className="p-2 border-2 border-black bg-red-500 text-white font-bold uppercase">Apagar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <form onSubmit={salvarProjeto} className="bg-white dark:bg-zinc-800 border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
                                <h4 className="font-black text-xl mb-6">{editandoProj ? 'EDITAR PROJETO' : 'NOVO PROJETO'}</h4>
                                
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block font-black mb-1">Nome do Repositório</label>
                                        <input required value={formProj.nome} onChange={(e) => setFormProj({...formProj, nome: e.target.value})} className={inputClass} placeholder="Ex: meu_novo_projeto" />
                                    </div>
                                    <div>
                                        <label className="block font-black mb-1">Link do GitHub</label>
                                        <input required value={formProj.link_github} onChange={(e) => setFormProj({...formProj, link_github: e.target.value})} className={inputClass} placeholder="https://github.com/..." />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block font-black mb-1">Link Hospedado (Opcional)</label>
                                        <input value={formProj.link_hospedado} onChange={(e) => setFormProj({...formProj, link_hospedado: e.target.value})} className={inputClass} placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="block font-black mb-1">Subir Imagem de Capa (Print do Projeto)</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => setArquivoImagem(e.target.files[0])}
                                            className="w-full bg-white dark:bg-zinc-800 border-4 border-black p-2 text-sm cursor-pointer shadow-[4px_4px_0px_#000]" 
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center mb-4">
                                    <label className="flex items-center gap-3 cursor-pointer font-black">
                                        <input 
                                            type="checkbox" 
                                            checked={formProj.destaque} 
                                            onChange={(e) => setFormProj({...formProj, destaque: e.target.checked})}
                                            className="w-6 h-6 border-4 border-black rounded-none accent-[#DE1B1B]"
                                        />
                                        EXIBIR EM DESTAQUE NA HOME
                                    </label>
                                </div>

                                <div className="mb-6">
                                    <label className="block font-black mb-1">Descrição do Projeto</label>
                                    <textarea required rows={4} value={formProj.descricao} onChange={(e) => setFormProj({...formProj, descricao: e.target.value})} className={inputClass} placeholder="Explique sobre o projeto..." />
                                </div>

                                <div className="flex gap-4">
                                    <button type="submit" disabled={salvando} className="bg-[#DE1B1B] text-white font-black py-3 px-8 border-4 border-black">{salvando ? 'A GRAVAR...' : 'SALVAR'}</button>
                                    <button type="button" onClick={() => { setEditandoProj(null); setMostrarFormProj(false); }} className="bg-zinc-300 text-black font-black py-3 px-8 border-4 border-black">CANCELAR</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}