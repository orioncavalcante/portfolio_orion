import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Hero } from './components/layout/Hero';
import { About } from './components/layout/About';
import { SectionTitle } from './components/ui/SectionTitle';
import { Experience } from './components/layout/Experience';
import { Projects } from './components/layout/Projects';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono">
      {/* NAVBAR FLUTUANTE */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b-2 border-black dark:border-zinc-800 transition-colors">
        <span className="font-bold text-sm tracking-tight">ORION.DEV</span>
        <nav className="flex items-center gap-6 text-sm">
          <a href="#projetos" className="hover:text-[#DE1B1B] transition-colors">Projetos</a>
          <a href="#contato" className="hover:text-[#DE1B1B] transition-colors">Contato</a>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </nav>
      </header>

      <main>
        {/* SESSÃO HERO (TELA INICIAL) */}
        <Hero />

        {/* SESSÃO SOBRE MIM */}
        <About />

        {/* SESSÃO EXPERIÊNCIA */}
        <Experience />

        {/* ESPAÇO PARA A SESSÃO DE PROJETOS QUE FAREMOS DEPOIS */}
        <Projects />
      </main>
    </div>
  );
}