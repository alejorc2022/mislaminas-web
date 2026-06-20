// Ajuste de total: 1 (00) + 960 (48 selecciones) + 19 (FWC 1-19) + 14 (CC 1-14) = 994
const TOTAL_LAMINAS = 994; 

// Listado de abreviaturas base obtenidas de tu planilla de control 
const TEAMS = [
    "FWC", "MEX", "RSA", "KOR", "CZE", "CAN", "BIH", "QAT", "SUI", "BRA", 
    "MAR", "HAI", "SCO", "USA", "PAR", "AUS", "TUR", "GER", "CUW", "CIV", 
    "ECU", "NED", "JPN", "SWE", "TUN", "BEL", "EGY", "IRN", "NZL", "ESP", 
    "CPV", "KSA", "URU", "FRA", "SEN", "IRQ", "NOR", "ARG", "ALG", "AUT", 
    "JOR", "POR", "COD", "UZB", "COL", "ENG", "CRO", "GHA", "PAN", "CC"
];

// Diccionario de traducciones al español para cada abreviatura 
const TEAM_NAMES = {
    "MEX": "MÉXICO", "RSA": "SUDÁFRICA", "KOR": "COREA DEL SUR", "CZE": "REPÚBLICA CHECA - CHEQUIA",
    "CAN": "CANADÁ", "BIH": "BOSNIA Y HERZEGOVINA", "QAT": "QATAR - CATAR", "SUI": "SUIZA",
    "BRA": "BRASIL", "MAR": "MARRUECOS", "HAI": "HAITÍ", "SCO": "ESCOCIA",
    "USA": "ESTADOS UNIDOS", "PAR": "PARAGUAY", "AUS": "AUSTRALIA", "TUR": "TURQUÍA",
    "GER": "ALEMANIA", "CUW": "CURAZAO", "CIV": "COSTA DE MARFIL", "ECU": "ECUADOR",
    "NED": "PAÍSES BAJOS", "JPN": "JAPÓN", "SWE": "SUECIA", "TUN": "TÚNEZ",
    "BEL": "BÉLGICA", "EGY": "EGIPTO", "IRN": "IRÁN", "NZL": "NUEVA ZELANDA",
    "ESP": "ESPAÑA", "CPV": "CABO VERDE", "KSA": "ARABIA SAUDITA", "URU": "URUGUAY",
    "FRA": "FRANCIA", "SEN": "SENEGAL", "IRQ": "IRAK", "NOR": "NORUEGA",
    "ARG": "ARGENTINA", "ALG": "ARGELIA", "AUT": "AUSTRIA", "JOR": "JORDANIA",
    "POR": "PORTUGAL", "COD": "REP. DEM. DEL CONGO", "UZB": "UZBEKISTÁN", "COL": "COLOMBIA",
    "ENG": "INGLATERRA", "CRO": "CROACIA", "GHA": "GHANA - GANA", "PAN": "PANAMÁ"
};

let collection = JSON.parse(localStorage.getItem('mundial2026_data')) || {};
const container = document.getElementById('album-container');

function initAlbum() {
    container.innerHTML = ''; 
    
    // 1. Crear sección inicial con la nueva etiqueta en mayúsculas
    createSection("ESPECIALES", ["00"], "ESPECIALES");

    // 2. Generar secciones combinando código y nombre completo
    TEAMS.forEach(team => {
        let stickers = [];
        
        if (team === "FWC") {
            for(let i = 1; i <= 19; i++) stickers.push(`FWC${i}`);
            createSection("FWC", stickers, "FWC"); // FWC se mantiene sin cambios
        } 
        else if (team === "CC") {
            for(let i = 1; i <= 14; i++) stickers.push(`CC${i}`);
            createSection("CC", stickers, "CC"); // CC se mantiene sin cambios
        } 
        else {
            for(let i = 1; i <= 20; i++) stickers.push(`${team}${i}`);
            // Construye la etiqueta combinada, ej: "COL - COLOMBIA"
            const fullTitle = `${team} - ${TEAM_NAMES[team] || ''}`; 
            createSection(fullTitle, stickers, team);
        }
    });
    
    updateProgress();
}

