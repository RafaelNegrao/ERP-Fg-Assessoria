document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.querySelector(".toggle-btn");
    const sidebar = document.querySelector(".sidebar");

    // === EXPANDIR/RECOLHER MENU ===
    toggleBtn.addEventListener("click", function () {
        sidebar.classList.toggle("active");
        toggleBtn.classList.toggle("active");

        if (sidebar.classList.contains("active")) {
            toggleBtn.innerHTML = '<i class="bi bi-x-circle"></i>'; 
            toggleBtn.style.color = "white";
        } else {
            toggleBtn.innerHTML = '<i class="bi bi-list"></i>'; 
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
        if (cnpj.length !== 11 && cnpj.length !== 14) {
            alert("Documento inválido. CPF deve ter 11 dígitos e CNPJ 14 dígitos.");
            return;
        }
        cnpj = formatarCNPJString(cnpj);

        // Formatar valor monetário
        valorNota = parseFloat(valorNota.replace(/\D/g, "")) / 100;
        valorNota = valorNota.toLocaleString("pt-BR", { 
            style: "currency", 
            currency: "BRL" 
        });

        const tabela = document.getElementById("tabela-movimentacoes").getElementsByTagName("tbody")[0];
        const novaLinha = tabela.insertRow();

        const colunas = [cliente, data, numeroNota, municipio, cnpj, valorNota];
        colunas.forEach(texto => {
            let cell = novaLinha.insertCell();
            cell.textContent = texto;
        });

        const cellAcoes = novaLinha.insertCell();
        cellAcoes.innerHTML = `
            <button class="btn-excluir">
                <i class="bi bi-x-circle"></i>
            </button>
            <button class="btn-editar">
                <i class="bi bi-pencil-square"></i>
            </button>
        `;

        const buttons = cellAcoes.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.fontSize = "1.5rem"; 
            button.style.marginRight = "10px"; 
            button.style.border = "none"; 
            button.style.background = "none"; 
        });

        cellAcoes.querySelector('.btn-excluir').addEventListener('click', function () {
            const linha = this.closest("tr"); 
            linha.remove(); 
        });

        // Evento para editar linha
        cellAcoes.querySelector('.btn-editar').addEventListener('click', function () {
            const linha = this.closest("tr"); 
            preencherFormularioParaEdicao(linha);
            linha.remove(); 
        });

        document.getElementById("data").value = "";
        document.getElementById("numeroNota").value = "";
        document.getElementById("cnpj").value = "";
        document.getElementById("valorNota").value = "";
        document.getElementById("municipio").value = "";

        document.getElementById("valorNota").focus();
    }

    function preencherFormularioParaEdicao(linha) {
        const cells = linha.cells;
    
        const clienteSelect = document.getElementById("cliente");
        const clienteValor = cells[0].textContent.trim().toLowerCase();
        const options = clienteSelect.options;
    
        for (let i = 0; i < options.length; i++) {
            if (options[i].value.trim().toLowerCase() === clienteValor) {
                clienteSelect.selectedIndex = i;
                break;
            }
        }
    
        const dataParts = cells[1].textContent.split('/');
        document.getElementById("data").value = `${dataParts[2]}-${dataParts[1]}-${dataParts[0]}`;
    
        document.getElementById("numeroNota").value = cells[2].textContent;
        document.getElementById("municipio").value = cells[3].textContent;
        document.getElementById("cnpj").value = cells[4].textContent;
    
        const valor = cells[5].textContent.replace(/[^\d,]/g, '').replace(',', '.');
        const valorFormatado = parseFloat(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
        document.getElementById("valorNota").value = valorFormatado;
    }
    

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
        let numero = input.value.replace(/\D/g, "");

        if (numero.length > 14) {
            numero = numero.substring(0, 14);
        }

        input.value = formatarCNPJString(numero);
    }

    function formatarCNPJString(numero) {
        if (numero.length === 11) { // CPF
            return numero.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        } else if (numero.length === 14) { // CNPJ
            return numero.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
        }
        return numero;
    }

    carregarScriptMovimentacoes();
});
