const API = "http://127.0.0.1:3000"

let paginaAtual = 1

let offset = 0

const limit = 6
let btnDeletar = document.querySelector('.delete')
let btnFinalizar = document.querySelector('.confirm')

let catalogoCompleto = [];
let itensParaAdicionar = [];
let itemEmEdicao = null;
document.addEventListener("DOMContentLoaded", async () => {
    const tokenValido = await validarToken();

    if (tokenValido) {
        listarItems(1);
        selectCard()
    }
})

async function listarItems(pagina) {
    paginaAtual = pagina;
    const offset = (pagina - 1) * limit;

    // --- MUDANÇA DE SEGURANÇA AQUI ---
    // Tenta pegar o elemento
    const inputBusca = document.getElementById('inputBuscaLista');
    
    // Se o elemento existir, pega o valor. Se não existir, usa vazio ""
    // Isso evita o erro "Cannot read property 'value' of null"
    const termoBusca = inputBusca ? inputBusca.value : ""; 
    // ----------------------------------

    try {
        const token = localStorage.getItem('tokenListaCompras');
        
        let url = `${API}/lista?limit=${limit}&offset=${offset}`;
        
        // Só adiciona na URL se tiver algo escrito
        if (termoBusca) {
            url += `&busca=${encodeURIComponent(termoBusca)}`;
        }

        console.log("Buscando URL:", url); // <--- OLHE ISSO NO CONSOLE (F12)

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Verificação de Token Expirado (Importante!)
        if (response.status === 401 || response.status === 403) {
             console.warn("Sessão expirada");
             // window.location.href = "../login/index.html"; // Descomente se quiser redirecionar
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
        alert("Erro ao carregar lista. Verifique o console (F12).");
    }
}

function filtrarListaPrincipal() {
    // Quando pesquisamos, sempre voltamos para a primeira página
    listarItems(1);
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

    listarItems(novaPagina);
}
async function criarCard(itens) {
    let comentario = itens.comentario
    const idReal = itens.id || itens.lista_id;
    if (!comentario) {
        comentario = 'Nenhuma instrução adicional.'
    }
    const listaCards = document.getElementById('lista')
    listaCards.innerHTML += `
        <div class="cards" id="card-${idReal}" 
             data-id="${idReal}" 
             data-produtoid="${itens.produto_id}" 
             data-nome="${itens.produto_nome}"
             data-categoria="${itens.produto_categoria}"
             data-quantidade="${itens.quantidade}"
             data-comentario="${comentario}">
                    <div class="lateral" id="lateral">
                        <p class="decoracaoLateral"></p>
                    </div>
                    <div class="checkboxCard" id="checkboxCard">
                        <input type="checkbox" class="checkbox">
                    </div>
                    <div class="meio">
                        <div class="topoInfos">
                            <div class="titulo">
                                <h2 id="nome" class="nome">${itens.produto_nome}</h1>
                            </div>
                            <div id="infos" class="infos">
                                <p id="quantia" class="quantia">${itens.quantidade}</p>
                                <p id="cat" class="cat">${itens.produto_categoria}</p>
                            </div>
                        </div>
                        <div class="descricao" id="descricao">
                            <p>${comentario}</p>
                        </div>
                    </div>
                </div>
        `
}
function selectCard() {
    const listagem = document.getElementById('lista');

    listagem.addEventListener("click", (f) => {

        const cardClicado = f.target.closest('.cards');

        if (!cardClicado) return;

        const checkboxDoCard = cardClicado.querySelector('.checkbox');

        if (checkboxDoCard) {
            checkboxDoCard.classList.toggle('checkboxChecked');
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
        btnFinalizar.classList.add('addFinalizar')
    }
    else {
        btnDeletar.classList.remove('deleteMostrar')
        btnFinalizar.classList.remove('addFinalizar')
    }
}

async function abrirModalAdicionar() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('hidden');

    
    itensParaAdicionar = [];
    atualizarResumoStage();
    voltarParaSelecao();

    try {
        const token = localStorage.getItem('tokenListaCompras');
        
        const response = await fetch(`${API}/catalogo`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        catalogoCompleto = await response.json();
        renderizarCatalogo(catalogoCompleto.itens);
    } catch (erro) {
        console.error("Erro ao buscar catálogo", erro);
        alert("Erro ao carregar itens do catálogo.");
    }
}

function fecharModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
}


function renderizarCatalogo(lista) {
    const grid = document.getElementById('gridCatalogo');
    grid.innerHTML = '';

    lista.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-catalogo';
        card.innerHTML = `
            <strong>${item.nome}</strong><br>
            <small>${item.categoria}</small>
        `;
       
        card.onclick = () => abrirTelaConfiguracao(item);
        grid.appendChild(card);
    });
}

