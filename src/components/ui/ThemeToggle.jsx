import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle() {
    const { tema, alternarTema } = useTheme();

    return (
        <button
            onClick={alternarTema}
            className="fixed bottom-6 right-6 z-50 p-3 bg-[#FEF08A] dark:bg-zinc-800 border-4 border-black shadow-[4px_4px_0px_#DE1B1B] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#DE1B1B] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[0px_0px_0px_#DE1B1B] transition-all flex items-center justify-center"
            aria-label="Alternar tema"
        >
            {tema === 'light' ? (
                // Ícone de Lua (Modo Escuro)
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
            ) : (
                // Ícone de Sol (Modo Claro)
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
            )}
        </button>
    );
}