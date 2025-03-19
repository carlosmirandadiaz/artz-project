document.addEventListener("DOMContentLoaded", function() {
  // Elementos para la selección de marca/torre/otros
  const labelBrand = document.getElementById("label-brand");
  const labelSublabel = document.getElementById("label-sublabel");
  const labelOthers = document.getElementById("label-others");
  const brandSelect = document.getElementById("brand-select");

  // Campos generales de la solicitud
  const requestDateInput = document.querySelector('input[name="requestDate"]');
  const startDateInput = document.querySelector('input[name="startDate"]');
  const startTimeInput = document.querySelector('input[name="startTime"]');
  const endDateInput = document.querySelector('input[name="endDate"]');
  const endTimeInput = document.querySelector('input[name="endTime"]');
  const workPeriodInput = document.querySelector('input[name="workPeriod"]');
  const workCategorySelect = document.querySelector('select[name="workCategory"]');

  // Campos específicos del trabajador
  const workerFullName = document.getElementById("workerFullName");
  const managerName = document.getElementById("managerName");
  const workerId = document.getElementById("workerId");
  const workerMail = document.getElementById("workerMail");
  const workerPhone = document.getElementById("workerPhone");
  const addWorkerBtn = document.getElementById("add-worker-btn");

  // Tabla donde listamos a los trabajadores
  const workersTable = document.getElementById("workers-table");

  function setActiveLabel(clickedLabel) {
    labelBrand.classList.remove("active");
    labelSublabel.classList.remove("active");
    labelOthers.classList.remove("active");
    clickedLabel.classList.add("active");
  }

  // -------------------------------------------------------------------
  // Listas de opciones (ejemplo abreviado)
  // -------------------------------------------------------------------
  const brandOptions = `
    <option value="" disabled selected>Selecciona una marca</option>
    <option value="L-26A: 7 FOR ALL MANKIND">L-26A: 7 FOR ALL MANKIND</option>
    <option value="L-17B: ABERCROMBIE & FITCH">L-17B: ABERCROMBIE & FITCH</option>
    <!-- ... Resto de las opciones que tenías ... -->
    <option value="K 101: IQOS">K 101: IQOS</option>
  `;
  const sublabelOptions = `
    <option value="" disabled selected>Selecciona una torre</option>
    <option value="T1: J&J">T1: J&J</option>
    <option value="T2: KUEHNE NAGEL">T2: KUEHNE NAGEL</option>
    <!-- ... Resto de torres ... -->
  `;
  const othersOptions = `
    <option value="" disabled selected>Elige una opción</option>
    <option value="sotano">Sótano</option>
    <option value="estacionamiento">Estacionamiento</option>
    <option value="exteriores">Exteriores</option>
    <option value="otros">Otros</option>
  `;

  // Por defecto, "Marca - Local" activo
  setActiveLabel(labelBrand);
  brandSelect.innerHTML = brandOptions;

  // Eventos para cambiar la opción del select según la etiqueta clickeada
  labelBrand.addEventListener("click", function() {
    setActiveLabel(labelBrand);
    brandSelect.innerHTML = brandOptions;
  });
  labelSublabel.addEventListener("click", function() {
    setActiveLabel(labelSublabel);
    brandSelect.innerHTML = sublabelOptions;
  });
  labelOthers.addEventListener("click", function() {
    setActiveLabel(labelOthers);
    brandSelect.innerHTML = othersOptions;
  });

  // -------------------------------------------------------------------
  // Agregar trabajador (POST /add_worker)
  // -------------------------------------------------------------------
  addWorkerBtn.addEventListener("click", function(e) {
    e.preventDefault(); // Evita la recarga de la página

    // Recolectar datos del formulario
    const data = {
      requestDate: requestDateInput.value,
      startDate: startDateInput.value,
      startTime: startTimeInput.value,
      endDate: endDateInput.value,
      endTime: endTimeInput.value,
      brand: brandSelect.value,
      workPeriod: workPeriodInput.value,
      workCategory: workCategorySelect.value,
      fullName: workerFullName.value,
      managerName: managerName.value,
      workerId: workerId.value,
      workerMail: workerMail.value,
      workerPhone: workerPhone.value
    };

    console.log("Datos que se envían a /add_worker:", data);

    fetch("/add_worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(resp => {
        console.log("Respuesta de /add_worker:", resp);
        // Limpiar solo los campos específicos del trabajador
        workerFullName.value = "";
        managerName.value = "responsable";
        workerId.value = "";
        workerMail.value = "";
        workerPhone.value = "";
        // Actualizar la tabla de trabajadores
        getWorkers();
      })
      .catch(err => console.error(err));
  });

  // -------------------------------------------------------------------
  // Obtener la lista de trabajadores y mostrarlos en la tabla
  // -------------------------------------------------------------------
  function getWorkers() {
    fetch("/get_workers")
      .then(res => res.json())
      .then(workers => {
        // Elimina filas antiguas (excepto el encabezado)
        const rows = workersTable.querySelectorAll("tr:not(:first-child)");
        rows.forEach(r => r.remove());

        // Inserta cada trabajador en la tabla
        workers.forEach(w => {
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td>${w.fullName || ""}</td>
            <td>${w.managerName || ""}</td>
            <td>${w.workerId || ""}</td>
            <td>${w.workerMail || ""}</td>
            <td>${w.workerPhone || ""}</td>
            <td>
              <a href="#">Acción 1</a>
              <a href="#">Acción 2</a>
              <a href="#">Acción 3</a>
            </td>
          `;
          workersTable.appendChild(newRow);
        });
      })
      .catch(err => console.error(err));
  }

  // Cargar la tabla de trabajadores al cargar la página
  getWorkers();
});
