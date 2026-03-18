const API = "http://127.0.0.1:3000"

let chartPrincipal; 

document.addEventListener("DOMContentLoaded", async () => {
    const tokenValido = await validarToken();
    if (tokenValido) {
        carregarGraficoPrincipal();
    }
});

async function carregarGraficoPrincipal() {
    const tempo = document.getElementById('filtroTempo').value;


    const inputBusca = document.getElementById('inputBuscaLista');
    const termoBusca = inputBusca ? inputBusca.value : "";

    const token = localStorage.getItem('tokenListaCompras');

    document.getElementById('areaDetalhes').classList.add('hidden');

    try {
       
        let url = `${API}/historico/consumo?tempo=${tempo}`;

    
        if (termoBusca) {
            url += `&busca=${encodeURIComponent(termoBusca)}`;
        }

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error(`Erro da API: Status ${response.status}`);
            return;
        }

        const dados = await response.json();

        const nomesProdutos = dados.map(item => item.produto_nome);
        const totais = dados.map(item => parseInt(item.total_vezes_comprado));

        renderizarGrafico(nomesProdutos, totais, tempo);
    } catch (erro) {
        console.error("Erro ao buscar dados do gráfico", erro);
    }
}

function renderizarGrafico(categorias, seriesData, tempoFiltro) {
    const divGrafico = document.getElementById('graficoPrincipal');
    divGrafico.innerHTML = ''; 

    if (chartPrincipal) {
        chartPrincipal.destroy(); 
    }

    const options = {
        series: [{
            name: 'Vezes Comprado',
            data: seriesData
        }],
        chart: {
            type: 'bar',
            height: 350,
            fontFamily: 'Poppins, sans-serif',
            events: {
               
                dataPointSelection: function (event, chartContext, config) {
                    const indexClicado = config.dataPointIndex;
                    const nomeProdutoClicado = categorias[indexClicado];
                    buscarDetalhesProduto(nomeProdutoClicado, tempoFiltro);
                }
            }
        },
        colors: ['#4c7a3e'], 
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
                columnWidth: '50%',
            }
        },
        dataLabels: { enabled: false },
        xaxis: { categories: categorias },
        tooltip: {
            theme: 'light'
        }
    };

    chartPrincipal = new ApexCharts(divGrafico, options);
    chartPrincipal.render();
}

async function buscarDetalhesProduto(produtoNome, tempo) {
    const token = localStorage.getItem('tokenListaCompras');

    try {
        const response = await fetch(`${API}/historico/detalhes/${encodeURIComponent(produtoNome)}?tempo=${tempo}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error(`Erro da API: Status ${response.status}`);
            return;
        }

        const detalhes = await response.json();

        const areaDetalhes = document.getElementById('areaDetalhes');
        const titulo = document.getElementById('tituloDetalheProduto');
        const lista = document.getElementById('listaDetalhesUnidades');

        titulo.innerText = `Consumo Total: ${produtoNome}`;
        lista.innerHTML = '';

        if (detalhes.length === 0) {
            lista.innerHTML = '<li>Nenhum detalhe encontrado.</li>';
        } else {
           
            detalhes.forEach(item => {
                if (item.unidade === 'diversos') {
                    lista.innerHTML += `
                        <li style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">
                            Outros formatos registrados: <strong>${item.total} vezes</strong>
                        </li>
                    `;
                } else {
                    lista.innerHTML += `
                        <li style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 1.1em;">
                            Total Consumido: <strong style="color: var(--cor-terciaria); font-size: 1.2em;">${item.total} ${item.unidade}</strong>
                        </li>
                    `;
                }
            });
        }

        areaDetalhes.classList.remove('hidden');

    } catch (erro) {
        console.error("Erro ao buscar detalhes do produto", erro);
    }
}