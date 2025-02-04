document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.querySelector(".toggle-btn");
    const sidebar = document.querySelector(".sidebar");
    const links = document.querySelectorAll(".sidebar a");

    // === EXPANDIR/RECOLHER MENU ===
    toggleBtn.addEventListener("click", function () {
        sidebar.classList.toggle("active");
        toggleBtn.classList.toggle("active");

        if (sidebar.classList.contains("active")) {
            toggleBtn.textContent = "✕";
            toggleBtn.style.color = "white";
        } else {
            toggleBtn.textContent = "☰";
            toggleBtn.style.color = "black";
        }
    });

    function carregarScriptMovimentacoes() {
        const botaoSalvar = document.getElementById("salvarMovimentacao");
        const campoValorNota = document.getElementById("valorNota");
        const campoCNPJ = document.getElementById("cnpj");

        if (botaoSalvar) {
            botaoSalvar.addEventListener("click", salvarMovimentacao);
        }

        if (campoValorNota) {
            campoValorNota.addEventListener("input", function () {
                formatarMoeda(this);
            });
        }

        if (campoCNPJ) {
            campoCNPJ.addEventListener("input", function () {
                formatarCNPJ(this);
            });
        }
    }

    function salvarMovimentacao() {
        const cliente = document.getElementById("cliente").value.trim().toUpperCase();
        let data = document.getElementById("data").value.trim();
        const numeroNota = document.getElementById("numeroNota").value.trim().toUpperCase();
        let cnpj = document.getElementById("cnpj").value.trim();
        let valorNota = document.getElementById("valorNota").value.trim();
        const municipio = document.getElementById("municipio").value.trim().toUpperCase();

        if (!cliente || !data || !numeroNota || !municipio || !cnpj || !valorNota) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        const partesData = data.split("-");
        if (partesData.length === 3) {
            data = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
        } else {
            alert("Data inválida.");
            return;
        }

        cnpj = cnpj.replace(/\D/g, "");
        if (cnpj.length !== 14) {
            alert("CNPJ inválido. Deve conter 14 dígitos.");
            return;
        }
        cnpj = formatarCNPJString(cnpj);

        valorNota = parseFloat(valorNota.replace(/\D/g, "")) / 100;
        valorNota = valorNota.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        const tabela = document.getElementById("tabela-movimentacoes").getElementsByTagName("tbody")[0];
        const novaLinha = tabela.insertRow();

        const colunas = [cliente, data, numeroNota, municipio, cnpj, valorNota];
        colunas.forEach(texto => {
            let cell = novaLinha.insertCell();
            cell.textContent = texto;
        });

        document.getElementById("data").value = "";
        document.getElementById("numeroNota").value = "";
        document.getElementById("cnpj").value = "";
        document.getElementById("valorNota").value = "";
        document.getElementById("municipio").value = "";

        document.getElementById("valorNota").focus();
    }

    // === FORMATAR VALOR COMO MOEDA (R$ 0,00) ===
    function formatarMoeda(input) {
        let valor = input.value.replace(/\D/g, "");
        if (valor.length === 0) {
            input.value = "";
            return;
        }
        
        valor = (parseFloat(valor) / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        input.value = valor;
    }

    function formatarCNPJ(input) {
        let cnpj = input.value.replace(/\D/g, "");
        
        if (cnpj.length > 14) {
            cnpj = cnpj.substring(0, 14);
        }

        input.value = formatarCNPJString(cnpj);
    }

    function formatarCNPJString(cnpj) {
        if (cnpj.length === 14) {
            return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
        }
        return cnpj;
    }

    carregarScriptMovimentacoes();
});
