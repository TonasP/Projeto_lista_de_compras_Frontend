async function validarToken(){
    const token = localStorage.getItem('tokenListaCompras')
    const getToken = await fetch(`${API}/catalogo`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
    if (getToken.response ===401 || getToken.response === 403)    {
        alert("Sua seção expirou, por favor, faça login novamente")
        localStorage.removeItem('tokenListaCompras')
        window.location.href ='../login/login.html'
        return false
    }
    if (!token){
        console.log(token)
        window.location.href ='../login/login.html'
        return false
    }
    return true
}
