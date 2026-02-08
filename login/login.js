
const API = "http://127.0.0.1:3000"


document.addEventListener("DOMContentLoaded", () => {
    iniciarModalCadastro()
    esqueciSenha()

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
            window.location.href='../lista/lista.html'

        }
        else {
            alert("Falha no login")
        }
    }
    catch (error) {
        console.error("Erro no login:", error)
    }
}

function iniciarModalCadastro() {

    const modalHTML = `
        <div id="modalCadastro" class="modal-overlay">
            <div class="modal-content">
                <span class="fechar-modal">&times;</span>
                <h2>Novo Cadastro</h2>
                <form id="formCadastro">
                    <input type="text" id="cadNome" placeholder="Nome completo" required>
                    <input type="email" id="cadEmail" placeholder="Seu email" required>
                    <input type="text" id = "cadLocal" placeholder= "Sua localização" required>
                    <input type="password" id="cadSenha" placeholder="Senha" required>
                    <button type="submit" class ="btnCadastrar">Cadastrar</button>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);


    const modal = document.getElementById("modalCadastro");
    const btnAbrir = document.getElementById("btnAbrirModal");
    const btnFechar = modal.querySelector(".fechar-modal");
    const form = document.getElementById("formCadastro");


    if (btnAbrir) {
        btnAbrir.addEventListener("click", (e) => {
            e.preventDefault();
            modal.classList.add("mostrar");
        });
    }


    btnFechar.addEventListener("click", () => {
        modal.classList.remove("mostrar");
    });


    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("mostrar");
    });


    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const usuario = document.getElementById("cadNome").value;
        const email = document.getElementById("cadEmail").value;
        const localização = document.getElementById("cadLocal").value
        const senha = document.getElementById("cadSenha").value;

        try {
            const response = await fetch("http://127.0.0.1:3000/usuario/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario, email, localização, senha })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Cadastro realizado com sucesso!");
                modal.classList.remove("mostrar");
                form.reset();
            } else {
                alert("Erro: " + (data.message || "Não foi possível cadastrar"));
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão com o servidor.");
        }
    });
}

function esqueciSenha() {
    if (document.getElementById("modalEsqueciSenha")) return;

  
    const modalBase = `
    <div id="modalEsqueciSenha" class="modal-overlay">
        <div class="modal-content">
            <span class="fechar-modal">&times;</span>
            <div id="conteudoDinamico"></div> 
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalBase);

   
    const modal = document.getElementById('modalEsqueciSenha');
    const btnFechar = modal.querySelector(".fechar-modal");
    const container = document.getElementById("conteudoDinamico");
    const btnEsqueci = document.getElementById('esquecisenha');
    
  
    let tokenGuardado = ""; 

    
    function mostrarEtapaEmail() {
        container.innerHTML = `
            <h2>Recuperar Senha</h2>
            <p style="color: #666; margin-bottom: 15px;">Digite seu email para receber o token.</p>
            <form id="formEtapa1">
                <input type="email" id="recEmail" placeholder="Insira seu email" required style="width: 90%; padding: 10px; margin-bottom: 10px;">
                <button type="submit" class="btn-verde">Enviar Token</button>
            </form>
        `;

        document.getElementById("formEtapa1").addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("recEmail").value;
            const btn = e.target.querySelector("button");
            
            btn.innerText = "Enviando...";
            btn.disabled = true;

            try {
                
                const response = await fetch(`${API}/usuario/esqueci-senha`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                
                if (response.ok) {
                    alert("Se o email existir, você receberá um token.");
                    mostrarEtapaCodigo(email); 
                } else {
                    const erro = await response.json();
                    alert(erro.error || "Erro ao enviar email");
                    btn.innerText = "Tentar Novamente";
                    btn.disabled = false;
                }
            } catch (error) {
                console.error(error);
                alert("Erro de conexão.");
                btn.innerText = "Enviar Token";
                btn.disabled = false;
            }
        });
    }

    
    function mostrarEtapaCodigo(emailUsuario) {
        container.innerHTML = `
            <h2>Validar Token</h2>
            <p style="font-size: 14px; margin-bottom: 15px;">Token enviado para: <strong>${emailUsuario}</strong></p>
            <form id="formEtapa2">
                <input type="text" id="recCodigo" placeholder="Cole o token aqui" required style="width: 90%; padding: 10px; margin-bottom: 10px;">
                <button type="submit" class="btn-verde">Validar Código</button>
            </form>
            <div style="margin-top: 10px; font-size: 12px; cursor: pointer; color: blue;" id="voltarEmail">Corrigir email</div>
        `;

        document.getElementById("voltarEmail").onclick = mostrarEtapaEmail;

        document.getElementById("formEtapa2").addEventListener("submit", (e) => {
            e.preventDefault();
            const codigoDigitado = document.getElementById("recCodigo").value;

           
            if(codigoDigitado.length > 0) {
                tokenGuardado = codigoDigitado; 
                mostrarEtapaNovaSenha();
            } else {
                alert("Por favor, insira o token.");
            }
        });
    }


    function mostrarEtapaNovaSenha() {
        container.innerHTML = `
            <h2>Criar Nova Senha</h2>
            <form id="formEtapa3">
                <input type="password" id="novaSenha" placeholder="Nova senha" required style="width: 90%; padding: 10px; margin-bottom: 10px;">
                <input type="password" id="confirmaSenha" placeholder="Confirme a senha" required style="width: 90%; padding: 10px; margin-bottom: 10px;">
                <button type="submit" class="btn-verde">Alterar Senha</button>
            </form>
        `;

        document.getElementById("formEtapa3").addEventListener("submit", async (e) => {
            e.preventDefault();
            const senha = document.getElementById("novaSenha").value;
            const confirmacao = document.getElementById("confirmaSenha").value;

            if (senha !== confirmacao) {
                alert("As senhas não coincidem!");
                return;
            }

            try {
                
                const response = await fetch(`${API}/usuario/resetar-senha`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        token: tokenGuardado, 
                        novaSenha: senha 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Sucesso! " + data.message);
                    modal.classList.remove("mostrar");
                    mostrarEtapaEmail(); 
                } else {
                    alert("Erro: " + (data.error || "Token inválido ou expirado."));
                     mostrarEtapaCodigo('seu email'); 
                }

            } catch (error) {
                console.error(error);
                alert("Erro ao conectar com o servidor.");
            }
        });
    }

    if (btnEsqueci) {
        btnEsqueci.addEventListener("click", (e) => {
            e.preventDefault();
            mostrarEtapaEmail();
            modal.classList.add("mostrar");
        });
    }

    btnFechar.addEventListener("click", () => modal.classList.remove("mostrar"));
    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("mostrar");
    });
}