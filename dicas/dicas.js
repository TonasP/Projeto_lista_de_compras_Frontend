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

        let url = `${API}/dicas?limit=${limit}&offset=${offset}`;

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
    // Pegamos as propriedades do banco. 
    // OBS: Ajuste 'itens.titulo', 'itens.produto_nome' e 'itens.descricao' se os nomes das colunas no seu banco de dados forem diferentes!
    const idReal = itens.id;
    const titulo = itens.titulo || "Dica Sem Título";
    const produtoNome = itens.produto_nome || "Sem item relacionado";
    const descricao = itens.descricao || "Nenhuma descrição fornecida.";

    const listaCards = document.getElementById('lista');
    
    // Removi alguns data-attributes que eram exclusivos da "Lista" (como quantidade)
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
        </div>
    `;
}

// ==========================================
// FUNÇÕES DO MODAL DE DICAS
// ==========================================

function abrirModalAdicionar() {
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function fecharModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
    // Limpa os campos sempre que fechar
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
        alert("Por favor, preencha todos os campos da dica.");
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
            alert("Dica salva com sucesso!");
            fecharModal();
            listarItems(1); 
        } else {
            alert("Houve um problema ao salvar a dica. Verifique o servidor.");
        }
    } catch (erro) {
        console.error("Erro ao salvar dica:", erro);
        alert("Erro de conexão ao salvar a dica.");
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
        btnFinalizar.classList.add('addFinalizar')
    }
    else {
        btnDeletar.classList.remove('deleteMostrar')
        btnFinalizar.classList.remove('addFinalizar')
    }
}
