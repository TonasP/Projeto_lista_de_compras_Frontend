function abrirModalEdicao(id, nome, quantidadeCompleta, comentario, contexto) {
    const modal = document.getElementById('modalEdicao');
    
    document.getElementById('editId').value = id;
    document.getElementById('editContexto').value = contexto;
    document.getElementById('editNome').value = nome;

    // Lógica para separar o número da unidade de medida (ex: de "2kg" para "2" e "kg")
    let numero = '';
    let unidade = 'un'; // Valor padrão

    if (quantidadeCompleta && quantidadeCompleta !== 'undefined' && quantidadeCompleta !== 'null') {
        // Tenta extrair apenas os números da string
        numero = parseFloat(quantidadeCompleta) || '';
        
        // Remove os números da string original para sobrar apenas a unidade (letras)
        unidade = quantidadeCompleta.toString().replace(numero, '').trim().toLowerCase();
        
        // Se por acaso a unidade vier vazia ou não existir no select, força para 'un'
        if (!unidade) unidade = 'un';
    }

    document.getElementById('editQuantidade').value = numero;
    document.getElementById('editUnidade').value = unidade;
    
    document.getElementById('editComentario').value = comentario !== 'undefined' && comentario !== 'null' ? comentario : '';

    // Mostra o modal
    modal.classList.remove('hidden');
}

// Função para fechar o modal
function fecharModalEdicao() {
    document.getElementById('modalEdicao').classList.add('hidden');
}

// Função que gerencia o salvamento com base em onde você está
async function salvarEdicao() {
    const id = document.getElementById('editId').value;
    const contexto = document.getElementById('editContexto').value;
    
    // Pega o número e a unidade
    const qtdNum = document.getElementById('editQuantidade').value;
    const unidade = document.getElementById('editUnidade').value;
    
    // Junta no mesmo padrão que você já usa (ex: "2kg" ou "1un" se estiver vazio)
    const quantidadeFinal = `${qtdNum || '1'}${unidade}`;
    
    const comentario = document.getElementById('editComentario').value;

    const token = localStorage.getItem('tokenListaCompras');

    try {
        if (contexto === 'lista') {
            await fetch(`${API}/lista/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    quantidade: quantidadeFinal, // Envia a string formatada
                    comentario: comentario
                })
            });
            
            listarItems(paginaAtual); 
        } 
        else if (contexto === 'catalogo') {
            await fetch(`${API}/catalogo/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    quantidade_padrao: quantidadeFinal,
                    descricao: comentario
                })
            });
            
            // listarCatalogo(); // Descomente quando a função do catálogo existir
        }

        alert("Item atualizado com sucesso!");
        fecharModalEdicao();

    } catch (erro) {
        console.error("Erro ao salvar edição:", erro);
        alert("Houve um erro ao atualizar o item.");
    }
}