function createSection(displayTitle, stickers, teamCode) {
    const section = document.createElement('section');
    section.className = 'team-section';
    section.id = `sec-${teamCode.toUpperCase()}`; // <--- AGREGA ESTA LÍNEA Clave para el desplazamiento por voz
    section.innerHTML = `
        <div class="team-title">
            <span>${displayTitle}</span>
            <small id="count-${teamCode}">0/${stickers.length}</small>
        </div>
        <div class="sticker-grid"></div>
    `;
    
    const grid = section.querySelector('.sticker-grid');

    stickers.forEach(id => {
        const div = document.createElement('div');
        div.className = `sticker`;
        div.setAttribute('data-id', id); // Etiqueta invisible de seguridad para los contadores
        
        if(id === "00" || id.includes("CC")) div.classList.add('special');
        
        // Cargar datos: Soporte para tu viejo formato (true) y el nuevo formato numérico (1, 2, 3...)
        let count = collection[id] || 0;
        if (count === true) count = 1;

        if (count > 0) {
            div.classList.add('obtained');
            // Si hay más de 1, dibujamos la placa de repetidas (ej: +1, +2)
            if (count > 1) {
                div.innerHTML = `${id}<span class="repeat-badge">+${count - 1}</span>`;
            } else {
                div.innerHTML = id;
            }
        } else {
            div.innerHTML = id;
        }
        
        // Lógica táctil: Distinguir entre 1 Clic (sumar) y Doble Clic (restar)
        let clickTimer = null;
        div.addEventListener('click', (e) => {
            if (clickTimer) {
                // Si el temporizador seguía activo, significa que el usuario hizo un segundo toque rápido
                clearTimeout(clickTimer);
                clickTimer = null;
                modifySticker(id, div, teamCode, -1); // Acción del Doble Clic
            } else {
                // Iniciamos un pequeño temporizador de espera para ver si es un clic simple
                clickTimer = setTimeout(() => {
                    clickTimer = null;
                    modifySticker(id, div, teamCode, 1); // Acción de Un Clic
                }, 220); // 220ms es el tiempo perfecto estándar para doble tap en móviles
            }
        });

        grid.appendChild(div);
    });
    container.appendChild(section);
    updateSectionCount(teamCode);
}
    

function modifySticker(id, element, teamCode, change) {
    let count = collection[id] || 0;
    if (count === true) count = 1; 

    count += change;
    if (count < 0) count = 0; 

    if (count === 0) {
        delete collection[id];
        element.classList.remove('obtained');
        element.innerHTML = id;
    } else {
        collection[id] = count;
        element.classList.add('obtained');
        if (count > 1) {
            element.innerHTML = `${id}<span class="repeat-badge">+${count - 1}</span>`;
        } else {
            element.innerHTML = id;
        }
    }
    
    updateProgress();
    updateSectionCount(teamCode);
    saveToLocal();
    
    // NUEVA LÍNEA: Refresca la vista actual inmediatamente después de cada clic
    aplicarFiltro(modoActual); 
}

function updateSectionCount(teamCode) {
    const sectionStickers = Array.from(document.querySelectorAll('.sticker'))
        .filter(s => {
            // Buscamos usando el atributo seguro en lugar del innerText para que la placa +1 no lo rompa
            const stickerId = s.getAttribute('data-id');
            if (teamCode === "ESPECIALES") return stickerId === "00";
            return stickerId.startsWith(teamCode);
        });
    const obtained = sectionStickers.filter(s => s.classList.contains('obtained')).length;
    const counter = document.getElementById(`count-${teamCode}`);
    if(counter) counter.innerText = `${obtained}/${sectionStickers.length}`;
}

function updateProgress() {
    // 1. Contamos las láminas "únicas" que tenemos
    const obtenidas = Object.values(collection).filter(val => val === true || val >= 1).length;
    
    // 2. NUEVO: Calculamos el total exacto de láminas repetidas en todo el álbum
    let totalRepetidas = 0;
    Object.values(collection).forEach(val => {
        let count = (val === true) ? 1 : val; // Compatibilidad por si hay datos viejos
        if (count > 1) {
            totalRepetidas += (count - 1); // Sumamos solo las láminas extras (repetidas)
        }
    });
    
    // 3. Cálculos de porcentaje y faltantes
    const porcentaje = Math.round((obtenidas / TOTAL_LAMINAS) * 100);
    const faltan = TOTAL_LAMINAS - obtenidas;

    // 4. Actualización visual de la barra dorada
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = `${porcentaje}%`;
    }

    // 5. Actualización del texto superior con la nueva concatenación
    const progressText = document.getElementById('progress-text');
    if (progressText) {
        progressText.innerText = `${obtenidas} / ${TOTAL_LAMINAS} (${porcentaje}%) FALTAN ${faltan} REPETIDAS ${totalRepetidas}`;
    }
}

