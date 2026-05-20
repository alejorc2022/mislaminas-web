// Ajuste de total: 1 (00) + 960 (48 selecciones) + 19 (FWC 1-19) + 14 (CC 1-14) = 994
const TOTAL_LAMINAS = 994; 

const TEAMS = [
    "FWC", "MEX", "RSA", "KOR", "CZE", "CAN", "BIH", "QAT", "SUI", "BRA", 
    "MAR", "HAI", "SCO", "USA", "PAR", "AUS", "TUR", "GER", "CUW", "CIV", 
    "ECU", "NED", "JPN", "SWE", "TUN", "BEL", "EGY", "IRN", "NZL", "ESP", 
    "CPV", "KSA", "URU", "FRA", "SEN", "IRQ", "NOR", "ARG", "ALG", "AUT", 
    "JOR", "POR", "COD", "UZB", "COL", "ENG", "CRO", "GHA", "PAN", "CC"
];

let collection = JSON.parse(localStorage.getItem('mundial2026_data')) || {};
const container = document.getElementById('album-container');

function initAlbum() {
    container.innerHTML = ''; 
    
    // 1. Crear lámina 00
    createSection("Especiales", ["00"]);

    // 2. Generar secciones según tu planilla [cite: 61]
    TEAMS.forEach(team => {
        let stickers = [];
        
        if (team === "FWC") {
            // Ahora inicia directamente en FWC1 hasta FWC19
            for(let i = 1; i <= 19; i++) stickers.push(`FWC${i}`);
        } 
        else if (team === "CC") {
            // Coca-Cola del 1 al 14 
            for(let i = 1; i <= 14; i++) stickers.push(`CC${i}`);
        } 
        else {
            // Selecciones estándar: 20 láminas cada una [cite: 71, 82, 94]
            for(let i = 1; i <= 20; i++) stickers.push(`${team}${i}`);
        }
        
        createSection(team, stickers);
    });
    
    updateProgress();
}

function createSection(title, stickers) {
    const section = document.createElement('section');
    section.className = 'team-section';
    section.innerHTML = `
        <div class="team-title">
            <span>${title}</span>
            <small id="count-${title}">0/${stickers.length}</small>
        </div>
        <div class="sticker-grid"></div>
    `;
    
    const grid = section.querySelector('.sticker-grid');
    stickers.forEach(id => {
        const div = document.createElement('div');
        div.className = `sticker ${collection[id] ? 'obtained' : ''}`;
        
        // Mantener el color especial para 00 y Coca-Cola [cite: 52]
        if(id === "00" || id.includes("CC")) div.classList.add('special');
        
        div.innerText = id;
        div.onclick = () => toggleSticker(id, div, title);
        grid.appendChild(div);
    });
    container.appendChild(section);
    updateSectionCount(title);
}

function toggleSticker(id, element, teamTitle) {
    if (collection[id]) {
        delete collection[id];
        element.classList.remove('obtained');
    } else {
        collection[id] = true;
        element.classList.add('obtained');
    }
    updateProgress();
    updateSectionCount(teamTitle);
    saveToLocal();
}

function updateSectionCount(teamTitle) {
    const sectionStickers = Array.from(document.querySelectorAll('.sticker'))
        .filter(s => {
            if (teamTitle === "Especiales") return s.innerText === "00";
            // Filtro exacto para evitar que 'MEX' cuente en 'MEXICO' etc.
            return s.innerText.startsWith(teamTitle);
        });
    const obtained = sectionStickers.filter(s => s.classList.contains('obtained')).length;
    const counter = document.getElementById(`count-${teamTitle}`);
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