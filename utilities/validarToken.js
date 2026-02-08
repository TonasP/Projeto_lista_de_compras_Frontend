async function validarToken(){
    const token = localStorage.getItem('tokenListaCompras')
    if (!token){
        console.log(token)
        window.location.href ='../login/login.html'
        return false
    }
    return true
}
