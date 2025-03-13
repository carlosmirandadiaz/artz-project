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
  // Listas de opciones
  // -------------------------------------------------------------------
  const brandOptions = `
  <option value="" disabled selected>Selecciona una marca</option>
  <option value="L-26A: 7 FOR ALL MANKIND">L-26A: 7 FOR ALL MANKIND</option>
  <option value="L-17B: ABERCROMBIE & FITCH">L-17B: ABERCROMBIE & FITCH</option>
  <option value="L-15A: ABERCROMBIE KIDS">L-15A: ABERCROMBIE KIDS</option>
  <option value="L-107: ADIDAS">L-107: ADIDAS</option>
  <option value="L 312: ALBOA">L 312: ALBOA</option>
  <option value="L-216: ALDO">L-216: ALDO</option>
  <option value="L-20: ALL SAINTS">L-20: ALL SAINTS</option>
  <option value="PB 09: ALO YOGA">PB 09: ALO YOGA</option>
  <option value="L 220 A: DISPONIBLE">L 220 A: DISPONIBLE</option>
  <option value="K208: AMORINO">K208: AMORINO</option>
  <option value="L-233: ARENA">L-233: ARENA</option>
  <option value="L-18: ARISTOCRAZY">L-18: ARISTOCRAZY</option>
  <option value="L-41B: ASSOULINE">L-41B: ASSOULINE</option>
  <option value="L-144: AT&T">L-144: AT&T</option>
  <option value="L-127B: BABY COTTONS">L-127B: BABY COTTONS</option>
  <option value="N1 141: BANORTE">N1 141: BANORTE</option>
  <option value="N1 140: BASTET FLOOR">N1 140: BASTET FLOOR</option>
  <option value="L-110B: BATH & BODY WORKS">L-110B: BATH & BODY WORKS</option>
  <option value="L-119: BCBG GENERATION">L-119: BCBG GENERATION</option>
  <option value="P-01: BECCO CAFE / BECCO GELATTO">P-01: BECCO CAFE / BECCO GELATTO</option>
  <option value="L-219B: BEN & FRANK">L-219B: BEN & FRANK</option>
  <option value="L 220D: DISPONIBLE">L 220D: DISPONIBLE</option>
  <option value="L 24: BIMBA Y LOLA">L 24: BIMBA Y LOLA</option>
  <option value="L-220B: BIRKENSTOCK">L-220B: BIRKENSTOCK</option>
  <option value="NI 134: BIROT">NI 134: BIROT</option>
  <option value="L-120A: BOGGI">L-120A: BOGGI</option>
  <option value="L-45: BROOKS BROTHERS">L-45: BROOKS BROTHERS</option>
  <option value="L-115B: BROWNIE">L-115B: BROWNIE</option>
  <option value="R-311 / T-311: BUTCHER & SONS">R-311 / T-311: BUTCHER & SONS</option>
  <option value="L-37: BVLGARI">L-37: BVLGARI</option>
  <option value="L-126: CALVIN KLEIN">L-126: CALVIN KLEIN</option>
  <option value="L-05: CAROLINA HERRERA">L-05: CAROLINA HERRERA</option>
  <option value="PB-04A: ICHIKANI">PB-04A: ICHIKANI</option>
  <option value="L-04: CARTIER">L-04: CARTIER</option>
  <option value="K 177: CHANEL">K 177: CHANEL</option>
  <option value="PB-48 Y S1-48: CHANEL">PB-48 Y S1-48: CHANEL</option>
  <option value="L 131A: CHARLES & KEITH">L 131A: CHARLES & KEITH</option>
  <option value="L 127 A: CHOUPINET">L 127 A: CHOUPINET</option>
  <option value="R-309/T-309: CHURRERIA EL MORO">R-309/T-309: CHURRERIA EL MORO</option>
  <option value="Cine: CINEMEX">Cine: CINEMEX</option>
  <option value="N1 142: CITIBANAMEX">N1 142: CITIBANAMEX</option>
  <option value="L 13: CLAUDIE PIERLOT">L 13: CLAUDIE PIERLOT</option>
  <option value="L-42: COACH">L-42: COACH</option>
  <option value="R-308: COCINA ABIERTA">R-308: COCINA ABIERTA</option>
  <option value="N3 R305: COLMILLO">N3 R305: COLMILLO</option>
  <option value="L208B: COLUMBIA">L208B: COLUMBIA</option>
  <option value="L-239: COMMANDO">L-239: COMMANDO</option>
  <option value="L-133: ROCHE BOBOIS Y BANG & OLUFSEN">L-133: ROCHE BOBOIS Y BANG & OLUFSEN</option>
  <option value="L 35: DELEITE">L 35: DELEITE</option>
  <option value="L-113A: DESIGUAL">L-113A: DESIGUAL</option>
  <option value="L-113B: DIESEL">L-113B: DIESEL</option>
  <option value="L-02: DIOR">L-02: DIOR</option>
  <option value="PB-33: DIOR HOMME">PB-33: DIOR HOMME</option>
  <option value="L-46: DISPONIBLE">L-46: DISPONIBLE</option>
  <option value="L-47: DISPONIBLE">L-47: DISPONIBLE</option>
  <option value="L 230 A: DJI STORE MEXICO">L 230 A: DJI STORE MEXICO</option>
  <option value="PB 08 A: DOLCE & GABBANA">PB 08 A: DOLCE & GABBANA</option>
  <option value="PB 10: DOLCE & GABBANA">PB 10: DOLCE & GABBANA</option>
  <option value="L-122A: EA7">L-122A: EA7</option>
  <option value="R-306/T-306: EL BAJIO COMIDA MEXICANA">R-306/T-306: EL BAJIO COMIDA MEXICANA</option>
  <option value="R-307/ T-307: EL JAPONEZ">R-307/ T-307: EL JAPONEZ</option>
  <option value="L-27: ERMENEGILDO ZEGNA">L-27: ERMENEGILDO ZEGNA</option>
  <option value="L-226: FACCONABLE">L-226: FACCONABLE</option>
  <option value="L-39: FENDI">L-39: FENDI</option>
  <option value="L-07: FERRAGAMO">L-07: FERRAGAMO</option>
  <option value="L-242A: FLASHDANCE">L-242A: FLASHDANCE</option>
  <option value="R-310 / T-310: FRUTOS PROHIBIDOS Y OTROS PLACERES">R-310 / T-310: FRUTOS PROHIBIDOS Y OTROS PLACERES</option>
  <option value="L-234: FUNEVER DREAMING">L-234: FUNEVER DREAMING</option>
  <option value="L-218: GAIA">L-218: GAIA</option>
  <option value="L 209 A: GARMIN">L 209 A: GARMIN</option>
  <option value="L 115 C: DISPONIBLE">L 115 C: DISPONIBLE</option>
  <option value="L-03: GUCCI">L-03: GUCCI</option>
  <option value="L-118: GUESS">L-118: GUESS</option>
  <option value="L-26B: HACKETT">L-26B: HACKETT</option>
  <option value="L-116: HAMLEYS">L-116: HAMLEYS</option>
  <option value="N2 235A: HEALTHY BOUTIQUE">N2 235A: HEALTHY BOUTIQUE</option>
  <option value="L-202: HEMA">L-202: HEMA</option>
  <option value="L-28: HERMES">L-28: HERMES</option>
  <option value="L-123: HOLLISTER">L-123: HOLLISTER</option>
  <option value="L-25: HUGO BOSS">L-25: HUGO BOSS</option>
  <option value="R-02/ T-02: HUNAN">R-02/ T-02: HUNAN</option>
  <option value="R-01/ T-01: IL BECCO">R-01/ T-01: IL BECCO</option>
  <option value="N2-221B: INGRATA FORTUNA">N2-221B: INGRATA FORTUNA</option>
  <option value="L-101: INNOVA SPORT">L-101: INNOVA SPORT</option>
  <option value="L-208-N2: INNVICTUS">L-208-N2: INNVICTUS</option>
  <option value="NA: INTELLI SITE">NA: INTELLI SITE</option>
  <option value="N2 222: ISDIN">N2 222: ISDIN</option>
  <option value="L-130: AERIE">L-130: AERIE</option>
  <option value="SOTANO 6: KAVAK">SOTANO 6: KAVAK</option>
  <option value="SOTANO 5: KAVAK">SOTANO 5: KAVAK</option>
  <option value="L-19: KIEHLS">L-19: KIEHLS</option>
  <option value="R-303 / T-303: LA 20">R-303 / T-303: LA 20</option>
  <option value="R-301/T-301/T-301A: LA CASA DEL PASTOR">R-301/T-301/T-301A: LA CASA DEL PASTOR</option>
  <option value="L-122B: LACOSTE">L-122B: LACOSTE</option>
  <option value="208A: LEVIS">208A: LEVIS</option>
  <option value="L-01: LOUIS VUITTON">L-01: LOUIS VUITTON</option>
  <option value="L-16: LULU LEMON">L-16: LULU LEMON</option>
  <option value="N2-201: LA CASA DEL TABACO">N2-201: LA CASA DEL TABACO</option>
  <option value="L-224A: MACSTORE">L-224A: MACSTORE</option>
  <option value="R-310/T-310: MAISON KAYSER">R-310/T-310: MAISON KAYSER</option>
  <option value="L-23: MAJE">L-23: MAJE</option>
  <option value="L-125: MASSIMO DUTTI">L-125: MASSIMO DUTTI</option>
  <option value="L-32: MAX MARA">L-32: MAX MARA</option>
  <option value="L 242 B: MED SPA">L 242 B: MED SPA</option>
  <option value="L-209: MOBICA">L-209: MOBICA</option>
  <option value="L-40: MONCLER">L-40: MONCLER</option>
  <option value="L-36: MONT BLANC">L-36: MONT BLANC</option>
  <option value="L-245: MORA MORA">L-245: MORA MORA</option>
  <option value="L-236: NAILS ART & HAIR CARE Y/O AVEDA">L-236: NAILS ART & HAIR CARE Y/O AVEDA</option>
  <option value="R-05/ T-05: NEGRONI">R-05/ T-05: NEGRONI</option>
  <option value="L 229: NEW ERA">L 229: NEW ERA</option>
  <option value="L-109: NIKE">L-109: NIKE</option>
  <option value="R06: NOSTOS">R06: NOSTOS</option>
  <option value="N2 235B: OJO DE AGUA">N2 235B: OJO DE AGUA</option>
  <option value="L-124: OLD NAVY">L-124: OLD NAVY</option>
  <option value="L-32: OMEGA">L-32: OMEGA</option>
  <option value="L 220C: OPTICAS LUX">L 220C: OPTICAS LUX</option>
  <option value="N1-110C: GOCCO">N1-110C: GOCCO</option>
  <option value="L-110A: OYSHO">L-110A: OYSHO</option>
  <option value="L-128: PANDORA">L-128: PANDORA</option>
  <option value="L-41: PATEK PHILIPPE">L-41: PATEK PHILIPPE</option>
  <option value="N2 200: PERGO">N2 200: PERGO</option>
  <option value="L-29: PEYRELONGUE CHRONOS">L-29: PEYRELONGUE CHRONOS</option>
  <option value="L 139: PORCELANOSA">L 139: PORCELANOSA</option>
  <option value="L-38: PRADA">L-38: PRADA</option>
  <option value="L-221A: PSYCHO BUNNY">L-221A: PSYCHO BUNNY</option>
  <option value="L-211: PUMA">L-211: PUMA</option>
  <option value="L-14: PURIFICACION GARCIA">L-14: PURIFICACION GARCIA</option>
  <option value="L-114A: RAPSODIA">L-114A: RAPSODIA</option>
  <option value="R-07 / T-07 / T-07A: RESTAURANTE SUNTORY">R-07 / T-07 / T-07A: RESTAURANTE SUNTORY</option>
  <option value="L-122C: ROCHE BOBOIS Y BANG & OLUFSEN">L-122C: ROCHE BOBOIS Y BANG & OLUFSEN</option>
  <option value="L-212: SALOMON">L-212: SALOMON</option>
  <option value="L-15B: SANDRO">L-15B: SANDRO</option>
  <option value="N1-143: SANTANDER">N1-143: SANTANDER</option>
  <option value="L-119: SCALPERS">L-119: SCALPERS</option>
  <option value="L-115A: SCALPERS WOMAN">L-115A: SCALPERS WOMAN</option>
  <option value="N2 228: SCAPPINO">N2 228: SCAPPINO</option>
  <option value="N1-145: SCOTIABANK">N1-145: SCOTIABANK</option>
  <option value="L-111: SEPHORA">L-111: SEPHORA</option>
  <option value="L-243: SERSANA">L-243: SERSANA</option>
  <option value="L-244: SICLO">L-244: SICLO</option>
  <option value="L-215: SKECHERS">L-215: SKECHERS</option>
  <option value="R-302/ T-302/ T-302A: SONORA GRILL">R-302/ T-302/ T-302A: SONORA GRILL</option>
  <option value="L-17A: STARBUCKS COFFEE">L-17A: STARBUCKS COFFEE</option>
  <option value="L-224B: STARBUCKS COFFEE RESERVE">L-224B: STARBUCKS COFFEE RESERVE</option>
  <option value="R-08A: STARBUCKS COFFEE T3">R-08A: STARBUCKS COFFEE T3</option>
  <option value="L-223: STEVE MADDEN">L-223: STEVE MADDEN</option>
  <option value="N2 227: CAUDALIE">N2 227: CAUDALIE</option>
  <option value="L-131B: SWAROVSKI, CAMMILA">L-131B: SWAROVSKI, CAMMILA</option>
  <option value="R-03/ T-03/ T-04: SYLVESTRE">R-03/ T-03/ T-04: SYLVESTRE</option>
  <option value="L 120: TAF">L 120: TAF</option>
  <option value="L-31: TANE">L-31: TANE</option>
  <option value="N2 L 240 B: TANME">N2 L 240 B: TANME</option>
  <option value="L-225C: TANYA MOSS">L-225C: TANYA MOSS</option>
  <option value="L-135: TELAS DE PANI">L-135: TELAS DE PANI</option>
  <option value="L 240: THE FACE METHOD">L 240: THE FACE METHOD</option>
  <option value="L-214: THE NORTH FACE">L-214: THE NORTH FACE</option>
  <option value="N2 230B: THULE">N2 230B: THULE</option>
  <option value="L-06: TIFFANY & CO MEXICO">L-06: TIFFANY & CO MEXICO</option>
  <option value="L-121: TOMMY HILFIGUER">L-121: TOMMY HILFIGUER</option>
  <option value="L-117: TOUS">L-117: TOUS</option>
  <option value="L-129: TRUE RELIGION">L-129: TRUE RELIGION</option>
  <option value="L-241 / N-3: UFC">L-241 / N-3: UFC</option>
  <option value="L-217: UGG">L-217: UGG</option>
  <option value="L 21, 22: UNCOMMON GROUND">L 21, 22: UNCOMMON GROUND</option>
  <option value="L-210B: UNDER ARMOUR">L-210B: UNDER ARMOUR</option>
  <option value="40B: VAN CLEEF">40B: VAN CLEEF</option>
  <option value="SOTANO 5: VEMO">SOTANO 5: VEMO</option>
  <option value="L-12: VICTORIAS SECRET">L-12: VICTORIAS SECRET</option>
  <option value="L-132: WEST ELM">L-132: WEST ELM</option>
  <option value="L-44: ZADIG & VOLTAIRE">L-44: ZADIG & VOLTAIRE</option>
  <option value="L-103 / L-207: ZARA">L-103 / L-207: ZARA</option>
  <option value="L-106: ZARA HOME">L-106: ZARA HOME</option>
  <option value="L-237 L 238: ZUDA">L-237 L 238: ZUDA</option>
  <option value="ESPACIO: PAJAROPIEDRA">ESPACIO: PAJAROPIEDRA</option>
  <option value="ESPACIO: GONG CHA">ESPACIO: GONG CHA</option>
  <option value="K 101: IQOS">K 101: IQOS</option>
`;

