
const API_BASE = 'https://lista-de-compras-api-quvq.onrender.com'

async function validarToken() {
   

    const token = localStorage.getItem('tokenListaCompras');

    if (!token) {
        // console.warn("Sem token no LocalStorage.");
        window.location.href = '/login/login.html';
        return false;
    }

    try {
        // console.log("Enviando requisição para:", `${API_BASE}/catalogo`);


        const response = await fetch(`${API_BASE}/lista`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // console.log("Status da API:", response.status);

        if (response.status === 401 || response.status === 403) {
            alert("Sessão expirada (Erro 401). Faça login novamente.");
            
            localStorage.removeItem('tokenListaCompras');
            window.location.href = '/login/login.html';
            return false;
        }

        return true;

    } catch (erro) {
        alert("Erro técnico ao validar token: " + erro.message);
        // console.error(erro);
        return false; 
    }
}