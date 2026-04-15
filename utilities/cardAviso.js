 function cardAviso(texto, estado){
    let sectionAviso= document.querySelector('.aviso')
       
    if (!sectionAviso) return;
    
    if (estado === 1){
        sectionAviso.classList.remove('hidden')
        sectionAviso.innerHTML = `
        <div class="cardAviso">
            <div class="listraSuperior"></div>
            <div class="boxTexto">
                <p>${texto}</p>
            </div>
        </div>`
    }
    sectionAviso.addEventListener('click', ()=>{
        sectionAviso.classList.add('saindo')
        setTimeout(() => {
        sectionAviso.classList.add('hidden');
        sectionAviso.classList.remove('saindo');
    }, 200);
    })
  

}
export default cardAviso