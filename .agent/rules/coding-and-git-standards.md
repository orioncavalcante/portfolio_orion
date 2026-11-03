---
description: Regras obrigatórias de arquitetura React, estilização Neo-Brutalista/Pixel Art, segurança e padrões de Git/Commits.
globs: ["src/**/*.{js,jsx,css}", "tests/**/*.py", "vercel.json"]
alwaysApply: true
---

# Regras de Código, Arquitetura e Git

## 1. Padrão de Componentes React
- Utilizar **Function Components** com Hooks (`useState`, `useEffect`, `useContext`).
- Sempre consumir o tema atual via `const { darkMode } = useTheme()` em componentes visuais para garantir paridade entre o Modo Claro e o Modo Noturno.
- Manter estilos consistentes com o Design System Neo-Brutalista:
  - Bordas sólidas (`border-2` ou `border-3 border-black`)
  - Sombras duras deslocadas (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`)
  - Efeito físico de clique (`active:translate-x-[2px] active:translate-y-[2px]`)

## 2. Segurança e Rotas Protegidas
- O painel `/dashboard` nunca deve ser exposto sem o wrapper `<RotaProtegida>`.
- Variáveis de ambiente devem usar o prefixo `VITE_` e ser lidas via `import.meta.env`.

## 3. Convenção de Commits e Branches
- Sempre sugerir e utilizar **Conventional Commits** em português (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- Antes de concluir qualquer entrega que afete formulários ou autenticação, garantir que a suíte `tests/test_portfolio.py` continua passando.

