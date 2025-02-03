document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".sidebar a");

    links.forEach(link => {
        link.addEventListener("click", function (event) {
            const page = link.getAttribute("href");

            // Se o link for para uma página externa, apenas segue o link
            if (page.endsWith(".html")) {
                return; // Deixa o navegador seguir o link normalmente
            }

            event.preventDefault();
            carregarPagina(page.substring(1)); // Remove o "#" do link
        });
    });

    function carregarPagina(pagina) {
        const contentDiv = document.getElementById("page-content");
        if (!contentDiv) return; // Se a div não existir, não faz nada

        fetch(`${pagina}.html`)
            .then(response => response.text())
            .then(html => {
                contentDiv.innerHTML = html;
                if (pagina === "movimentacoes") {
                    carregarScriptMovimentacoes();
                }
            })
            .catch(error => console.error("Erro ao carregar a página:", error));
    }

    function carregarScriptMovimentacoes() {
        const botaoSalvar = document.getElementById("salvarMovimentacao");
        if (!botaoSalvar) return;

        botaoSalvar.addEventListener("click", function () {
            const cliente = document.getElementById("cliente").value;
            const data = document.getElementById("data").value;
            const numeroNota = document.getElementById("numeroNota").value;
            const cnpj = document.getElementById("cnpj").value;
            const valorNota = document.getElementById("valorNota").value;
            const observacao = document.getElementById("observacao").value;

            if (cliente && data && numeroNota && cnpj && valorNota) {
                const tabela = document.getElementById("tabela-movimentacoes").getElementsByTagName("tbody")[0];
                const novaLinha = tabela.insertRow();
                novaLinha.innerHTML = `
                    <td>${cliente}</td>
                    <td>${data}</td>
                    <td>${numeroNota}</td>
                    <td>${cnpj}</td>
                    <td>${valorNota}</td>
                    <td>${observacao}</td>
                `;
            } else {
                alert("Preencha todos os campos obrigatórios.");
            }
        });
    }
});
