async function inicializarModalUsuario() {
    try {
        // Busca o fragmento HTML (Ajuste o caminho '../usuario/' se necessário)
        const response = await fetch('../usuario/usuario.html');
        const html = await response.text();
        
        // Injeta no final do body da página atual
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (erro) {
        console.error("Erro ao carregar o modal de usuário:", erro);
    }
}

// Chamar a injeção assim que o script for carregado
document.addEventListener("DOMContentLoaded", () => {
    inicializarModalUsuario();
});

// ==========================================
// CONTROLES DO MODAL
// ==========================================
async function abrirModalUsuario() {
    const token = localStorage.getItem('tokenListaCompras')
    const modal = document.getElementById('modalUsuarioOverlay');
    if (modal) {
        modal.classList.remove('hidden');
        
        // O 'API' precisa estar definido globalmente na sua página (const API = "http://127.0.0.1:3000")
        const response = await fetch(`${API}/usuario/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        let dadosUsuario = await response.json()

        if (response.ok) {
            const sectionUser = document.getElementById('modal-usuario-content')
             const caminhoDaImagem = dadosUsuario.foto_perfil 
            ? `${API}${dadosUsuario.foto_perfil}` 
            : "../images/account.png";
            sectionUser.innerHTML +=
            `<div class="modal-usuario-header">
            <h2>Meu Perfil</h2>
            <button onclick="fecharModalUsuario()" class="btn-close-usuario">&times;</button>
        </div>

        <div class="modal-usuario-body">
            <div class="perfil-foto-container">
                <img id="imgPerfilModal" src=${caminhoDaImagem} alt="Sua foto de perfil">
                <label for="inputFotoModal" class="btn-alterar-foto">Mudar Foto</label>
                <input type="file" id="inputFotoModal" accept="image/png, image/jpeg" style="display:none;" onchange="salvarNovaFotoModal()">
            </div>

            <div class="perfil-infos">
                <p><strong>Nome:</strong> <span id="modalNomeUsuario">${dadosUsuario.usuario}</span></p>
                <p><strong>E-mail:</strong> <span id="modalEmailUsuario">${dadosUsuario.email}</span></p>
            </div>
        </div>

        <div class="modal-usuario-footer">
            <button onclick="fazerLogout()" class="btn-logout">Sair da Conta</button>
        </div>`
        }
      
        // Opcional: Aqui você pode chamar a rota GET /usuarios/me para preencher nome e email
    }
}

function fecharModalUsuario() {
    const modal = document.getElementById('modalUsuarioOverlay');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function fazerLogout() {
    localStorage.removeItem('tokenListaCompras');
    window.location.href = "../login/index.html"; // Redireciona pro login
}

// ==========================================
// LÓGICA DE UPLOAD DE FOTO (A mesma que fizemos antes)
// ==========================================
async function salvarNovaFotoModal() {
    const fileInput = document.getElementById('inputFotoModal');
    const token = localStorage.getItem('tokenListaCompras');

    if (fileInput.files.length === 0) return;

    const arquivoImagem = fileInput.files[0];
    const formData = new FormData();
    formData.append("foto", arquivoImagem); 

    try {
        // O 'API' precisa estar definido globalmente na sua página (const API = "http://127.0.0.1:3000")
        const response = await fetch(`${API}/usuario/upload-foto`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            const dados = await response.json();
            // Atualiza a imagem no modal e na barra lateral (se existir)
            document.getElementById('imgPerfilModal').src = `${API}${dados.fotoUrl}`;
            
            const imgSidebar = document.querySelector('.infoUsuario img');
            if (imgSidebar) imgSidebar.src = `${API}${dados.fotoUrl}`;
            
            alert("Foto atualizada!");
        } else {
            alert("Erro ao salvar a foto.");
        }
    } catch (erro) {
        console.error("Erro na requisição:", erro);
    }
}