// --- MOTOR DE FILTRADO DINÁMICO (VISTAS DEL ÁLBUM) ---
let modoActual = 'principal'; // Estado inicial de la app

function aplicarFiltro(modo) {
    modoActual = modo;
    const secciones = document.querySelectorAll('.team-section');

    secciones.forEach(seccion => {
        let stickersVisibles = 0;
        const stickers = seccion.querySelectorAll('.sticker');

        stickers.forEach(sticker => {
            const id = sticker.getAttribute('data-id');
            let count = collection[id] || 0;
            if (count === true) count = 1; // Conversión por si hay datos viejos

            let mostrar = false;
            // Lógica de visualización según el modo
            if (modo === 'principal') mostrar = true;
            else if (modo === 'faltantes') mostrar = (count === 0);
            else if (modo === 'repetidas') mostrar = (count > 1);

            // Aplicar visibilidad
            if (mostrar) {
                sticker.style.display = 'flex';
                stickersVisibles++;
            } else {
                sticker.style.display = 'none';
            }
        });

        // Ocultar la sección del país completa si no tiene láminas que mostrar en este modo
        if (stickersVisibles === 0) {
            seccion.style.display = 'none';
        } else {
            seccion.style.display = 'block';
        }
    });

    // Actualizar el diseño visual de los botones inferiores
    document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.classList.remove('active-tab'));
    if (modo === 'principal') document.getElementById('btn-nav-principal')?.classList.add('active-tab');
    if (modo === 'faltantes') document.getElementById('btn-nav-faltantes')?.classList.add('active-tab');
    if (modo === 'repetidas') document.getElementById('btn-nav-repetidas')?.classList.add('active-tab');
}

function saveToLocal() {
    localStorage.setItem('mundial2026_data', JSON.stringify(collection));
}

initAlbum();


// --- NUEVO SISTEMA DE COMPARTIR NATIVO ---

const btnCompartir = document.getElementById('btn-header-compartir');
const menuCompartirOverlay = document.getElementById('menu-compartir-overlay');
const menuCompartirDesplegable = document.getElementById('menu-compartir-desplegable');

function abrirMenuCompartir() {
    menuCompartirOverlay.style.display = 'block';
    setTimeout(() => {
        menuCompartirOverlay.classList.add('active');
        menuCompartirDesplegable.classList.add('active');
    }, 10);
}

function cerrarMenuCompartir() {
    menuCompartirOverlay.classList.remove('active');
    menuCompartirDesplegable.classList.remove('active');
    setTimeout(() => {
        menuCompartirOverlay.style.display = 'none';
    }, 300);
}

// Eventos de apertura/cierre
if (btnCompartir) btnCompartir.addEventListener('click', abrirMenuCompartir);
if (menuCompartirOverlay) menuCompartirOverlay.addEventListener('click', cerrarMenuCompartir);

// Función centralizada para generar los textos según lo que el usuario quiera compartir
function generarTextoCompartir(tipo) {
    let texto = "";

    // BLOQUE DE FALTANTES
    if (tipo === 'faltantes' || tipo === 'ambas') {
        texto += "🏆 *MIS LÁMINAS FALTANTES - MUNDIAL 2026* 🏆\n\n";
        let faltantes = false;
        
        if (!collection["00"]) { texto += "*ESPECIALES:* 00\n"; faltantes = true; }

        TEAMS.forEach(team => {
            let lista = [];
            let max = (team === "FWC") ? 19 : (team === "CC" ? 14 : 20);
            for (let i = 1; i <= max; i++) {
                if (!collection[`${team}${i}`]) lista.push(i);
            }
            if (lista.length > 0) {
                texto += `*${team}:* ${lista.join(", ")}\n`;
                faltantes = true;
            }
        });
        if (!faltantes) texto += "¡Increíble! No me falta ninguna. 🥳\n";
        texto += "\n";
    }

    // BLOQUE DE REPETIDAS
    if (tipo === 'repetidas' || tipo === 'ambas') {
        texto += "🔄 *MIS LÁMINAS REPETIDAS - MUNDIAL 2026* 🔄\n\n";
        let repetidas = false;
        
        let count00 = (collection["00"] === true) ? 1 : (collection["00"] || 0);
        if (count00 > 1) { 
            texto += `*ESPECIALES:* 00 (+${count00 - 1})\n`; 
            repetidas = true; 
        }

        TEAMS.forEach(team => {
            let lista = [];
            let max = (team === "FWC") ? 19 : (team === "CC" ? 14 : 20);
            for (let i = 1; i <= max; i++) {
                let id = `${team}${i}`;
                let count = (collection[id] === true) ? 1 : (collection[id] || 0);
                if (count > 1) {
                    lista.push(`${i}(+${count - 1})`); // Ej: 5(+2)
                }
            }
            if (lista.length > 0) {
                texto += `*${team}:* ${lista.join(", ")}\n`;
                repetidas = true;
            }
        });
        if (!repetidas) texto += "Aún no tengo láminas para intercambiar. 😅\n";
        texto += "\n";
    }

    texto += "_Compartido desde Mis Laminas 2026 App_";
    return texto;
}

