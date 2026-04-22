let avisoTimeout

function cardAviso(texto, estado) {
    let sectionAviso = document.querySelector('.aviso')

    if (!sectionAviso) return;

    clearTimeout(avisoTimeout);

    const fecharCard = () => {
        sectionAviso.classList.add('saindo')
        setTimeout(() => {
            sectionAviso.classList.add('hidden');
            sectionAviso.classList.remove('saindo');
        }, 200);}

        if (estado === 1) {
            sectionAviso.classList.remove('hidden')
            sectionAviso.innerHTML = `
        <div class="cardAviso">
            <div class="listraSuperior"></div>
            <div class="boxTexto">
                <p>${texto}</p>
            </div>
        </div>`
          avisoTimeout = setTimeout(() => {
            fecharCard();
        }, 2000);
        }
    sectionAviso.addEventListener("click", ()=>{
        clearTimeout(avisoTimeout);
        fecharCard()
    })    

}
export default cardAviso