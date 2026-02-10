const API = "http://127.0.0.1:3000"

let paginaAtual = 1

let offset = 0

const limit = 6
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
            //renderizarPaginacao();
            return;
        }

        lista.forEach(item => criarCard(item));
        //renderizarPaginacao();

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
function pegarItensSelecionados() {
    const cardsMarcados = document.querySelectorAll('.cardsChecked');

    return Array.from(cardsMarcados).map(card => ({
        id: card.dataset.id,             
        nome: card.dataset.nome, 
        nome: card.dataset.categoria
    }));
}