// Función que invoca el menú nativo del teléfono
function invocarCompartirNativo(textoGenerado) {
    // Verificamos si el dispositivo soporta el menú de compartir nativo (Web Share API)
    if (navigator.share) {
        navigator.share({
            title: 'Mis Láminas 2026',
            text: textoGenerado
        }).then(() => {
            cerrarMenuCompartir();
        }).catch((err) => {
            // El usuario canceló o cerró el menú, no hacemos nada.
            console.log("Menú de compartir cerrado.");
        });
    } else {
        // Plan B: Si está en PC y no soporta share, copiamos al portapapeles
        navigator.clipboard.writeText(textoGenerado).then(() => {
            mostrarNotificacionTactica("¡Copiado al portapapeles! 📋");
            cerrarMenuCompartir();
        }).catch(err => {
            mostrarNotificacionTactica("Error al intentar copiar.");
        });
    }
}

// Vincular botones del nuevo menú a la lógica
document.getElementById('btn-share-faltantes').addEventListener('click', () => {
    invocarCompartirNativo(generarTextoCompartir('faltantes'));
});

document.getElementById('btn-share-repetidas').addEventListener('click', () => {
    invocarCompartirNativo(generarTextoCompartir('repetidas'));
});

document.getElementById('btn-share-ambas').addEventListener('click', () => {
    invocarCompartirNativo(generarTextoCompartir('ambas'));
});



// --- CONTROL DE LA BARRA DE NAVEGACIÓN INFERIOR ---

// 2. Botón Intercambiar del Footer (Preparado para desarrollo futuro)
const btnNavIntercambiar = document.getElementById('btn-nav-intercambiar');
if (btnNavIntercambiar) {
    btnNavIntercambiar.addEventListener('click', () => {
        // Dejado en stand-by profesional mostrando aviso táctico en pantalla
        if (typeof mostrarNotificacionTactica === 'function') {
            mostrarNotificacionTactica("Función de Intercambio disponible próximamente...");
        } else {
            mostrarNotificacionTactica("Función de Intercambio disponible próximamente...");
        }
    });
}

// 2. Lógica interactiva para el Menú Desplegable (Posición 5)
const btnMenu = document.getElementById('btn-nav-menu');
const menuOverlay = document.getElementById('menu-overlay');
const menuDesplegable = document.getElementById('menu-desplegable');

function abrirMenu() {
    menuOverlay.style.display = 'block';
    // Permitir que el navegador registre el bloque display antes de animar la opacidad
    setTimeout(() => {
        menuOverlay.classList.add('active');
        menuDesplegable.classList.add('active');
    }, 10);
}

function cerrarMenu() {
    menuOverlay.classList.remove('active');
    menuDesplegable.classList.remove('active');
    // Esperar a que termine la transición CSS antes de ocultar por completo
    setTimeout(() => {
        menuOverlay.style.display = 'none';
    }, 300);
}

// Eventos para abrir y cerrar al tocar el botón o fuera de él
if (btnMenu) {
    btnMenu.addEventListener('click', abrirMenu);
}
if (menuOverlay) {
    menuOverlay.addEventListener('click', cerrarMenu);
}



