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
    "MEX": "MÉXICO", "RSA": "SUDÁFRICA", "KOR": "COREA DEL SUR", "CZE": "REPÚBLICA CHECA",
    "CAN": "CANADÁ", "BIH": "BOSNIA Y HERZEGOVINA", "QAT": "CATAR", "SUI": "SUIZA",
    "BRA": "BRASIL", "MAR": "MARRUECOS", "HAI": "HAITÍ", "SCO": "ESCOCIA",
    "USA": "ESTADOS UNIDOS", "PAR": "PARAGUAY", "AUS": "AUSTRALIA", "TUR": "TURQUÍA",
    "GER": "ALEMANIA", "CUW": "CURAZAO", "CIV": "COSTA DE MARFIL", "ECU": "ECUADOR",
    "NED": "PAÍSES BAJOS", "JPN": "JAPÓN", "SWE": "SUECIA", "TUN": "TÚNEZ",
    "BEL": "BÉLGICA", "EGY": "EGIPTO", "IRN": "IRÁN", "NZL": "NUEVA ZELANDA",
    "ESP": "ESPAÑA", "CPV": "CABO VERDE", "KSA": "ARABIA SAUDITA", "URU": "URUGUAY",
    "FRA": "FRANCIA", "SEN": "SENEGAL", "IRQ": "IRAK", "NOR": "NORUEGA",
    "ARG": "ARGENTINA", "ALG": "ARGELIA", "AUT": "AUSTRIA", "JOR": "JORDANIA",
    "POR": "PORTUGAL", "COD": "REP. DEM. DEL CONGO", "UZB": "UZBEKISTÁN", "COL": "COLOMBIA",
    "ENG": "INGLATERRA", "CRO": "CROACIA", "GHA": "GHANA", "PAN": "PANAMÁ"
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
        div.className = `sticker ${collection[id] ? 'obtained' : ''}`;
        
        if(id === "00" || id.includes("CC")) div.classList.add('special');
        
        div.innerText = id;
        div.onclick = () => toggleSticker(id, div, teamCode);
        grid.appendChild(div);
    });
    container.appendChild(section);
    updateSectionCount(teamCode);
}

function toggleSticker(id, element, teamCode) {
    if (collection[id]) {
        delete collection[id];
        element.classList.remove('obtained');
    } else {
        collection[id] = true;
        element.classList.add('obtained');
    }
    updateProgress();
    updateSectionCount(teamCode);
    saveToLocal();
}

function updateSectionCount(teamCode) {
    const sectionStickers = Array.from(document.querySelectorAll('.sticker'))
        .filter(s => {
            if (teamCode === "ESPECIALES") return s.innerText === "00";
            return s.innerText.startsWith(teamCode);
        });
    const obtained = sectionStickers.filter(s => s.classList.contains('obtained')).length;
    const counter = document.getElementById(`count-${teamCode}`);
    if(counter) counter.innerText = `${obtained}/${sectionStickers.length}`;
}

function updateProgress() {
    const totalObtained = Object.keys(collection).length;
    const percentage = ((totalObtained / TOTAL_LAMINAS) * 100).toFixed(1);
    document.getElementById('progress-bar').style.width = `${percentage}%`;
    document.getElementById('progress-text').innerText = `${totalObtained} / ${TOTAL_LAMINAS} (${percentage}%)`;
}

function saveToLocal() {
    localStorage.setItem('mundial2026_data', JSON.stringify(collection));
}

initAlbum();

// Oyentes de eventos para las futuras funciones de tus botones
document.getElementById('btn-nav-izq').onclick = () => alert('¡Próximamente: Función Izquierda!');
document.getElementById('btn-nav-centro').onclick = () => alert('¡Próximamente: Función Central!');

// Asignar la función de exportar faltantes al botón derecho
document.getElementById('btn-nav-der').onclick = exportarFaltantes;

