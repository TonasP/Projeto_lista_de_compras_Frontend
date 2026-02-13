const API = "http://127.0.0.1:3000"

let paginaAtual = 1

let offset = 0

const limit = 9
let btnDeletar = document.querySelector('.delete')
let btnFinalizar = document.querySelector('.confirm')

let catalogoCompleto = [];
let itensParaAdicionar = [];
let itemEmEdicao = null;
document.addEventListener("DOMContentLoaded", () => {
    const tokenValido = validarToken();

    if (tokenValido) {
        carregarCategorias(1);
        selectCard()
        
    }
})
async function carregarCategorias(pagina) {
    paginaAtual = pagina;
    const offset = (pagina - 1) * limit;
    const inputBusca = document.getElementById('inputBuscaLista');


    const termoBusca = inputBusca ? inputBusca.value : "";
    // ----------------------------------

    try {
        const token = localStorage.getItem('tokenListaCompras');

        let url = `${API}/catalogo?limit=${limit}&offset=${offset}`;


        if (termoBusca) {
            url += `&busca=${encodeURIComponent(termoBusca)}`;
        }

        console.log("Buscando URL:", url);

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            console.warn("Sessão expirada");
            return;
        }

        const data = await response.json();

        const lista = data.itens || (Array.isArray(data) ? data : []);
        const total = data.total || lista.length;

        totalPaginas = Math.ceil(total / limit);

        const listaContainer = document.getElementById('lista');
        listaContainer.innerHTML = "";

        if (lista.length === 0) {
            listaContainer.innerHTML = "<p>Nenhum item encontrado.</p>";
            renderizarPaginacao();
            return;
        }

        lista.forEach(item => criarCard(item));
        renderizarPaginacao();

    } catch (erro) {
        console.error("Erro CRÍTICO ao listar:", erro);
    }
}
async function criarCard(item) {
    const listaCards = document.getElementById('lista')
     const idReal = item.id || item.lista_id;
   
    listaCards.innerHTML += `
     <div class="cards" id ="card-${idReal}"
            data-id="${idReal}" 
             data-nome="${item.nome}"
             data-categoria="${item.categoria}">
     
                <div class="lateral" id="lateral">
                    <p class="decoracaoLateral"></p>
                </div>
                <div class="checkboxCard" id="checkboxCard">
                    <input type="checkbox" class="checkbox">
                </div>
                <div class="meio">
                    <div class="topoInfos">
                        <div class="titulo">
                            <h2 id="nome" class="nome">${item.nome}</h1>
                        </div>
                        <div id="infos" class="infos">
                            <p id="quantia" class="quantia">${item.categoria}</p>
                        </div>
                    </div>

                </div>
            </div>
            `
}

function renderizarPaginacao() {
    const containerBullets = document.getElementById('paginacaoBullets');
    const btnAnterior = document.getElementById('btnAnterior');
    const btnProximo = document.getElementById('btnProximo');

    containerBullets.innerHTML = "";


    btnAnterior.disabled = (paginaAtual === 1);
    btnProximo.disabled = (paginaAtual === totalPaginas || totalPaginas === 0);


    if (totalPaginas <= 1) return;


    for (let i = 1; i <= totalPaginas; i++) {
        const bullet = document.createElement('div');
        bullet.classList.add('bullet');

        if (i === paginaAtual) bullet.classList.add('ativo');

        bullet.onclick = () => listarItems(i);
        containerBullets.appendChild(bullet);
    }
}
function mudarPagina(delta) {
    const novaPagina = paginaAtual + delta;


    if (novaPagina < 1 || novaPagina > totalPaginas) return;

    carregarCategorias(novaPagina);
}