// Función auxiliar para mostrar un aviso estético flotante en la pantalla del móvil
function mostrarNotificacionTactica(mensaje) {
    // Si ya existe un aviso previo, lo removemos
    const avisoViejo = document.getElementById('aviso-flotante');
    if (avisoViejo) avisoViejo.remove();

    const aviso = document.createElement('div');
    aviso.id = 'aviso-flotante';
    aviso.innerText = mensaje;
    document.body.appendChild(aviso);

    // Desvanecer y remover después de 2.5 segundos
    setTimeout(() => {
        aviso.style.opacity = '0';
        setTimeout(() => aviso.remove(), 400);
    }, 2500);
}

// --- CONTROL DE NAVEGACIÓN INFERIOR (VISTAS) ---

// Iniciar siempre iluminando el botón Principal
document.addEventListener('DOMContentLoaded', () => {
    aplicarFiltro('principal');
});

// Botón 1: Vista Principal (Muestra el álbum completo)
const btnPrincipal = document.getElementById('btn-nav-principal');
if (btnPrincipal) {
    btnPrincipal.addEventListener('click', () => {
        aplicarFiltro('principal');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        //mostrarNotificacionTactica("Mostrando: Álbum Completo 📖");
    });
}

// Botón 2: Vista Faltantes (Solo lo que no tienes)
const btnFaltantes = document.getElementById('btn-nav-faltantes');
if (btnFaltantes) {
    btnFaltantes.addEventListener('click', () => {
        aplicarFiltro('faltantes');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        //mostrarNotificacionTactica("Mostrando: Solo Láminas Faltantes 🔍");
    });
}

// Botón 3: Vista Repetidas (Solo las que tienen la burbuja de +1)
const btnRepetidas = document.getElementById('btn-nav-repetidas');
if (btnRepetidas) {
    btnRepetidas.addEventListener('click', () => {
        aplicarFiltro('repetidas');
        window.scrollTo({ top: 0, behavior: 'smooth' });
       // mostrarNotificacionTactica("Mostrando: Tu Muro de Intercambios 🔁");
    });
}


// --- TRASLADO DE LOGICA DE INSTALACIÓN AL MENÚ DESPLEGABLE ---

let deferredPrompt;
const btnMenuInstalar = document.getElementById('btn-menu-instalar');

// Captura el evento de instalación del navegador
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Si el navegador detecta que es instalable, podemos dar un estilo especial al botón del menú si se desea
    if (btnMenuInstalar) {
        btnMenuInstalar.style.opacity = "1";
    }
});

// Acción de instalar al pulsar la opción dentro del menú desplegable
if (btnMenuInstalar) {
    btnMenuInstalar.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('El usuario instaló Mis Laminas App');
            }
            deferredPrompt = null;
            cerrarMenu(); // Cierra el menú automáticamente tras pulsar
        } else {
            mostrarNotificacionTactica("La app ya está instalada o tu navegador no soporta la instalación automática de la App.");
           
        }
    });
}


// Asignar la función de voz al botón central
document.getElementById('btn-nav-centro').onclick = iniciarBusquedaPorVoz;

function iniciarBusquedaPorVoz() {
    // Verificar compatibilidad del navegador móvil (Chrome, Safari, Edge)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        mostrarNotificacionTactica("Tu navegador no soporta búsqueda por voz. ¡Prueba en Chrome o Safari! 🎙️❌");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES'; // Configuración estricta en español
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const btnCentro = document.getElementById('btn-nav-centro');

    // 1. Cuando empieza a escuchar: SOLO añadimos la clase visual
    recognition.onstart = () => {
        btnCentro.classList.add('escuchando');
    };

    recognition.start();

    // 2. Cuando el celular procesa la voz con éxito
    recognition.onresult = (event) => {
        let voz = event.results[0][0].transcript.toLowerCase().trim();
        // Quitar puntos finales que a veces añade el dictado del teclado
        if(voz.endsWith('.')) voz = voz.slice(0, -1);
        
        mostrarNotificacionTactica(`Buscando: "${voz.toUpperCase()}"🔍`);
        scrollHaciaSeccion(voz);
    };

    // 3. Cuando se detiene la escucha (por éxito o silencio): quitamos la clase
    recognition.onend = () => {
        btnCentro.classList.remove('escuchando');
    };

    // 4. Si ocurre un error: limpiamos el estado visual
    recognition.onerror = (event) => {
        console.error("Error de voz: ", event.error);
        mostrarNotificacionTactica("No te escuché bien, intenta de nuevo 🎙️");
        btnCentro.classList.remove('escuchando');
    };
}