// 2) Opciones para Torres
const sublabelOptions = `
  <option value="" disabled selected>Selecciona una torre</option>
  <option value="T1: J&J">T1: J&J</option>
  <option value="T1: ENERMEX">T1: ENERMEX</option>
  <option value="T1: BYVA">T1: BYVA</option>
  <option value="T1: TODD">T1: TODD</option>
  <option value="T1: BANCO SABADELL">T1: BANCO SABADELL</option>
  <option value="T1: ENFOQUE Y TECNOLOGIA CONSULTORES">
    T1: ENFOQUE Y TECNOLOGIA CONSULTORES
  </option>
  <option value="T1: ENFOQUE Y TECNOLOGIA CONSULTORES">
    T1: ENFOQUE Y TECNOLOGIA CONSULTORES
  </option>
  <option value="T1: MAJOR LEAGUE BASEBALL MEXICO">
    T1: MAJOR LEAGUE BASEBALL MEXICO
  </option>
  <option value="T1: FIDUCIA">T1: FIDUCIA</option>
  <option value="T1: DESARROLLADORA GDE">
    T1: DESARROLLADORA GDE
  </option>
  <option value="T1: LJAB ABOGADOS">T1: LJAB ABOGADOS</option>
  <option value="T1: PROYECTOS ATSO">T1: PROYECTOS ATSO</option>
  <option value="T1: BANORTE">T1: BANORTE</option>
  <option value="T1: AMPS">T1: AMPS</option>
  <option value="T2: KUEHNE NAGEL">T2: KUEHNE NAGEL</option>
  <option value="T2: LABORATORIOS TORRENT">
    T2: LABORATORIOS TORRENT
  </option>
  <option value="T2: WE WORK">T2: WE WORK</option>
  <option value="T2: PROMOTORA SKU">T2: PROMOTORA SKU</option>
  <option value="T2: SEKURA">T2: SEKURA</option>
  <option value="T2: SEKURA">T2: SEKURA</option>
  <option value="T2: SSS ASISTENCIA Y SUPERVISION">
    T2: SSS ASISTENCIA Y SUPERVISION
  </option>
  <option value="T2: PLAN SEGURO">T2: PLAN SEGURO</option>
  <option value="T2: NOTARIA 221">T2: NOTARIA 221</option>
  <option value="T3: WE WORK">T3: WE WORK</option>
  <option value="T3: BANCO SANTANDER">T3: BANCO SANTANDER</option>
  <option value="T3: MERZ PHARMA">T3: MERZ PHARMA</option>
  <option value="T3: DOSHA">T3: DOSHA</option>
`;

// 3) Opciones para Otros
const othersOptions = `
  <option value="" disabled selected>Elige una opción</option>
  <option value="sotano">Sótano</option>
  <option value="estacionamiento">Estacionamiento</option>
  <option value="exteriores">Exteriores</option>
  <option value="otros">Otros</option>
`;

  // Por defecto, marcar "Marca - Local" activo y llenar el select con marcas
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

  // Agregar trabajador (POST /add_worker)
  addWorkerBtn.addEventListener("click", function(e) {
    e.preventDefault(); // Evita la recarga

    // Recolectar datos generales y específicos
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

    fetch("/add_worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(resp => {
        console.log("Worker added:", resp);
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

  function getWorkers() {
    fetch("/get_workers")
      .then(res => res.json())
      .then(workers => {
        // Elimina filas antiguas (excepto el encabezado)
        let rows = workersTable.querySelectorAll("tr:not(:first-child)");
        rows.forEach(r => r.remove());
        // Inserta cada trabajador en la tabla
        workers.forEach(w => {
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td>${w.fullName}</td>
            <td>${w.managerName}</td>
            <td>${w.workerId}</td>
            <td>${w.workerMail}</td>
            <td>${w.workerPhone}</td>
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