function exportarFaltantes() {
    let textoFaltantes = "🏆 *MIS LÁMINAS FALTANTES - COPA DEL MUNDO 2026* 🏆\n\n";
    let tieneFaltantes = false;

    // 1. Verificar la lámina especial 00
    if (!collection["00"]) {
        textoFaltantes += "*ESPECIALES:* 00\n";
        tieneFaltantes = true;
    }

    // 2. Recorrer cada selección y categoría en el orden oficial
    TEAMS.forEach(team => {
        let faltantesEquipo = [];
        
        if (team === "FWC") {
            for (let i = 1; i <= 19; i++) {
                if (!collection[`FWC${i}`]) faltantesEquipo.push(i);
            }
        } 
        else if (team === "CC") {
            for (let i = 1; i <= 14; i++) {
                if (!collection[`CC${i}`]) faltantesEquipo.push(i);
            }
        } 
        else {
            for (let i = 1; i <= 20; i++) {
                if (!collection[`${team}${i}`]) faltantesEquipo.push(i);
            }
        }

        // Si al equipo le faltan láminas, las añadimos de forma estética
        if (faltantesEquipo.length > 0) {
            tieneFaltantes = true;
            // Si es FWC o CC dejamos la etiqueta sola, si es país usamos su abreviatura
            textoFaltantes += `*${team}:* ${faltantesEquipo.join(", ")}\n`;
        }
    });

    // Si el álbum está 100% completo
    if (!tieneFaltantes) {
        textoFaltantes = "¡Increíble! ¡Ya completé todo mi Álbum de la Copa del Mundo 2026! 🥳🔥";
    } else {
        textoFaltantes += "\n_Compartido desde la Web App Mis Láminas 2026_";
    }

    // Copiar el texto resultante de forma nativa al portapapeles del dispositivo
    navigator.clipboard.writeText(textoFaltantes).then(() => {
        mostrarNotificacionTactica("¡Lista de faltantes copiada al portapapeles! 📋");
    }).catch(err => {
        console.error("Error al copiar: ", err);
        alert("No se pudo copiar automáticamente. Intenta de nuevo.");
    });
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

// Variable global para almacenar el evento de instalación nativo
let eventoInstalacion = null;

// Escuchar cuando el navegador detecte que la Web App está lista para ser instalada
window.addEventListener('beforeinstallprompt', (e) => {
    // Evita que el navegador muestre su propio banner automático molesto
    e.preventDefault();
    // Guarda el evento para usarlo cuando el usuario toque el botón "INSTALAR APP"
    eventoInstalacion = e;
    
    // Opcional: Iluminar o hacer parpadear sutilmente el botón para avisar que ya se puede instalar
    const btnInstalar = document.getElementById('btn-nav-izq');
    if(btnInstalar) {
        btnInstalar.style.color = '#ffffff'; // Cambia a blanco nítido para resaltar
    }
});

// Asignar la función al pulsar el botón izquierdo del footer
document.getElementById('btn-nav-izq').onclick = function() {
    // Si el evento ya fue capturado y está listo
    if (eventoInstalacion) {
        eventoInstalacion.prompt(); // Abre la ventana nativa de confirmación del celular
        
        eventoInstalacion.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                mostrarNotificacionTactica("¡Instalando Mis Laminas App...! 🎉");
            } else {
                console.log('El usuario canceló la instalación');
            }
            eventoInstalacion = null; // Limpiar la variable
        });
    } else {
        // Explicación amigable por si el celular no soporta la API nativa de instalación por botón (ej. algunos iPhones)
        mostrarNotificacionTactica("Para instalar: toca compartir (⚙️ o ⎋) y selecciona 'Añadir a pantalla de inicio' 📱");
    }
};

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

    // Cambiar visualmente el botón mientras está escuchando
    const btnCentro = document.getElementById('btn-nav-centro');
    const textoOriginal = btnCentro.innerText;
    btnCentro.innerText = "🎤 ESCUCHANDO...";
    btnCentro.style.color = "#f8fafc"; // Iluminar en blanco

    recognition.start();

    // Cuando el celular procesa la voz con éxito
    recognition.onresult = (event) => {
        let voz = event.results[0][0].transcript.toLowerCase().trim();
        // Quitar puntos finales que a veces añade el dictado del teclado
        if(voz.endsWith('.')) voz = voz.slice(0, -1);
        
        mostrarNotificacionTactica(`Buscando: "${voz.toUpperCase()}"🔍`);
        scrollHaciaSeccion(voz);
    };

    // Restaurar el botón al terminar (ya sea por éxito o error)
    recognition.onend = () => {
        btnCentro.innerText = textoOriginal;
        btnCentro.style.color = "var(--accent-gold)";
    };

    recognition.onerror = (event) => {
        console.error("Error de voz: ", event.error);
        mostrarNotificacionTactica("No te escuché bien, intenta de nuevo 🎙️");
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