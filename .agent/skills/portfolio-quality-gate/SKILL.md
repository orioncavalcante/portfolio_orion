---
name: portfolio-quality-gate
description: Skill de verificação de qualidade do portfólio. Executa checagem de build Vite, validação de rotas SPA (vercel.json), paridade Dark Mode e testes E2E com Playwright em Python.
---

# Portfolio Quality Gate Skill

Use esta skill sempre que criar ou alterar uma página, formulário ou fluxo de autenticação no portfólio.

## Passo a Passo de Verificação

1. **Verificação de Temas (Light & Dark Mode)**
   - Confirme que o componente importa `useTheme` de `src/contexts/ThemeContext.jsx` e aplica classes condicionais para fundo, texto, bordas e sprites noturnos (`grama_noite.png`, `nuvem_noite.png`).

2. **Verificação de Build de Produção**
   - Execute `npm run build` para garantir que não há imports quebrados, variáveis indefinidas ou erros de sintaxe JSX/Tailwind v4.

3. **Verificação de Rotas e Deploy (Vercel SPA)**
   - Certifique-se de que `vercel.json` mantém a regra de rewrite `"source": "/(.*)" -> "destination": "/index.html"` para evitar erro 404 da Vercel em rotas do React Router (`/login`, `/dashboard`, `*`).

4. **Execução dos Testes E2E (Playwright + Python)**
   - Com o servidor rodando em `http://localhost:5173`, execute:
     ```powershell
     python tests/test_portfolio.py
     ```
   - Todos os 4 testes obrigatórios devem passar:
     - Bloqueio de `/dashboard` sem login (redirecionamento para `/login`)
     - Validação Zod de campos vazios no formulário de contato
     - Validação Zod de entradas inválidas no formulário de contato
     - Renderização da página 404 para rotas inexistentes