function selectCard() {
    const listagem = document.getElementById('lista');

    listagem.addEventListener("click", (f) => {

        const cardClicado = f.target.closest('.cards');

        if (!cardClicado) return;

        const checkboxDoCard = cardClicado.querySelector('.checkbox');
        const lateralCheck = cardClicado.querySelector('.lateral p')

        if (checkboxDoCard) {
            checkboxDoCard.classList.toggle('checkboxChecked');
            lateralCheck.classList.toggle('lateralChecked')
        }
        cardClicado.classList.toggle('cardsChecked');
        acionarBtnDeleteEAdd()
    });
}
function acionarBtnDeleteEAdd() {
    let checkCardAtivo = document.getElementsByClassName('cardsChecked')
    let checkCheckboxAtivo = document.getElementsByClassName("checkboxChecked")
    if (checkCardAtivo.length > 0 || checkCheckboxAtivo.length > 0) {
        btnDeletar.classList.add('deleteMostrar')
    }
    else {
        btnDeletar.classList.remove('deleteMostrar')
    }
}
function pegarItensSelecionados() {
    const cardsMarcados = document.querySelectorAll('.cardsChecked');

    return Array.from(cardsMarcados).map(card => ({
        id: card.dataset.id,             
        nome: card.dataset.nome, 
        categoria: card.dataset.categoria
        
    }));
}
async function deletarItem() {
    const cards = pegarItensSelecionados()
    const ids = cards.map(item => item.id);
    const token = localStorage.getItem('tokenListaCompras')
    if (ids.length === 0) {
        alert("Nenhum item selecionado")
        return
    }
    if (!confirm(`Tem certeza que deseja deletar ${ids.length} itens`)) return

    for (const id of ids) {
        await fetch(`${API}/catalogo/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
    }
    carregarCategorias(paginaAtual)
}
// --- VARIÁVEIS GLOBAIS ---
let stageCatalogo = []; // Guarda os itens temporariamente antes de salvar

// 1. Abrir e Fechar Modal
function abrirModalAdicionar() {
    document.getElementById('modalCatalogo').classList.remove('hidden');
    
    // Limpa os inputs ao abrir para não ficar "sujo" da última vez
    document.getElementById('inputNomeProduto').value = '';
    document.getElementById('inputNomeProduto').focus();
    
    // Atualiza a visualização caso tenha sobrado algo na lista (ou zera)
    atualizarResumoStageCatalogo();
}

function fecharModalCatalogo() {
    document.getElementById('modalCatalogo').classList.add('hidden');
}

// 2. Adicionar item à variável global (Stage)
function adicionarAoStageCatalogo() {
    const nome = document.getElementById('inputNomeProduto').value;
    const categoria = document.getElementById('selectCategoria').value;

    if (!nome) {
        alert("Por favor, digite o nome do produto.");
        return;
    }

    // Cria o objeto simples
    const novoItem = {
        nome: nome,
        categoria: categoria
    };

    // Salva no array global
    stageCatalogo.push(novoItem);

    // Limpa o input de nome para facilitar adicionar o próximo
    document.getElementById('inputNomeProduto').value = '';
    document.getElementById('inputNomeProduto').focus();

    // Atualiza a lista visual
    atualizarResumoStageCatalogo();
}

// 3. Atualiza a lista visual do resumo (HTML)
function atualizarResumoStageCatalogo() {
    const areaResumo = document.getElementById('areaResumoCatalogo');
    const listaHtml = document.getElementById('listaStageCatalogo');
    const contador = document.getElementById('contadorStageCatalogo');

    listaHtml.innerHTML = ''; // Limpa a lista atual
    contador.innerText = stageCatalogo.length;

    if (stageCatalogo.length > 0) {
        areaResumo.classList.remove('hidden');

        // Renderiza cada item da lista temporária
        stageCatalogo.forEach((item, index) => {
            listaHtml.innerHTML += `
                <li>
                    <span><strong>${item.nome}</strong> (${item.categoria})</span>
                    <button onclick="removerDoStageCatalogo(${index})" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">&times;</button>
                </li>
            `;
        });
    } else {
        areaResumo.classList.add('hidden');
    }
}

// 4. Remover um item específico da lista temporária
function removerDoStageCatalogo(index) {
    stageCatalogo.splice(index, 1); // Remove 1 item na posição index
    atualizarResumoStageCatalogo();
}

// 5. FINALMENTE: Enviar tudo para o Backend
async function salvarTudoNoCatalogo() {
    const token = localStorage.getItem('tokenListaCompras');

    if (stageCatalogo.length === 0) return;

    // Cria um array de promessas (vários fetchs acontecendo ao mesmo tempo)
    // Supondo que sua API aceita POST em /catalogo
    const promessas = stageCatalogo.map(item => {
        return fetch(`${API}/catalogo`, { // <--- Verifique se a rota é essa
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome: item.nome,
                categoria: item.categoria
            })
        });
    });

    try {
        // Espera todos serem salvos
        await Promise.all(promessas);
        
        alert("Todos os produtos foram cadastrados com sucesso!");
        
        // Limpeza final
        stageCatalogo = []; // Zera o array global
        atualizarResumoStageCatalogo(); // Limpa visual
        fecharModalCatalogo(); // Fecha modal
        carregarCategorias(1); // Recarrega a lista principal na tela

    } catch (erro) {
        console.error("Erro ao salvar catálogo", erro);
        alert("Houve um erro ao salvar alguns itens.");
    }
}