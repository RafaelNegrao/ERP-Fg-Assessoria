document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.querySelector(".toggle-btn"); 
    const sidebar = document.querySelector(".sidebar"); 
    const links = document.querySelectorAll(".sidebar a");

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

    links.forEach(link => {
        link.addEventListener("click", function (event) {
            const page = link.getAttribute("href");

            if (page.endsWith(".html")) {
                return;
            }

            event.preventDefault();
            carregarPagina(page.substring(1));
        });
    });

    function carregarPagina(pagina) {
        const contentDiv = document.getElementById("page-content");
        if (!contentDiv) return;

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
    
        botaoSalvar.addEventListener("click", salvarMovimentacao);
    }

    function salvarMovimentacao() {
        const cliente = document.getElementById("cliente").value.trim().toUpperCase();
        let data = document.getElementById("data").value.trim();
        const numeroNota = document.getElementById("numeroNota").value.trim().toUpperCase();
        let cnpj = document.getElementById("cnpj").value.trim();
        let valorNota = document.getElementById("valorNota").value.trim();
        const municipio = document.getElementById("municipio").value.trim().toUpperCase();
    
        // === 1° VALIDAÇÃO: CAMPOS OBRIGATÓRIOS ===
        if (!cliente || !data || !numeroNota || !municipio || !cnpj || !valorNota) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }
    
        // === 2° FORMATAÇÃO DA DATA (AAAA-MM-DD → DD/MM/AAAA) ===
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
        cnpj = `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
    
      
        valorNota = parseFloat(valorNota).toFixed(2);
    
       
        const tabela = document.getElementById("tabela-movimentacoes").getElementsByTagName("tbody")[0];
        const novaLinha = tabela.insertRow();
    
        const colunas = [cliente, data, numeroNota, municipio, cnpj, `R$ ${valorNota}`];
        colunas.forEach(texto => {
            let cell = novaLinha.insertCell();
            cell.textContent = texto;
        });
    
        // === 6° LIMPA OS CAMPOS DO FORMULÁRIO ===
        document.getElementById("movimentacao-form").reset();
    }

    carregarScriptMovimentacoes();
});
