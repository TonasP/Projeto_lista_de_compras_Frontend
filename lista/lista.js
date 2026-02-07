const API = "http://127.0.0.1:3000"

let limit = 0
let btnDeletar = document.querySelector('.delete')
let btnFinalizar = document.querySelector('.confirm')
document.addEventListener("DOMContentLoaded", () => {
    listarItems()
    selectCard()
    
})




async function listarItems() {
    const token = localStorage.getItem('tokenListaCompras');
    try {
        const response = await fetch(`${API}/lista?limit=${limit}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}` },
            
            
        })
        const data = await response.json()
        const itens = Array.isArray(data) ? data : data.array;
        itens.forEach(c => criarCard(c));
    }
    catch (erro) {
        console.log("Não foi possivel listar os cards", erro)
    }
}
async function criarCard(c) {
    let comentario = c.comentario
     if (!comentario){   
        comentario = 'Nenhuma instrução adicional.'
    }
    const listaCards = document.getElementById('lista')
    listaCards.innerHTML+=`
        <div class="cards" id = "cards">
                    <div class="lateral" id="lateral">
                        <p class="decoracaoLateral"></p>
                    </div>
                    <div class="checkboxCard" id="checkboxCard">
                        <input type="checkbox" class="checkbox">
                    </div>
                    <div class="meio">
                        <div class="topoInfos">
                            <div class="tit">
                                <h2 id="nome" class="nome">${c.produto_nome}</h1>
                            </div>
                            <div id="infos" class="infos">
                                <p id="quantia" class="quantia">${c.quantidade}</p>
                                <p id="cat" class="cat">${c.produto_categoria}</p>
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
function acionarBtnDeleteEAdd(){
    let checkCardAtivo = document.getElementsByClassName('cardsChecked')
    let checkCheckboxAtivo = document.getElementsByClassName("checkboxChecked")
    if (checkCardAtivo.length >0 || checkCheckboxAtivo.length >0 ){
        btnDeletar.classList.add('deleteMostrar')
        btnFinalizar.classList.add('addFinalizar')
    }
    else{
        btnDeletar.classList.remove('deleteMostrar')
        btnFinalizar.classList.remove('addFinalizar')
    }
}
const listagem = document.getElementById("lista")