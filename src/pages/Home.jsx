// src/pages/Home.jsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Hero } from '../components/layout/Hero';
import { About } from '../components/layout/About';
import { Experience } from '../components/layout/Experience';
import { Projects } from '../components/layout/Projects';
import { Contact } from '../components/layout/Contact';

const links = [
  { href: '#inicio', label: 'Início' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#experiencia', label: 'Experiência' },
  { href: '#projetos', label: 'Projetos' },
  { href: '#contato', label: 'Contato' },
];

export function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const btn =
    'p-2 border-2 border-black dark:border-zinc-600 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all';

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono">
      {/* NAVBAR FLUTUANTE */}
      <header className="fixed top-4 inset-x-0 z-40 px-4 sm:px-6 pointer-events-none">
        <div className="pointer-events-auto max-w-[1100px] mx-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-2 border-black dark:border-zinc-600 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] transition-colors">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
            <a href="#inicio" className="font-bold text-sm tracking-tight shrink-0">
              ORION<span className="text-[#DE1B1B]">.DEV</span>
            </a>

            {/* Links desktop */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="hover:text-[#DE1B1B] transition-colors">
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* Botão hambúrguer (só mobile) */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
                className={`${btn} md:hidden`}
              >
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          {menuOpen && (
            <nav className="md:hidden flex flex-col border-t-2 border-black dark:border-zinc-600">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-sm border-b-2 last:border-b-0 border-black/10 dark:border-zinc-700 hover:text-[#DE1B1B] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Contact />
      </main>
    </div>
  );
}