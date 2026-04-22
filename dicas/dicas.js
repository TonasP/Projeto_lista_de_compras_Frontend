const API = 'https://lista-de-compras-api-quvq.onrender.com'
let paginaAtual = 1
import cardAviso from "/utilities/cardAviso.js";

let offset = 0

let totalPaginas = 6

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
        sectionUsuario()
        selectCard()
    }
})

async function sectionUsuario() {
    const token = localStorage.getItem('tokenListaCompras')
    let response = await fetch(`${API}/usuario/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    let dadosUsuario = await response.json()
    console.log(dadosUsuario)
    const usuarioSection = document.getElementById('usuarioSection')
    const caminhoDaImagem = dadosUsuario.foto_perfil
        ? `${API}${dadosUsuario.foto_perfil}`
        : "../images/account.png";
    usuarioSection.innerHTML +=
        `
    <div class="infoUsuario">
                    <img src="${caminhoDaImagem}" alt="Icone com foto do usuario">
                    <h3 id="nomeUsuario">${dadosUsuario.usuario}</h3>
                </div>
                <p id="emailUsuario" class="emailUsuario">${dadosUsuario.email}</p>
    `
}

async function listarItems(pagina) {
    paginaAtual = pagina;
    const offset = (pagina - 1) * limit;


    const inputBusca = document.getElementById('inputBuscaLista');

    const termoBusca = inputBusca ? inputBusca.value : "";
    // ----------------------------------

    try {
        const token = localStorage.getItem('tokenListaCompras');

        let url = `${API}/dicas?limit=${limit}&offset=${offset}`;


        if (termoBusca) {
            url += `&busca=${encodeURIComponent(termoBusca)}`;
        }


        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });


        if (response.status === 401 || response.status === 403) {
            console.warn("Sessão expirada");
            window.location.href = "../login/index.html";
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
        cardAviso("Erro ao carregar lista.",1);
    }
}

function filtrarListaPrincipal() {
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

    const idReal = itens.id;
    const titulo = itens.titulo || "Dica Sem Título";
    const produtoNome = itens.produto_nome || "Sem item relacionado";
    const descricao = itens.descricao || "Nenhuma descrição fornecida.";

    const listaCards = document.getElementById('lista');


    listaCards.innerHTML += `
        <div class="cards" id="card-${idReal}" data-id="${idReal}">
            <div class="lateral" id="lateral">
                <p class="decoracaoLateral"></p>
            </div>
            <div class="checkboxCard" id="checkboxCard">
                <input type="checkbox" class="checkbox">
            </div>
            <div class="meio">
                <div class="topoInfos">
                    <div class="titulo">
                        <h2 id="nome" class="nome">${titulo}</h2>
                    </div>
                    <div id="infos" class="infos">
                        <p id="produto" class="produto">${produtoNome}</p>
                    </div>
                </div>
                <div class="descricao" id="descricao">
                    <p>${descricao}</p>
                </div>
            </div>
            <img src ='/images/editImg.svg' class ='imgEditCard' onclick="abrirModalEdicao('${idReal}', '${itens.titulo}', '${itens.produto_nome}', '${itens.descricao}', 'dicas')">
        </div>
    `;
}



function abrirModalAdicionar() {
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function fecharModal() {
    document.getElementById('modalOverlay').classList.add('hidden');

    document.getElementById('inputTituloDica').value = '';
    document.getElementById('inputProdutoDica').value = '';
    document.getElementById('inputDescricaoDica').value = '';
}

async function salvarDica() {
    const titulo = document.getElementById('inputTituloDica').value.trim();
    const produtoNome = document.getElementById('inputProdutoDica').value.trim();
    const descricao = document.getElementById('inputDescricaoDica').value.trim();

    // Validação simples
    if (!titulo || !produtoNome || !descricao) {
        cardAviso("Por favor, preencha todos os campos da dica.",1);
        return;
    }

    const token = localStorage.getItem('tokenListaCompras');

    try {
        const response = await fetch(`${API}/dicas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                titulo: titulo,
                produto_nome: produtoNome,
                descricao: descricao
            })
        });

        if (response.ok) {
            cardAviso("Dica salva com sucesso!",1);
            fecharModal();
            listarItems(1);
        } else {
            cardAviso("Houve um problema ao salvar a dica, Tente mais tarde",1);
        }
    } catch (erro) {
        console.error("Erro ao salvar dica:", erro);
        cardAviso("Erro de conexão ao salvar a dica.",1);
    }
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
    }
    else {
        btnDeletar.classList.remove('deleteMostrar')
    }
}

function pegarItensSelecionados() {
    const cardsMarcados = document.querySelectorAll('.cardsChecked');

    return Array.from(cardsMarcados).map(card => ({
        id: card.dataset.id,
        dica_id: card.dataset.idReal,
        titulo: card.dataset.titulo,
        produtoNome: card.dataset.produtoNome,
        descricao: card.dataset.descricao
    }));
}

async function deletarItem() {
    const cards = pegarItensSelecionados()
    const ids = cards.map(item => item.id);
    const token = localStorage.getItem('tokenListaCompras')
    if (ids.length === 0) {
        cardAviso("Nenhum item selecionado",1)
        return
    }
    if (!confirm(`Tem certeza que deseja deletar ${ids.length} itens`)) return

    for (const id of ids) {
        await fetch(`${API}/dicas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
    }
    listarItems(paginaAtual)
}
window.filtrarListaPrincipal = filtrarListaPrincipal;
window.mudarPagina = mudarPagina;
window.abrirModalAdicionar = abrirModalAdicionar;
window.fecharModal = fecharModal;
window.salvarDica = salvarDica;
window.deletarItem = deletarItem;