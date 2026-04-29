function abrirModalEdicao(id, param1, param2, param3, contexto) {
    const modal = document.getElementById('modalEdicao');
    
    document.getElementById('editId').value = id;
    document.getElementById('editContexto').value = contexto;

    // Elementos de layout que vamos alternar
    const grupoQtd = document.getElementById('grupoQuantidadeEdicao');
    const grupoProd = document.getElementById('grupoProdutoEdicao');
    const inputNome = document.getElementById('editNome');
    const labelNome = document.getElementById('labelEditNome');
    const labelComentario = document.getElementById('labelEditComentario');

    // MODO DICAS
    if (contexto === 'dicas') {
        labelNome.innerText = "Título da Dica";
        inputNome.value = param1; // No modo dica, param1 é o título
        inputNome.disabled = false; // Permite editar o título da dica

        labelComentario.innerText = "Descrição";
        document.getElementById('editComentario').value = param3; // param3 é a descrição
        
        // Esconde Quantidade e Mostra Produto
        grupoQtd.classList.add('hidden');
        grupoProd.classList.remove('hidden');
        document.getElementById('editProdutoDica').value = param2; // param2 é o produto
    } 
    // MODO LISTA / CATÁLOGO
    else {
        labelNome.innerText = "Nome do Item";
        inputNome.value = param1;
        inputNome.disabled = true; // Não permite editar o nome do produto

        labelComentario.innerText = "Observação";
        document.getElementById('editComentario').value = param3 !== 'undefined' ? param3 : '';
        
        // Mostra Quantidade e Esconde Produto
        grupoQtd.classList.remove('hidden');
        grupoProd.classList.add('hidden');

        // Lógica de separar unidade (ex: "2kg" -> "2" e "kg")
        let numero = '';
        let unidade = 'un';
        if (param2 && param2 !== 'undefined' && param2 !== 'null') {
            numero = parseFloat(param2) || '';
            unidade = param2.toString().replace(numero, '').trim().toLowerCase();
            if (!unidade) unidade = 'un';
        }
        document.getElementById('editQuantidade').value = numero;
        document.getElementById('editUnidade').value = unidade;
    }

    modal.classList.remove('hidden');
}

function fecharModalEdicao() {
    document.getElementById('modalEdicao').classList.add('hidden');
}

async function salvarEdicao() {
    const id = document.getElementById('editId').value;
    const contexto = document.getElementById('editContexto').value;
    const comentario = document.getElementById('editComentario').value;
    const token = localStorage.getItem('tokenListaCompras');

    try {
        if (contexto === 'dicas') {
            const titulo = document.getElementById('editNome').value;
            const produto = document.getElementById('editProdutoDica').value;

            await fetch(`${API}/dicas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    titulo: titulo,
                    produto_nome: produto,
                    descricao: comentario
                })
            });
            listarItems(paginaAtual); // Atualiza a tela de dicas
        } 
        else if (contexto === 'lista') {
            const qtdNum = document.getElementById('editQuantidade').value;
            const unidade = document.getElementById('editUnidade').value;
            const quantidadeFinal = `${qtdNum || '1'}${unidade}`;

            await fetch(`${API}/lista/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    quantidade: quantidadeFinal,
                    comentario: comentario
                })
            });
            listarItems(paginaAtual); // Atualiza a tela da lista
        }

        alert("Alteração salva com sucesso!");
        fecharModalEdicao();

    } catch (erro) {
        // console.error("Erro ao salvar edição:", erro);
        alert("Houve um erro ao atualizar os dados.");
    }
}