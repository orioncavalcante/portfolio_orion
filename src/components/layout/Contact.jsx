import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import emailjs from '@emailjs/browser';

// ============================================================================
// 0. ASSETS LOCAIS (Grama e Cogumelo)
// ============================================================================
const assetFiles = import.meta.glob('../../assets/**/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });

function getAsset(keyword, fallbackUrl = '') {
    const foundKey = Object.keys(assetFiles).find((path) =>
        path.toLowerCase().includes(keyword.toLowerCase())
    );
    return foundKey ? assetFiles[foundKey] : fallbackUrl;
}

const gramaImg = getAsset('grama.png');
const gramaNoiteImg = getAsset('grama_noite.png');
const cogumeloImg = getAsset('cogumelo');

// ============================================================================
// 1. SEUS LINKS — TROQUE PELOS SEUS DADOS REAIS
// ============================================================================
const EMAIL = 'orion.franca19@gmail.com';
const CURRICULO_URL = '../../../public/orion.pdf';

const LINKS = [
    { label: 'E-mail',    valor: EMAIL, href: `mailto:${EMAIL}`, icone: 'mail' },
    { label: 'GitHub',    valor: 'github.com/orioncavalcante', href: 'https://github.com/orioncavalcante', icone: 'github' },
    { label: 'LinkedIn',  valor: 'in/orioncavalcante', href: 'https://www.linkedin.com/in/orioncavalcante/', icone: 'linkedin' },
    { label: 'Currículo', valor: 'Baixar PDF', href: CURRICULO_URL, icone: 'download', download: true },
];

// ============================================================================
// 2. ESQUEMA DE VALIDAÇÃO (ZOD)
// ============================================================================
const contactSchema = z.object({
    nome: z.string().min(3, { message: 'O nome precisa ter pelo menos 3 letras.' }),
    email: z.string().email({ message: 'Digite um e-mail válido (ex: seu@email.com).' }),
    mensagem: z.string().min(20, { message: 'Sua mensagem deve ter no mínimo 20 caracteres.' }),
});

// ============================================================================
// 3. ÍCONES (SVG inline)
// ============================================================================
const paths = {
    mail: <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.5 2 7.5 5.5L19.5 7H4.5Z" />,
    github: <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.9.83.09-.64.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />,
    linkedin: <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.66 4.8 6.12V21h-4v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.59V21h-4V9.75Z" />,
    whatsapp: <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0 1 12 4Zm-3 3.5c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 2 3.1 4.9 4.3 2.4.9 2.9.7 3.4.7.5-.1 1.7-.7 1.9-1.400.2-.7.2-1.200.2-1.400l-.5-.3-1.800-.9c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.900-1.200-.7-.6-1.200-1.400-1.300-1.600-.1-.2 0-.4.1-.5l.4-.5.3-.4c.1-.2 0-.4 0-.5l-.8-2c-.2-.5-.4-.4-.6-.4H9Z" />,
    arrow: <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />,
    download: <path d="M11 3h2v10.17l3.59-3.58L18 11l-6 6-6-6 1.41-1.41L11 13.17V3ZM5 19h14v2H5v-2Z" />,
};

function Icone({ nome, className = 'w-5 h-5' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            {paths[nome]}
        </svg>
    );
}

// ============================================================================
// 4. COMPONENTE
// ============================================================================
export function Contact() {
    const [statusEnvio, setStatusEnvio] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(contactSchema), defaultValues: { mensagem: '' } });

    const tamanhoMensagem = (watch('mensagem') || '').length;

    const enviarMensagem = async (dados) => {
        try {
            // Disparo real via EmailJS usando as variáveis do arquivo .env
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    from_name: dados.nome,
                    from_email: dados.email,
                    message: dados.mensagem,
                },
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            setStatusEnvio('sucesso');
            reset();
            setTimeout(() => setStatusEnvio(null), 5000);
        } catch (erro) {
            console.error('Erro ao enviar e-mail:', erro);
            setStatusEnvio('erro');
            setTimeout(() => setStatusEnvio(null), 5000);
        }
    };

    const inputBase = 'w-full bg-white dark:bg-zinc-800 border-2 border-black p-3 text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#DE1B1B] transition-colors rounded-none';
    const labelBase = 'text-sm font-black font-mono uppercase text-black dark:text-white';
    const erroBase = 'text-[10px] font-bold font-mono uppercase text-red-600 bg-red-100 dark:bg-red-900/30 p-1 inline-block mt-1';

    return (
        <section
            id="contato"
            className="relative overflow-hidden dark:bg-zinc-800 min-h-screen flex flex-col pt-16 md:pt-24"
        >
            <style>{`
                @keyframes cogu-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
                @keyframes cogu-in  { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
                .cogu-bob { animation: cogu-bob 3.2s ease-in-out infinite; }
                .cogu-in  { animation: cogu-in .7s cubic-bezier(.2,.8,.2,1) both; }
                @media (prefers-reduced-motion: reduce) { .cogu-bob, .cogu-in { animation: none; } }
            `}</style>

            <div className="relative z-20 w-full max-w-[1200px] mx-auto px-6 pb-56 md:pb-72">

                <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">

                    {/* COLUNA ESQUERDA: TÍTULO + LISTA DE LINKS */}
                    <div>
                        {/* O Título agora mora aqui dentro, permitindo que a coluna direita suba */}
                        <header className="cogu-in mb-10 md:mb-12 text-center lg:text-left">
                            <h2
                                className="text-[18vw] lg:text-[100px] font-black text-[#DE1B1B] uppercase leading-[0.85] tracking-tight"
                                style={{ fontFamily: "'Archivo Black', sans-serif" }}
                            >
                                FALE<br />COMIGO
                            </h2>
                            <p className="mt-6 max-w-md mx-auto lg:mx-0 text-sm md:text-base font-bold text-[#DE1B1B]/90">
                                Tem um projeto, uma vaga ou só quer trocar uma ideia? Mande uma mensagem. Prometo não demorar a responder.
                            </p>
                        </header>

                        <ul className="cogu-in space-y-1 font-mono" style={{ animationDelay: '.1s' }}>
                            {LINKS.map((item) => {
                                const externo = item.href.startsWith('http');
                                return (
                                    <li key={item.label}>
                                        <a
                                            href={item.href}
                                            {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                            {...(item.download ? { download: 'Curriculo-Orion-Franca.pdf' } : {})}
                                            className="group grid grid-cols-[28px_100px_1fr_auto] items-center gap-3 py-3 border-b border-[#DE1B1B]/30 text-[#DE1B1B] hover:border-[#DE1B1B] transition-colors"
                                        >
                                            <Icone nome={item.icone} className="w-6 h-6 transition-transform group-hover:scale-125 group-hover:-rotate-6" />
                                            <span className="text-sm font-black uppercase">{item.label}</span>
                                            <span className="text-sm truncate font-bold group-hover:underline underline-offset-4">{item.valor}</span>
                                            <Icone nome="arrow" className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* COLUNA DIREITA: FORMULÁRIO BRUTALISTA (Começa lado a lado com o Título) */}
                    <form
                        onSubmit={handleSubmit(enviarMensagem)}
                        noValidate
                        className="cogu-in relative bg-[#FEF08A] dark:bg-zinc-800 border-4 border-black p-6 md:p-10 shadow-[8px_8px_0px_#DE1B1B]"
                        style={{ animationDelay: '.2s' }}
                    >
                        <div className="space-y-6">

                            <div className="flex flex-col gap-1">
                                <label htmlFor="nome" className={labelBase}>Nome Completo</label>
                                <input
                                    id="nome"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Como devo te chamar?"
                                    aria-invalid={!!errors.nome}
                                    className={`${inputBase} ${errors.nome ? 'border-red-600' : ''}`}
                                    {...register('nome')}
                                />
                                {errors.nome && <span className={erroBase}>{errors.nome.message}</span>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="email" className={labelBase}>E-mail</label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="seu@email.com"
                                    aria-invalid={!!errors.email}
                                    className={`${inputBase} ${errors.email ? 'border-red-600' : ''}`}
                                    {...register('email')}
                                />
                                {errors.email && <span className={erroBase}>{errors.email.message}</span>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-end justify-between">
                                    <label htmlFor="mensagem" className={labelBase}>Mensagem</label>
                                    <span className={`text-[10px] font-bold font-mono uppercase tabular-nums ${tamanhoMensagem >= 20 ? 'text-green-600' : 'text-zinc-500'}`}>
                                        {tamanhoMensagem}/20 mín.
                                    </span>
                                </div>
                                <textarea
                                    id="mensagem"
                                    rows="5"
                                    placeholder="O que você tem em mente?"
                                    aria-invalid={!!errors.mensagem}
                                    className={`${inputBase} resize-none ${errors.mensagem ? 'border-red-600' : ''}`}
                                    {...register('mensagem')}
                                />
                                {errors.mensagem && <span className={erroBase}>{errors.mensagem.message}</span>}
                            </div>

                            {statusEnvio === 'sucesso' && (
                                <div role="status" className="bg-green-100 border-2 border-green-600 text-green-800 font-bold p-3 text-sm text-center font-mono uppercase">
                                    MENSAGEM ENVIADA COM SUCESSO!
                                </div>
                            )}
                            
                            {statusEnvio === 'erro' && (
                                <div role="alert" className="bg-red-100 border-2 border-red-600 text-red-800 font-bold p-3 text-sm text-center font-mono uppercase">
                                    ERRO AO ENVIAR. TENTE NOVAMENTE.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full font-black font-mono text-lg py-4 border-2 border-black transition-all ${
                                    isSubmitting 
                                        ? 'bg-zinc-400 text-zinc-700 cursor-not-allowed shadow-[0px_0px_0px_#000]' 
                                        : 'bg-[#DE1B1B] text-white shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#000] active:translate-y-[4px] active:translate-x-[4px] active:shadow-[0px_0px_0px_#000]'
                                }`}
                            >
                                {isSubmitting ? 'ENVIANDO...' : 'ENVIAR MENSAGEM'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ================= FUNDO: COLINA DE GRAMA + COGUMELOS IMAGENS ================= */}
            <div className="absolute inset-x-0 bottom-0 w-full h-[30%] md:h-[40%] z-10 overflow-hidden pointer-events-none">
                {gramaImg && (
                    <img src={gramaImg} alt="Grama" className="w-full h-full object-cover object-top dark:hidden" draggable="false" />
                )}
                {gramaNoiteImg && (
                    <img
                        src={gramaNoiteImg}
                        alt="Grama noturna"
                        className="hidden dark:block w-full h-full object-cover object-top max-md:translate-y-[33%] md:scale-[1.75] md:origin-bottom"
                        draggable="false"
                    />
                )}

                {cogumeloImg && (
                    <div className="absolute inset-0 max-w-[1400px] mx-auto">
                        <img src={cogumeloImg} alt="Cogumelo" className="cogu-bob absolute w-12 md:w-20 left-[4%] top-[10%]" style={{ imageRendering: 'pixelated' }} />
                        <img src={cogumeloImg} alt="Cogumelo" className="cogu-bob absolute w-8 md:w-12 left-[20%] top-[60%]" style={{ imageRendering: 'pixelated', animationDelay: '.6s' }} />
                        <img src={cogumeloImg} alt="Cogumelo" className="cogu-bob absolute w-14 md:w-24 left-[55%] top-[30%]" style={{ imageRendering: 'pixelated', animationDelay: '1.1s' }} />
                        <img src={cogumeloImg} alt="Cogumelo" className="cogu-bob absolute w-12 md:w-16 right-[10%] top-[15%]" style={{ imageRendering: 'pixelated', animationDelay: '1.6s' }} />
                    </div>
                )}
            </div>
        </section>
    );
}