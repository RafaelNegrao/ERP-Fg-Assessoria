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
      let cliente = document.getElementById("cliente").value.trim();
      let data = document.getElementById("data").value.trim();
      let numeroNota = document.getElementById("numeroNota").value.trim();
      let cnpj = document.getElementById("cnpj").value.trim();
      let valorNota = document.getElementById("valorNota").value.trim();
      let municipio = document.getElementById("municipio").value.trim();
  
      if (!cliente || !data || !numeroNota || !municipio || !cnpj || !valorNota) {
        alert("Preencha todos os campos obrigatórios.");
        return;
      }
  
      cliente = removeAcentos(cliente).toUpperCase();
      data = data.split("-").length === 3
        ? `${data.split("-")[2]}/${data.split("-")[1]}/${data.split("-")[0]}`
        : (alert("Data inválida."), data);
      numeroNota = numeroNota.toUpperCase();
      municipio = removeAcentos(municipio).toUpperCase();
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
      atualizarTotal();
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
        atualizarTotal();
      };
  
      cell.appendChild(btnEditar);
      cell.appendChild(btnExcluir);
    }
  
    function editarLinha(linha) {
        const colunasEditaveis = [0, 1, 2, 3, 4, 5, 6];
        
        colunasEditaveis.forEach(index => {
          const cell = linha.cells[index];
          const valorAtual = cell.textContent; // Armazena o valor original
          const input = document.createElement("input");
          
          input.type = "text";
          input.style.width = "100%";
          input.value = index === 6 ? "" : valorAtual;
          
          cell.textContent = "";
          cell.appendChild(input);
      
          input.addEventListener("blur", function () {
            let novoValor = input.value.trim();
            
            // Se o campo ficar vazio, restaura o valor original
            if (novoValor === "") {
              cell.textContent = valorAtual;
              atualizarTotal();
              return;
            }
      
            switch (index) {
              case 3:
                novoValor = novoValor.replace(/\D/g, "");
                break;
              case 5:
                novoValor = formatarCNPJString(novoValor.replace(/\D/g, ""));
                break;
              case 1:
                if (!/^\d{2}\/\d{2}\/\d{4}$/.test(novoValor)) {
                  novoValor = formatarData(novoValor);
                }
                break;
              case 6:
                novoValor = formatarMoeda(novoValor);
                break;
              default:
                novoValor = removeAcentos(novoValor).toUpperCase();
            }
            
            cell.textContent = novoValor;
            atualizarTotal();
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
      let contadorNotasImportadas = 0;
      let valorTotal = 0;
      for (const arquivo of arquivos) {
        const leitor = new FileReader();
        leitor.onload = function (e) {
          const decoder = new TextDecoder("ISO-8859-1");
          const texto = decoder.decode(e.target.result);
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(texto, "text/xml");
          try {
            const nfdoks = xmlDoc.getElementsByTagName("nfdok");
            if (nfdoks.length > 0) {
              for (let i = 0; i < nfdoks.length; i++) {
                const doc = nfdoks[i];
                let situacao = doc.getElementsByTagName("SituacaoNf")[0]?.textContent.trim() || "Normal";
                if (situacao.toUpperCase() !== "NORMAL") continue;
                let cliente = doc.getElementsByTagName("ClienteNomeRazaoSocial")[0]?.textContent.trim() || "";
                cliente = removeAcentos(cliente.replace(/�/g, "A")).toUpperCase();
                let dataEmissao = doc.getElementsByTagName("DataEmissao")[0]?.textContent.trim() || "";
                dataEmissao = dataEmissao.split(" ")[0];
                let produto = doc.getElementsByTagName("DescricaoServico")[0]?.textContent.trim() || "Produto";
                produto = removeAcentos(produto).toUpperCase();
                let numeroNota = doc.getElementsByTagName("NumeroNota")[0]?.textContent.trim() || "";
                numeroNota = numeroNota.toUpperCase();
                let municipio = doc.getElementsByTagName("ClienteCidade")[0]?.textContent.trim() || "";
                municipio = removeAcentos(municipio.replace(/�/g, "A")).toUpperCase();
                let uf = doc.getElementsByTagName("ClienteUF")[0]?.textContent.trim() || "";
                uf = removeAcentos(uf).toUpperCase();
                const local = municipio && uf ? `${municipio} - ${uf}` : municipio || uf;
                let cnpjDest = doc.getElementsByTagName("ClienteCNPJCPF")[0]?.textContent.trim() || "";
                cnpjDest = cnpjDest.replace(/\D/g, "");
                if (cnpjDest.length === 14) cnpjDest = formatarCNPJString(cnpjDest);
                const valorNota = doc.getElementsByTagName("ValorTotalNota")[0]?.textContent.trim();
                let notaExistente = false;
                const linhasTabela = tabela.getElementsByTagName("tr");
                for (const linha of linhasTabela) {
                  const colunaCliente = linha.cells[0]?.textContent.trim();
                  const colunaProduto = linha.cells[2]?.textContent.trim();
                  const colunaNumeroNota = linha.cells[3]?.textContent.trim();
                  if (
                    colunaCliente === cliente &&
                    colunaProduto === produto &&
                    colunaNumeroNota === numeroNota
                  ) {
                    notaExistente = true;
                    break;
                  }
                }
                if (!notaExistente) {
                  const novaLinha = tabela.insertRow();
                  const colunas = [
                    cliente,
                    formatarData(dataEmissao),
                    produto,
                    numeroNota,
                    local,
                    cnpjDest,
                    formatarMoeda(valorNota)
                  ];
                  colunas.forEach(texto => {
                    let cell = novaLinha.insertCell();
                    cell.textContent = texto;
                  });
                  adicionarBotoesAcao(novaLinha);
                  const valorNumerico = parseFloat(
                    valorNota.replace("R$", "").replace(/\./g, "").replace(",", ".")
                  );
                  if (!isNaN(valorNumerico)) valorTotal += valorNumerico;
                  contadorNotasImportadas++;
                }
              }
            } else {
              let situacao = xmlDoc.getElementsByTagName("SituacaoNf")[0]?.textContent.trim() || "Normal";
              if (situacao.toUpperCase() !== "NORMAL") return;
              let cliente = xmlDoc.getElementsByTagName("xNome")[1]?.textContent.trim() || "";
              cliente = removeAcentos(cliente.replace(/�/g, "A")).toUpperCase();
              let dataEmissao = xmlDoc.getElementsByTagName("dhEmi")[0]?.textContent.trim().split("T")[0];
              let produto = "PRODUTO";
              let numeroNota = xmlDoc.getElementsByTagName("nNF")[0]?.textContent.trim() || "";
              numeroNota = numeroNota.toUpperCase();
              let bairro = xmlDoc.getElementsByTagName("xBairro")[0]?.textContent.trim() || "";
              bairro = removeAcentos(bairro.replace(/�/g, "A")).toUpperCase();
              let municipio = xmlDoc.getElementsByTagName("xMun")[0]?.textContent.trim() || "";
              municipio = removeAcentos(municipio).toUpperCase();
              const local = `${bairro} - ${municipio}`;
              let cnpjDest = xmlDoc.getElementsByTagName("CNPJ")[1]?.textContent.trim() || "";
              cnpjDest = cnpjDest.replace(/\D/g, "");
              if (cnpjDest.length === 14) cnpjDest = formatarCNPJString(cnpjDest);
              const valorNota = xmlDoc.getElementsByTagName("vPag")[0]?.textContent.trim();
              let notaExistente = false;
              const linhasTabela = tabela.getElementsByTagName("tr");
              for (const linha of linhasTabela) {
                const colunaCliente = linha.cells[0]?.textContent.trim();
                const colunaProduto = linha.cells[2]?.textContent.trim();
                const colunaNumeroNota = linha.cells[3]?.textContent.trim();
                if (
                  colunaCliente === cliente &&
                  colunaProduto === produto &&
                  colunaNumeroNota === numeroNota
                ) {
                  notaExistente = true;
                  break;
                }
              }
              if (!notaExistente) {
                const novaLinha = tabela.insertRow();
                const colunas = [
                  cliente,
                  formatarData(dataEmissao),
                  produto,
                  numeroNota,
                  local,
                  cnpjDest,
                  formatarMoeda(valorNota)
                ];
                colunas.forEach(texto => {
                  let cell = novaLinha.insertCell();
                  cell.textContent = texto;
                });
                adicionarBotoesAcao(novaLinha);
                const valorNumerico = parseFloat(
                  valorNota.replace("R$", "").replace(/\./g, "").replace(",", ".")
                );
                if (!isNaN(valorNumerico)) valorTotal += valorNumerico;
                contadorNotasImportadas++;
              }
            }
          } catch (error) {
            console.error(`Erro ao processar ${arquivo.name}:`, error);
          }
        };
        leitor.readAsArrayBuffer(arquivo);
      }
      setTimeout(() => {
        atualizarTotal(valorTotal);
        document.getElementById("label-notas-importadas").textContent =
          `Notas importadas corretamente: ${contadorNotasImportadas}`;
      }, 100);
    }
  
    function atualizarTotal() {
      let total = 0;
      const linhas = document.querySelectorAll("#tabela-movimentacoes tbody tr");
      linhas.forEach(linha => {
        const valorCell = linha.cells[6].textContent;
        const valorNumerico = parseFloat(
          valorCell.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
        );
        if (!isNaN(valorNumerico)) {
          total += valorNumerico;
        }
      });
      document.getElementById("total-valor").innerHTML =
        `<strong>R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>`;
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
  
    function removeAcentos(texto) {
      if (!texto) return "";
      return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
  
    if (uploadBtn) {
      uploadBtn.addEventListener("click", selecionarArquivosXML);
    }
  
    function toggleMenu() {
      const sidebar = document.querySelector(".sidebar");
      const toggleBtn = document.querySelector(".toggle-btn");
      sidebar.classList.toggle("active");
      toggleBtn.classList.toggle("active");
      if (sidebar.classList.contains("active")) {
        toggleBtn.textContent = "✕";
        toggleBtn.style.color = "white";
        localStorage.setItem("menuOpen", "true");
      } else {
        toggleBtn.textContent = "☰";
        toggleBtn.style.color = "black";
        localStorage.setItem("menuOpen", "false");
      }
    }
  
    function loadMenuState() {
      const sidebar = document.querySelector(".sidebar");
      const toggleBtn = document.querySelector(".toggle-btn");
      if (localStorage.getItem("menuOpen") === "true") {
        sidebar.classList.add("active");
        toggleBtn.textContent = "✕";
        toggleBtn.style.color = "white";
      } else {
        sidebar.classList.remove("active");
        toggleBtn.textContent = "☰";
        toggleBtn.style.color = "black";
      }
    }
  
    carregarScriptMovimentacoes();
  });
  