// Lógica de emparejamiento inteligente para hacer el Scroll Automático
function scrollHaciaSeccion(terminoVoz) {
    let codigoEncontrado = null;

    // 1. Comprobar categorías directas
    if (terminoVoz.includes("especial") || terminoVoz.includes("esenciales") || terminoVoz === "00") {
        codigoEncontrado = "ESPECIALES";
    } else if (terminoVoz.includes("coca") || terminoVoz.includes("cola") || terminoVoz === "cc") {
        codigoEncontrado = "CC";
    } else if (terminoVoz === "fwc" || terminoVoz.includes("fútbol world") || terminoVoz.includes("fifa")) {
        codigoEncontrado = "FWC";
    } else {
        // 2. Buscar por abreviatura exacta (ej: si dices "m-e-x" o "c-o-l")
        const abreviaturaDirecta = terminoVoz.toUpperCase();
        if (TEAMS.includes(abreviaturaDirecta)) {
            codigoEncontrado = abreviaturaDirecta;
        } else {
            // 3. Buscar por el nombre en español dentro de nuestro diccionario de países
            for (const [codigo, nombrePais] of Object.entries(TEAM_NAMES)) {
                if (nombrePais.toLowerCase().includes(terminoVoz) || terminoVoz.includes(nombrePais.toLowerCase())) {
                    codigoEncontrado = codigo;
                    break;
                }
            }
        }
    }

    // 4. Ejecutar el desplazamiento suave (Scroll) si se halló la sección
    if (codigoEncontrado) {
        const elementoSeccion = document.getElementById(`sec-${codigoEncontrado}`);
        if (elementoSeccion) {
            // Desplazamiento nativo super fluido optimizado para celular
            elementoSeccion.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Destello visual temporal para avisar al usuario dónde quedó ubicado
            elementoSeccion.style.boxShadow = "0 0 20px var(--primary-blue)";
            setTimeout(() => {
                elementoSeccion.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
            }, 1500);
        }
    } else {
        mostrarNotificacionTactica(`No encontré la sección: "${terminoVoz.toUpperCase()}" 📋❌`);
    }
}


// ==========================================
// SISTEMA DE EXPORTACIÓN E IMPORTACIÓN QR
// ==========================================

const modalExportar = document.getElementById('modal-exportar');
const modalImportar = document.getElementById('modal-importar');
const btnExportQR = document.getElementById('btn-export-qr');
const btnImportQR = document.getElementById('btn-import-qr');
const btnCerrarExportar = document.getElementById('btn-cerrar-exportar');
const btnCerrarImportar = document.getElementById('btn-cerrar-importar');

let html5QrcodeScanner = null;

// Función para cerrar el menú principal si está abierto
function cerrarMenusUI() {
    const menus = document.querySelectorAll('.menu-overlay');
    const desplegables = document.querySelectorAll('.menu-desplegable');
    menus.forEach(m => m.classList.remove('active'));
    desplegables.forEach(d => d.classList.remove('active'));
    setTimeout(() => { menus.forEach(m => m.style.display = 'none'); }, 300);
}

// --- NUEVA VARIABLE GLOBAL PARA EL QR ---
let qrCodeInstancia = null; 

// 1. EXPORTAR: Generar código QR (Formato V3 de Máxima Compresión)
btnExportQR.addEventListener('click', () => {
    cerrarMenusUI();
    modalExportar.style.display = 'flex';
    
    const qrContainer = document.getElementById('qr-code-container');
    qrContainer.innerHTML = ''; 
    
    // --- LÓGICA V3: AGRUPACIÓN TÁCTICA DE DATOS ---
    let agrupado = {};
    for (let id in collection) {
        let count = collection[id];
        if (count === 0) continue; 

        let team = id === "00" ? "00" : id.replace(/[0-9]/g, '');
        let num = id === "00" ? "00" : id.replace(/[^0-9]/g, '');

        if (!agrupado[team]) agrupado[team] = [];
        let valor = count === 1 ? num : `${num}x${count}`;
        agrupado[team].push(valor);
    }

    const datosOptimizados = "@" + Object.keys(agrupado).map(team => {
        return `${team}:${agrupado[team].join(',')}`;
    }).join('|');
    
    const datosComprimidos = LZString.compressToEncodedURIComponent(datosOptimizados);
    
    // Generar QR y guardarlo en nuestra variable global
    qrCodeInstancia = new QRCodeStyling({
        width: 320,  
        height: 320,
        type: "svg", // Mantenemos la nitidez vectorial en pantalla
        data: datosComprimidos,
        dotsOptions: { color: "#000000", type: "square" },
        backgroundOptions: { color: "#ffffff" },
        qrOptions: { errorCorrectionLevel: 'L' }
    });

    qrCodeInstancia.append(qrContainer);
});

