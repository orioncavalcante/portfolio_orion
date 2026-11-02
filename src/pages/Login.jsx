// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErro('E-mail ou senha incorretos.');
            setLoading(false);
        } else {
            // Se logar com sucesso, joga para o dashboard
            navigate('/dashboard');
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-zinc-900 p-6 transition-colors">
            <form 
                onSubmit={handleLogin}
                className="w-full max-w-md bg-[#FEF08A] dark:bg-zinc-800 border-4 border-black p-8 shadow-[8px_8px_0px_#DE1B1B]"
            >
                <h1 className="text-4xl font-black text-[#DE1B1B] uppercase mb-6" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                    Acesso Restrito
                </h1>
                
                {erro && (
                    <div className="bg-red-100 border-2 border-red-600 text-red-800 font-bold p-3 mb-6 text-sm font-mono uppercase text-center">
                        {erro}
                    </div>
                )}

                <div className="space-y-4 font-mono">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-black uppercase text-black dark:text-white">E-mail</label>
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border-2 border-black p-3 focus:outline-none focus:border-[#DE1B1B] rounded-none text-black dark:text-white"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-black uppercase text-black dark:text-white">Senha</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border-2 border-black p-3 focus:outline-none focus:border-[#DE1B1B] rounded-none text-black dark:text-white"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-[#DE1B1B] text-white font-black text-lg py-4 border-2 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[0px_0px_0px_#000] transition-all disabled:opacity-50"
                    >
                        {loading ? 'AUTENTICANDO...' : 'ENTRAR'}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full mt-2 text-center text-xs font-bold text-black dark:text-white hover:underline uppercase"
                    >
                        Voltar ao site
                    </button>
                </div>
            </form>
        </main>
    );
}