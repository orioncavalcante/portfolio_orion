import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SectionTitle } from "../ui/SectionTitle";
import { Button } from "../ui/Button";

export function About() {
    const [textoSobre, setTextoSobre] = useState('Carregando informações...');
    const [skills, setSkills] = useState([]); // Agora começa vazio e preenche do banco

    useEffect(() => {
        async function carregarDados() {
            const { data, error } = await supabase
                .from('sobre')
                .select('texto, stacks')
                .eq('id', 1)
                .single();
                
            if (data) {
                setTextoSobre(data.texto);
                
                // Mágica: Pega a string "Python, React" e transforma no array ['Python', 'React']
                if (data.stacks) {
                    const arrayDeStacks = data.stacks.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
                    setSkills(arrayDeStacks);
                }
            }
            if (error) {
                console.error("Erro ao carregar os dados:", error);
            }
        }
        
        carregarDados();
    }, []);

    return (
        <section id="sobre" className="py-20 px-6 max-w-[1200px] mx-auto">
            <SectionTitle>Sobre mim</SectionTitle>

            <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex-1 space-y-6 font-mono text-sm md:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <div className="whitespace-pre-wrap">
                        {textoSobre}
                    </div>
                    <div className="pt-4">
                        <Button href="#contato">Bora conversar?</Button>
                    </div>
                </div>

                {/* Só renderiza a caixa se houver skills para mostrar */}
                {skills.length > 0 && (
                    <div className="w-full md:w-[400px] border-4 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-[8px_8px_0px_#DE1B1B]">
                        <h3 className="font-black text-xl mb-4 uppercase">Principais Stacks</h3>
                        <ul className="grid grid-cols-2 gap-4">
                            {skills.map((skill) => (
                                <li
                                    key={skill}
                                    className="font-mono text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#DE1B1B] inline-block shrink-0"></span>
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    )
}