btnCerrarExportar.addEventListener('click', () => {
    modalExportar.style.display = 'none';
});


// --- SISTEMA DE COMPARTIR QR COMO IMAGEN NATIVA (ACTUALIZADO) ---
document.getElementById('btn-compartir-qr-img').addEventListener('click', async () => {
    // 1. Verificamos la instancia en lugar del HTML
    if (!qrCodeInstancia) {
        mostrarNotificacionTactica("Primero debes generar el código QR.");
        return;
    }

    try {
        mostrarNotificacionTactica("Preparando imagen... ⏳");
        
        // 2. Extraemos el archivo directamente de la memoria de la librería
        const blob = await qrCodeInstancia.getRawData("png");
        
        if (!blob) {
            mostrarNotificacionTactica("Error al procesar la imagen del QR.");
            return;
        }

        // 3. Creamos el archivo y lo pasamos al menú del teléfono
        const archivoQR = new File([blob], "mislaminas_qr.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [archivoQR] })) {
            await navigator.share({
                files: [archivoQR],
                title: 'Mi Progreso de MisLaminas',
                text: 'Aquí tienes mi código QR con todo mi progreso guardado de MisLaminas 2026. ¡Escanéalo o impórtalo desde la galería!'
            });
        } else {
            mostrarNotificacionTactica("Tu dispositivo no soporta compartir imágenes directamente. Intenta con una captura de pantalla.");
        }

    } catch (error) {
        console.error("Error táctico al compartir la imagen QR:", error);
        mostrarNotificacionTactica("No se pudo desplegar el menú para compartir.");
    }
});


// 2. IMPORTAR: Leer código QR (Soporta V1, V2 y V3)
btnImportQR.addEventListener('click', () => {
    cerrarMenusUI();
    modalImportar.style.display = 'flex';
    
    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
        
        html5QrcodeScanner.render((textoDecodificado) => {
            try {
                const jsonDescomprimido = LZString.decompressFromEncodedURIComponent(textoDecodificado);
                let datosImportados = {};
                
                // --- DECODIFICADOR INTELIGENTE ---
                if (jsonDescomprimido.startsWith('@')) {
                    // Formato V3 (El nuevo y más compacto)
                    let grupos = jsonDescomprimido.substring(1).split('|');
                    grupos.forEach(grupo => {
                        if (!grupo) return;
                        let partes = grupo.split(':');
                        let team = partes[0];
                        let items = partes[1];
                        
                        if (items) {
                            items.split(',').forEach(item => {
                                let subPartes = item.split('x');
                                let num = subPartes[0];
                                let count = subPartes[1] ? parseInt(subPartes[1]) : 1;
                                let id = (team === "00") ? "00" : team + num;
                                datosImportados[id] = count;
                            });
                        }
                    });
                } else if (jsonDescomprimido.startsWith('{')) {
                    // Formato V1 (JSON clásico)
                    datosImportados = JSON.parse(jsonDescomprimido);
                } else {
                    // Formato V2 (Lineal)
                    jsonDescomprimido.split('|').forEach(par => {
                        if (par) {
                            const [id, count] = par.split(':');
                            datosImportados[id] = parseInt(count);
                        }
                    });
                }
                
                // Validar que se extrajeron datos correctamente
                if (typeof datosImportados === 'object' && datosImportados !== null && Object.keys(datosImportados).length > 0) {
                    collection = datosImportados; 
                    localStorage.setItem('mundial2026_data', JSON.stringify(collection)); 
                    updateProgress(); 
                    initAlbum(); 
                    
                    html5QrcodeScanner.clear();
                    html5QrcodeScanner = null;
                    modalImportar.style.display = 'none';
                    
                    mostrarNotificacionTactica("¡Progreso importado con éxito! 🏆");
                } else {
                    throw new Error("Datos extraídos están vacíos");
                }
            } catch (e) {
                console.error("Error leyendo QR:", e);
                mostrarNotificacionTactica("Este código QR no es válido o está dañado.");
            }
        }, (errorMessage) => {});
    }
});

