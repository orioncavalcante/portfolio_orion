import { SectionTitle } from "../ui/SectionTitle";
import { Button } from "../ui/Button";

export function About() {
    const skills = [
        'Python',
        'JavaScript',
        'React',
        'Node.js',
        'HTML / CSS',
        'Playwright / Selenium',
        'REST APIs / JSON',
        'SQL / MySQL',
        'Git / GitHub',
        'Adobe Photoshop'
    ];

    return (
        <section id="sobre" className="py-20 px-6 max-w-[1200px] mx-auto">
            <SectionTitle>Sobre mim</SectionTitle>

            <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex-1 space-y-6 font-mono text-sm md:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <p>
                        Olá! Sou <strong>Orion França</strong>, estudante de Engenharia de Software na FIAP e profissional de tecnologia na <strong>Overbank</strong>. Sou movido pela curiosidade, pela criatividade e pelo interesse em entender como as coisas funcionam. Gosto de transformar ideias em soluções digitais, unindo tecnologia, funcionalidade e boas experiências.
                    </p>

                    <p>
                        Minha experiência envolve desenvolvimento de aplicações, automação de processos, integração de APIs e criação de ferramentas para resolver problemas reais. Trabalho com tecnologias como Python, JavaScript, Node.js e desenvolvimento web, buscando constantemente aprimorar minhas habilidades e ampliar minha visão sobre engenharia de software.
                    </p>

                    <p>
                        Além da tecnologia, tenho uma forte conexão com música e arte. Gosto de explorar diferentes referências artísticas, criar minhas próprias músicas e experimentar formas de expressão criativa. Acredito que essa relação com a arte influencia diretamente minha maneira de pensar, projetar e desenvolver, trazendo uma perspectiva mais criativa para os desafios técnicos.
                    </p>

                    <p>
                        Tenho especial interesse em design, estética digital e na construção de experiências que vão além do aspecto funcional. Gosto de explorar referências visuais que vão do retrofuturismo e da estética Y2K ao design contemporâneo, sempre buscando desenvolver projetos com personalidade, propósito e atenção aos detalhes.
                    </p>

                    <div className="pt-4">
                        <Button href="#contato">Bora conversar?</Button>
                    </div>
                </div>

                <div className="w-full md:w-[400px] border-4 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-[8px_8px_0px_#DE1B1B]">
                    <h3 className="font-black text-xl mb-4 uppercase">Principais Stacks</h3>
                    <ul className="grid grid-cols-2 gap-4">
                        {skills.map((skill) => (
                            <li
                                key={skill}
                                className="font-mono text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#DE1B1B] inline-block"></span>
                                {skill}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    )
}