const API = "http://127.0.0.1:3000"


document.addEventListener("DOMContentLoaded", () => {
    
    const btnLogar = document.getElementById("logar");

    btnLogar.addEventListener('click', fazerLogin);
});
async function fazerLogin() {
    const email = document.getElementById("insiraEmail").value
    const senha = document.getElementById("insiraSenha").value
    try {
        console.log("Enviando para:", `${API}/usuario/login`);
        const response = await fetch(`${API}/usuario/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        })
        const data = await response.json()
        if (data.token) {
            localStorage.setItem('tokenListaCompras', data.token)
            alert("Logado com sucesso")
        }
        else {
            alert("Falha no login")
        }
    }
    catch (error) {
        console.error("Erro no login:", error)
    }
}
