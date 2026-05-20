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