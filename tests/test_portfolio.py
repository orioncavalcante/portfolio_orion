import re
from playwright.sync_api import Page, expect, sync_playwright

BASE_URL = "https://portfolio-orion.vercel.app/"

def test_bloqueio_dashboard_sem_login(page: Page):
    page.goto(f"{BASE_URL}/dashboard")

    expect(page).to_have_url(re.compile(r".*/login"))

    heading = page.get_by_role("heading", name=re.compile(r"Acesso Restrito", re.IGNORECASE))
    expect(heading).to_be_visible()


def test_validacao_formulario_contato_vazio(page: Page):
    page.goto(BASE_URL)

    botao_enviar = page.get_by_role("button", name=re.compile(r"ENVIAR MENSAGEM", re.IGNORECASE))
    botao_enviar.scroll_into_view_if_needed()
    botao_enviar.click()

    expect(page.get_by_text("O nome precisa ter pelo menos 3 letras.")).to_be_visible()
    expect(page.get_by_text("Digite um e-mail válido (ex: seu@email.com).")).to_be_visible()
    expect(page.get_by_text("Sua mensagem deve ter no mínimo 20 caracteres.")).to_be_visible()


def test_validacao_formulario_contato_dados_invalidos(page: Page):
    page.goto(BASE_URL)

    page.locator("#nome").fill("Oi")
    page.locator("#email").fill("email-invalido")
    page.locator("#mensagem").fill("Mensagem curta")

    page.evaluate("document.querySelector('form').setAttribute('novalidate', 'true')")

    botao_enviar = page.get_by_role("button", name=re.compile(r"ENVIAR MENSAGEM", re.IGNORECASE))
    botao_enviar.click()

    expect(page.get_by_text("O nome precisa ter pelo menos 3 letras.")).to_be_visible()
    expect(page.get_by_text("Digite um e-mail válido (ex: seu@email.com).")).to_be_visible()
    expect(page.get_by_text("Sua mensagem deve ter no mínimo 20 caracteres.")).to_be_visible()


def test_pagina_404_rota_inexistente(page: Page):
    page.goto(f"{BASE_URL}/rota-que-nao-existe-123")

    expect(page.get_by_role("heading", name="404")).to_be_visible()
    expect(page.get_by_text(re.compile(r"OOPS", re.IGNORECASE))).to_be_visible()


def iniciar_navegador(p):
    for channel in [None, "chrome", "msedge"]:
        try:
            if channel is None:
                return p.chromium.launch(headless=False, slow_mo=500)
            return p.chromium.launch(channel=channel, headless=False, slow_mo=500)
        except Exception:
            continue
    raise RuntimeError(
        "Não foi possível encontrar um navegador. Execute: python -m playwright install chromium"
    )


if __name__ == "__main__":
    print("Iniciando testes automatizados com Playwright (Python)...\n")
    with sync_playwright() as p:
        browser = iniciar_navegador(p)
        page = browser.new_page()

        try:
            print("-> [1/4] Testando bloqueio do Dashboard sem login...")
            test_bloqueio_dashboard_sem_login(page)
            print("   OK! Redirecionado para /login com sucesso.\n")

            print("-> [2/4] Testando validação do formulário vazio...")
            test_validacao_formulario_contato_vazio(page)
            print("   OK! Erros de campos vazios exibidos corretamente.\n")

            print("-> [3/4] Testando validação do formulário com dados inválidos...")
            test_validacao_formulario_contato_dados_invalidos(page)
            print("   OK! Erros de dados inválidos exibidos corretamente.\n")

            print("-> [4/4] Testando página 404 para rota inexistente...")
            test_pagina_404_rota_inexistente(page)
            print("   OK! Página 404 exibida corretamente.\n")

            print("TODOS OS TESTES PASSARAM COM SUCESSO!")
        finally:
            browser.close()
