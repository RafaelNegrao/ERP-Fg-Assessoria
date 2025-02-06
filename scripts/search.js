
    document.getElementById("btn-consultar").addEventListener("click", atualizarTabelas);

    const dados = [
        { cliente: "Cliente 1", data: "2024-02-01", tipoNota: "PRODUTO", numeroNota: "12345", municipio: "São Paulo", cnpj: "12.345.678/0001-99", valor: "R$ 1.000,00" },
        { cliente: "Cliente 1", data: "2024-02-08", tipoNota: "PRODUTO", numeroNota: "12345", municipio: "São Paulo", cnpj: "12.345.678/0001-99", valor: "R$ 6.000,00" },
        { cliente: "Cliente 2", data: "2024-02-02", tipoNota: "SERVIÇO", numeroNota: "54321", municipio: "Rio de Janeiro", cnpj: "98.765.432/0001-11", valor: "R$ 500,00" },
        { cliente: "Cliente 3", data: "2024-02-03", tipoNota: "SERVIÇO", numeroNota: "67890", municipio: "Curitiba", cnpj: "45.678.901/0001-22", valor: "R$ 750,00" },
        { cliente: "Cliente 4", data: "2024-02-04", tipoNota: "SERVIÇO", numeroNota: "98765", municipio: "Florianópolis", cnpj: "32.109.876/0001-33", valor: "R$ 900,00" },
        { cliente: "Cliente 5", data: "2024-02-05", tipoNota: "PRODUTO", numeroNota: "11223", municipio: "Porto Alegre", cnpj: "67.890.123/0001-44", valor: "R$ 1.200,00" },
        { cliente: "Cliente 6", data: "2024-02-06", tipoNota: "PRODUTO", numeroNota: "44556", municipio: "Belo Horizonte", cnpj: "78.901.234/0001-55", valor: "R$ 650,00" },
        { cliente: "Cliente 7", data: "2024-02-07", tipoNota: "PRODUTO", numeroNota: "77889", municipio: "Salvador", cnpj: "89.012.345/0001-66", valor: "R$ 850,00" },
        { cliente: "Cliente 8", data: "2024-02-08", tipoNota: "PRODUTO", numeroNota: "99000", municipio: "Recife", cnpj: "90.123.456/0001-77", valor: "R$ 1.100,00" },
        { cliente: "Cliente 9", data: "2024-02-09", tipoNota: "SERVIÇO", numeroNota: "11122", municipio: "Fortaleza", cnpj: "01.234.567/0001-88", valor: "R$ 700,00" },
        { cliente: "Cliente 10", data: "2024-02-10", tipoNota: "PRODUTO", numeroNota: "22334", municipio: "Manaus", cnpj: "12.345.678/0001-99", valor: "R$ 950,00" }
    ];

    const clientes = [
        { id: 1, nome: "Cliente 1", municipio: "São José", uf: "SP", cnpj: "00.000.000/0001-01", valor: 2000, data: "2024-02-01", tipoNota: "Entrada", numeroNota: "1001" },
        { id: 2, nome: "Cliente 2", municipio: "Rio de Janeiro", uf: "RJ", cnpj: "11.111.111/0001-02", valor: 3500, data: "2024-02-02", tipoNota: "Saída", numeroNota: "1002" },
        { id: 3, nome: "Cliente 3", municipio: "Curitiba", uf: "PR", cnpj: "22.222.222/0001-03", valor: 1800, data: "2024-02-03", tipoNota: "Entrada", numeroNota: "1003" },
        { id: 4, nome: "Cliente 1", municipio: "São José", uf: "SP", cnpj: "33.333.333/0001-04", valor: 5000, data: "2024-02-04", tipoNota: "Saída", numeroNota: "1004" }
    ];

    // Função para formatar moeda
    function formatarMoeda(valor) {
        return `R$ ${parseFloat(valor.replace("R$ ", "").replace(".", "").replace(",", ".")).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    }

    // Função para atualizar as tabelas com base no filtro de cliente e período
    function atualizarTabelas() {
        const tabelaMovimentos = document.querySelector("#tabela-movimentacoes tbody");
        const tabelaMunicipios = document.querySelector("#tabela-municipios tbody");
        tabelaMovimentos.innerHTML = "";
        tabelaMunicipios.innerHTML = "";

        let totalGeral = 0;
        const totaisMunicipios = {};

        const clienteSelecionado = document.getElementById("cliente").value;
        const dataInicio = document.getElementById("data-de").value;
        const dataFim = document.getElementById("data-ate").value;

        // Filtrando os dados
        const dadosFiltrados = dados.filter(dado => {
            const dentroPeriodo = (!dataInicio || !dataFim || (dado.data >= dataInicio && dado.data <= dataFim));
            const correspondeCliente = clienteSelecionado === "" || dado.cliente === clienteSelecionado;
            return dentroPeriodo && correspondeCliente;
        });

        if (dadosFiltrados.length === 0) {
            alert("Nenhuma nota fiscal encontrada no período selecionado.");
            return;
        }

        // Criar tabela de movimentações
        dadosFiltrados.forEach(dado => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${dado.cliente}</td>
                <td>${dado.data}</td>
                <td>${dado.tipoNota}</td>
                <td>${dado.numeroNota}</td>
                <td>${dado.municipio}</td>
                <td>${dado.cnpj}</td>
                <td>${formatarMoeda(dado.valor)}</td>
                <td><button class="btn-acao">Ver</button></td>
            `;
            tabelaMovimentos.appendChild(row);

            // Somar valor total
            totalGeral += parseFloat(dado.valor.replace("R$ ", "").replace(".", "").replace(",", "."));

            // Agrupar por município
            const chaveMunicipio = dado.municipio;
            if (!totaisMunicipios[chaveMunicipio]) {
                totaisMunicipios[chaveMunicipio] = 0;
            }
            totaisMunicipios[chaveMunicipio] += parseFloat(dado.valor.replace("R$ ", "").replace(".", "").replace(",", "."));
        });

        // Atualizar total geral
        document.getElementById("totalValor").textContent = formatarMoeda(`R$ ${totalGeral}`);

        // Criar tabela de totais por município
        Object.keys(totaisMunicipios).forEach(municipio => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${municipio}</td>
                <td>${formatarMoeda(`R$ ${totaisMunicipios[municipio]}`)}</td>
            `;
            tabelaMunicipios.appendChild(row);
        });
    }

