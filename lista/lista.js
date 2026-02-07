const API = "http://127.0.0.1:3000"

async function listarItems(){
    try{const response = await  fetch(`${API}/lista`,{
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json
    data.array.forEach(c => criarCard(c));
    }
    catch(erro){
        console.log("Não foi possivel listar os cards", erro)
    }
}
async function criarCard(c){
    const listaCards = document.getElementById('lista')
    listaCards.innerHTML(`
        <div class="cards">
                    <div class="lateral" id="lateral">
                        <p class="decoracaoLateral"></p>
                    </div>
                    <div class="checkboxCard" id="checkboxCard">
                        <input type="checkbox">
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
                            <p>testes</p>
                        </div>
                    </div>

                </div>
        `
    )
}