btnCerrarImportar.addEventListener('click', () => {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
    }
    modalImportar.style.display = 'none';
});

// --- SISTEMA DE IMPORTACIÓN DESDE ARCHIVO DE IMAGEN ---
const qrFileInput = document.getElementById('qr-file-input');
const btnCargarQrImagen = document.getElementById('btn-cargar-qr-imagen');

// Detonar la selección de archivos nativa al presionar nuestro botón visual
btnCargarQrImagen.addEventListener('click', () => {
    qrFileInput.click();
});

// Monitorear el momento exacto en el que el usuario selecciona la foto
qrFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        mostrarNotificacionTactica("Procesando imagen...");

        // Inicializamos el lector estático en nuestro contenedor secundario secreto
        const lectorArchivoLocal = new Html5Qrcode("qr-file-reader-dummy");

        // Ejecutar el escaneo directo sobre el archivo binario sin activar la cámara
        lectorArchivoLocal.scanFile(file, false)
            .then(decodedText => {
                // Ejecutamos exactamente la misma lógica de descompresión que ya posee tu app
                try {
                    // Descomprimir cadena usando tu LZString instalado
                    const cadenaDescomprimida = LZString.decompressFromUTF16(decodedText) || LZString.decompress(decodedText);
                    
                    if (!cadenaDescomprimida) {
                        throw new Error("Datos corruptos o vacíos al descomprimir.");
                    }

                    // --- INICIO DE TU LÓGICA EXISTENTE DE PARSEO ---
                    // Reconstruimos el formato del objeto de datos según tu lógica V3
                    const datosImportados = {};
                    
                    if (cadenaDescomprimida.startsWith('{')) {
                        // Respaldo por si viene en formato JSON crudo plano
                        Object.assign(datosImportados, JSON.parse(cadenaDescomprimida));
                    } else {
                        // Lógica del decodificador inteligente optimizado por países (@MEX:1,2...)
                        const bloquesPais = cadenaDescomprimida.split('@');
                        bloquesPais.forEach(bloque => {
                            if (!bloque.trim()) return;
                            const [codigoPais, stringLaminas] = bloque.split(':');
                            if (codigoPais && stringLaminas) {
                                const items = stringLaminas.split(',');
                                items.forEach(item => {
                                    if (item.includes('x')) {
                                        const [idLamina, cantidad] = item.split('x');
                                        datosImportados[`${codigoPais}${idLamina}`] = parseInt(cantidad);
                                    } else {
                                        datosImportados[`${codigoPais}${item}`] = 1;
                                    }
                                });
                            }
                        });
                    }

                    // Inyección segura de datos, guardado en LocalStorage y renderizado
                    if (Object.keys(datosImportados).length > 0) {
                        collection = datosImportados;
                        localStorage.setItem('mundial2026_data', JSON.stringify(collection));
                        
                        // Refrescar y pintar toda la UI de forma transparente
                        updateProgress(); 
                        initAlbum();
                        
                        // Apagar el escáner de cámara principal si estaba abierto y cerrar modal
                        if (html5QrcodeScanner) {
                            html5QrcodeScanner.clear();
                            html5QrcodeScanner = null;
                        }
                        document.getElementById('modal-importar').style.display = 'none';
                        
                        mostrarNotificacionTactica("¡Progreso importado desde imagen con éxito! 🏆");
                    } else {
                        throw new Error("Estructura de láminas inválida.");
                    }
                    // --- FIN DE TU LÓGICA EXISTENTE DE PARSEO ---

                } catch (err) {
                    console.error("Fallo interno parseando el QR:", err);
                    mostrarNotificacionTactica("El QR es válido pero no corresponde al formato del álbum.");
                }
            })
            .catch(err => {
                console.error("Fallo en la lectura óptica del QR:", err);
                mostrarNotificacionTactica("No se detectó ningún código QR en la imagen. Intenta con una foto más clara.");
            })
            .finally(() => {
                // Limpiar el valor del input para permitir subir la misma foto consecutivamente si se desea
                qrFileInput.value = "";
            });

    } catch (error) {
        console.error("Error crítico del sistema de carga de archivos:", error);
        mostrarNotificacionTactica("Error al inicializar el lector de archivos.");
    }
});


