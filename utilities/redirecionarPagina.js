async function redirecionarPagina(pagina){
    let aba = String(pagina)
    switch(aba){
        case "lista":
             window.location.href ='../lista/lista.html'
             break
        case "catalogo":
             window.location.href ='../catalogo/catalogo.html'
             break
        case "dicas":
             window.location.href ='../dicas/dicas.html'
             break
        case "historico":
             window.location.href ='../historico/historico.html'
             break
        case "usuario":
             window.location.href ='../usuario/usuario.html'     
             break
    }
}