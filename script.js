document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.querySelector(".toggle-btn");
    const sidebar = document.querySelector(".sidebar");
    const links = document.querySelectorAll(".sidebar a");
    const uploadBtn = document.getElementById("uploadXml");

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

        cnpj = formatarCNPJString(cnpj);
        valorNota = formatarMoeda(valorNota);

        const tabela = document.getElementById("tabela-movimentacoes").getElementsByTagName("tbody")[0];
        const novaLinha = tabela.insertRow();

        const colunas = [cliente, data, numeroNota, municipio, cnpj, valorNota];
        colunas.forEach(texto => {
            let cell = novaLinha.insertCell();
            cell.textContent = texto;
        });

        adicionarBotoesAcao(novaLinha);

        document.getElementById("movimentacao-form").reset();
    }





    function adicionarBotoesAcao(linha) {
        let cell = linha.insertCell();

        const btnEditar = document.createElement("span");
        btnEditar.innerHTML = `<i class="bi bi-pencil-square"></i>`;
        btnEditar.style.cursor = "pointer";
        btnEditar.style.marginRight = "10px";
        btnEditar.title = "Editar";
        btnEditar.onclick = function () {
            editarLinha(linha);
        };

        const btnExcluir = document.createElement("span");
        btnExcluir.innerHTML = `<i class="bi bi-x-circle"></i>`;
        btnExcluir.style.cursor = "pointer";
        btnExcluir.title = "Excluir";
        btnExcluir.onclick = function () {
            linha.remove();
        };

        cell.appendChild(btnEditar);
        cell.appendChild(btnExcluir);
    }





    function editarLinha(linha) {
        const colunasEditaveis = [0, 1, 2, 3, 4, 5];

        colunasEditaveis.forEach(index => {
            let cell = linha.cells[index];
            let valorAtual = cell.textContent;

            let input = document.createElement("input");
            input.type = "text";
            input.value = valorAtual;
            input.style.width = "100%";

            cell.textContent = "";
            cell.appendChild(input);

            input.addEventListener("blur", function () {
                if (index === 5) {
                    // Se for a coluna do valor, formatar como moeda
                    let valorFormatado = formatarMoeda(input.value);
                    cell.textContent = valorFormatado;
                } else {
                    cell.textContent = input.value;
                }
            });

            input.focus();
        });
    }




    function selecionarArquivosXML() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".xml";
        input.multiple = true;

        input.addEventListener("change", function (event) {
            const arquivos = event.target.files;

            if (!arquivos.length) {
                alert("Nenhum arquivo foi selecionado. Por favor, selecione pelo menos um arquivo XML.");
                return;
            }

            processarArquivosXML(arquivos);
        });

        input.click();
    }




    function processarArquivosXML(arquivos) {
        const tabela = document.getElementById("tabela-movimentacoes").getElementsByTagName("tbody")[0];
        let contadorNotasImportadas = 0; // Variável para contar as notas importadas corretamente
    
        for (const arquivo of arquivos) {
            const leitor = new FileReader();
    
            leitor.onload = function (e) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
    
                try {
                    const cliente = xmlDoc.getElementsByTagName("xNome")[1]?.textContent.trim();
                    const bairro = xmlDoc.getElementsByTagName("xBairro")[0]?.textContent.trim();
                    const municipio = xmlDoc.getElementsByTagName("xMun")[0]?.textContent.trim();
                    const dataEmissao = xmlDoc.getElementsByTagName("dhEmi")[0]?.textContent.trim().split("T")[0];
                    const numeroNota = xmlDoc.getElementsByTagName("nNF")[0]?.textContent.trim();
                    const cnpjDest = xmlDoc.getElementsByTagName("CNPJ")[1]?.textContent.trim();
                    const valorNota = xmlDoc.getElementsByTagName("vPag")[0]?.textContent.trim();
    
                    // Verificar se já existe uma nota com o mesmo número para o mesmo cliente
                    let notaExistente = false;
                    const linhasTabela = tabela.getElementsByTagName("tr");
    
                    for (const linha of linhasTabela) {
                        const colunaCliente = linha.cells[0]?.textContent.trim();
                        const colunaNumeroNota = linha.cells[2]?.textContent.trim();
    
                        if (colunaCliente === cliente && colunaNumeroNota === numeroNota) {
                            notaExistente = true;
                            break;
                        }
                    }
    
                    if (!notaExistente) {
                        // Se não encontrou nenhuma nota com o mesmo número para o mesmo cliente, adiciona
                        const novaLinha = tabela.insertRow();
                        const colunas = [
                            cliente,
                            formatarData(dataEmissao),
                            numeroNota,
                            `${bairro} - ${municipio}`,
                            formatarCNPJString(cnpjDest),
                            formatarMoeda(valorNota)
                        ];
    
                        colunas.forEach(texto => {
                            let cell = novaLinha.insertCell();
                            cell.textContent = texto;
                        });
    
                        adicionarBotoesAcao(novaLinha);
    
                        contadorNotasImportadas++; // Incrementa o contador
                    }
    
                } catch (error) {
                    console.error(`Erro ao processar o arquivo: ${arquivo.name}. Verifique se é um XML de NFe válido.`);
                }
            };
    
            leitor.readAsText(arquivo);
        }
    
        // Atualizar a label com a quantidade de notas importadas
        const label = document.getElementById("label-notas-importadas");
        if (label) {
            label.textContent = `Notas importadas corretamente: ${contadorNotasImportadas}`;
        }
    }
    
    



    function formatarData(data) {
        const partes = data.split("-");
        return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
    }



    function formatarMoeda(valor) {
        return parseFloat(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }



    function formatarCNPJString(cnpj) {
        cnpj = cnpj.replace(/\D/g, "");
        return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
    }

    if (uploadBtn) {
        uploadBtn.addEventListener("click", selecionarArquivosXML);
    }

    
    carregarScriptMovimentacoes();
});
