function openTab(evt, tabName) {
    // Ocultar todos los contenidos de pestaña
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Remover la clase "active" de todos los botones
    const tablinks = document.getElementsByClassName("tablink");
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].classList.remove("active");
    }
  
    // Mostrar la pestaña actual y agregar la clase "active" al botón correspondiente
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
  }
  