# AGENTS.md — Instruções do Projeto para Agentes de IA

Este documento define as diretrizes arquiteturais, visuais e de fluxo de trabalho que qualquer agente de IA (Google Antigravity / Cursor / Claude) deve seguir ao analisar, criar ou modificar código neste repositório.

---

## 1. Contexto e Identidade Visual
- **Projeto:** Portfólio pessoal interativo de **Orion França** com painel administrativo (`Dashboard`).
- **Identidade Visual:** Neo-Brutalismo + Pixel Art (bordas marcadas `border-3 border-black`, sombras sólidas `shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`, tipografia `Press Start 2P` / `Silkscreen` / `Outfit`, e paleta vermelho `#e51c23`, preto, branco e suporte completo a **Modo Noturno** via `ThemeContext`).
- **Idioma:** Todo o conteúdo visível ao usuário, mensagens de validação, comentários relevantes e mensagens de commit devem estar em **Português (pt-BR)**.

---

## 2. Regras de Arquitetura e Divisão de Componentes

1. **Páginas (`src/pages/`)**:
   - Apenas componentes que representam uma rota inteira no `src/App.jsx` (`Home.jsx`, `Login.jsx`, `Dashboard.jsx`, `NotFound.jsx`).
   - Toda rota administrativa deve ser envolvida pelo guardião `<RotaProtegida>` em `src/App.jsx`.

2. **Componentes de Layout (`src/components/layout/`)**:
   - Seções estruturais da página principal (`Navbar`, `Hero`, `About`, `Experience`, `Projects`, `Contact`, `Footer`).
   - Cada seção deve possuir um `id` semântico (`#inicio`, `#sobre`, `#experiencia`, `#projetos`, `#contato`) para navegação por âncora e suportar o estado `darkMode` do `useTheme()`.

3. **Componentes de UI (`src/components/ui/`)**:
   - Componentes visuais atômicos, puros e reutilizáveis, sem acoplamento direto com chamadas de banco de dados.

4. **Contextos (`src/contexts/`) e Serviços (`src/lib/`)**:
   - A instância do Supabase fica isolada em `src/lib/supabase.js` lendo variáveis de ambiente (`import.meta.env.VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).
   - Nunca expor chaves sensíveis hardcoded no código-fonte.

---

## 3. Padrões de Código e Validação
- **Formulários:** Utilizar sempre `react-hook-form` integrado ao `zod` (`@hookform/resolvers/zod`) para validação declarativa.
- **Resiliência de Dados:** Operações de leitura/escrita no Supabase devem tratar erros graciosamente (`try/catch`) e manter sincronização com estado local quando aplicável.
- **Roteamento SPA em Produção:** Qualquer nova rota adicionada em `src/App.jsx` deve ser compatível com a regra de rewrite do `vercel.json`.

---

## 4. Padrões de Git, Branches e Commits
- **Branches:** Usar prefixos semânticos:
  - `feat/<nome-da-feature>` para novas funcionalidades (ex.: `feat/pagina-404`, `feat/testes-playwright`)
  - `fix/<nome-do-bug>` para correções (ex.: `fix/vercel-spa-routing`)
  - `chore/<tarefa>` para configurações e manutenção
- **Commits (Conventional Commits):**
  - `feat: adiciona página 404 personalizada e rota coringa`
  - `fix: corrige redirecionamento de rotas SPA na Vercel`
  - `test: adiciona testes E2E com Playwright cobrindo formulário e autenticação`
  - `docs: documenta arquitetura e harness de IA no repositório`

