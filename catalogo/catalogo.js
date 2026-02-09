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
async function carregarCategorias(pagina){
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