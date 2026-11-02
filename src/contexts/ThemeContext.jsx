import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [tema, setTema] = useState(() => {
        const temaSalvo = localStorage.getItem('@portfolio-orion:tema');
        if (temaSalvo) {
            return temaSalvo;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(tema);
        localStorage.setItem('@portfolio-orion:tema', tema);
    }, [tema]);

    const alternarTema = () => {
        setTema((temaAtual) => (temaAtual === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ tema, alternarTema }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}