function filtrarCatalogo() {
    const termo = document.getElementById('inputBuscaCatalogo').value.toLowerCase();
    const filtrados = catalogoCompleto.filter(item =>
        item.nome.toLowerCase().includes(termo) ||
        item.categoria.toLowerCase().includes(termo)
    );
    renderizarCatalogo(filtrados);
}


function abrirTelaConfiguracao(item) {
    itemEmEdicao = item;

    
    document.getElementById('nomeItemConfig').innerText = item.nome;
    document.getElementById('catItemConfig').innerText = item.categoria;
    document.getElementById('inputQtd').value = '';
    document.getElementById('inputObs').value = '';

    
    document.getElementById('telaSelecao').classList.add('hidden');
    document.getElementById('telaConfiguracao').classList.remove('hidden');
}

function voltarParaSelecao() {
    document.getElementById('telaConfiguracao').classList.add('hidden');
    document.getElementById('telaSelecao').classList.remove('hidden');
    itemEmEdicao = null;
}


function confirmarItemNoStage() {
    const qtdValor = document.getElementById('inputQtd').value;
    const unidade = document.getElementById('selectUnidade').value;
    const obs = document.getElementById('inputObs').value;

    if (!qtdValor) {
        alert("Por favor, informe a quantidade.");
        return;
    }

   
    const novoItem = {
        produto_id: itemEmEdicao.id, 
        nome: itemEmEdicao.nome,     
        quantidade: `${qtdValor}${unidade}`, 
        comentario: obs
    };

    itensParaAdicionar.push(novoItem);

    atualizarResumoStage();
    voltarParaSelecao();
}


function atualizarResumoStage() {
    const areaResumo = document.getElementById('areaResumo');
    const lista = document.getElementById('listaStage');
    const contador = document.getElementById('contadorStage');

    lista.innerHTML = '';
    contador.innerText = itensParaAdicionar.length;

    if (itensParaAdicionar.length > 0) {
        areaResumo.classList.remove('hidden');

        itensParaAdicionar.forEach((item, index) => {
            lista.innerHTML += `
                <li>
                    <span>${item.nome} - ${item.quantidade}</span>
                    <button onclick="removerDoStage(${index})" style="color:red; border:none; background:none; cursor:pointer;">&times;</button>
                </li>
            `;
        });
    } else {
        areaResumo.classList.add('hidden');
    }
}

function removerDoStage(index) {
    itensParaAdicionar.splice(index, 1);
    atualizarResumoStage();
}

async function salvarTudoNoBanco() {
    const token = localStorage.getItem('tokenListaCompras');

    
    const promessas = itensParaAdicionar.map(item => {
        return fetch(`${API}/lista`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                produto_id: item.produto_id,
                quantidade: item.quantidade,
                comentario: item.comentario
            })
        });
    });

    try {
        await Promise.all(promessas);
        alert("Todos os itens foram adicionados com sucesso!");
        fecharModal();
        listarItems();
    } catch (erro) {
        console.log("Erro ao salvar itens", erro.message);
        alert("Houve um erro ao salvar alguns itens.");
    }
}
function pegarItensSelecionados() {
    const cardsMarcados = document.querySelectorAll('.cardsChecked'); // Corrigido o ponto

    return Array.from(cardsMarcados).map(card => ({
        id: card.dataset.id,              // ID da Lista (para a URL)
        produto_id: card.dataset.produtoid, // ID do Produto (para o Body)
        quantidade: card.dataset.quantidade,
        comentario: card.dataset.comentario
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
        await fetch(`${API}/lista/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
    }
    listarItems(paginaAtual)
}
async function finalizarCompra() {

    const itens = pegarItensSelecionados();
    const token = localStorage.getItem('tokenListaCompras');

    if (itens.length === 0) {
        alert('Nenhum item selecionado');
        return;
    }

    if (!confirm(`Tem certeza que deseja finalizar a compra de ${itens.length} itens?`)) return;


    for (const item of itens) {
        try {

            const corpoDaRequisicao = {
                produto_id: item.produto_id,
                quantidade: item.quantidade,
                status: 'comprado',
                data_compra: new Date(),
                comentario: item.comentario || ""
            };
            console.log(corpoDaRequisicao)
            console.log(item.id)

            await fetch(`${API}/lista/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(corpoDaRequisicao)
            });

        } catch (erro) {
            console.error(`Erro ao finalizar item ${item.id}`, erro);
        }
    }

    alert("Itens marcados como comprados!");


    listarItems(paginaAtual);

    document.querySelector('.delete').classList.remove('deleteMostrar');
    document.querySelector('.confirm').classList.remove('addFinalizar');
}
const listagem = document.getElementById("lista")