// js/core/layout.js - Zarządzanie szablonem strony (Menu + Nagłówki)

document.addEventListener("DOMContentLoaded", () => {
    initLayout();
    // Uruchom zamianę ikonek (data-icon) jeśli biblioteka icons.js jest załadowana
    if (typeof replaceIcons === 'function') replaceIcons();
});

function initLayout() {
    const appBody = document.body;

    // --- 1. PRZYGOTOWANIE IKON ---
    const hasIcons = typeof getIcon === 'function';
    
    const iconHome  = hasIcons ? getIcon('home') : '';
    const iconTools = hasIcons ? getIcon('tools') : '';
    const iconFolder= hasIcons ? getIcon('folder') : '';
    const iconInfo  = hasIcons ? getIcon('info') : '';
    const iconHelp  = hasIcons ? getIcon('help') : '';
    const iconQr    = hasIcons ? getIcon('qr') : ''; // To było ok

    // --- 2. WSTRZYKIWANIE NAWIGACJI (MENU GŁÓWNE) ---
    const navPlaceholder = document.getElementById('paw-nav');
    
    if (navPlaceholder) {
        navPlaceholder.innerHTML = `
        <nav class="main-nav">
            <div class="nav-left">
                <a href="index.html" style="display:flex; align-items:center; gap:10px; text-decoration:none;">
                    <img src="assets/logo_paw.png" alt="PAW" class="nav-logo" style="height:24px;" onerror="this.style.display='none'; this.parentNode.innerHTML='<span style=\\'font-weight:bold; color:#0F4496; font-size:1.2rem;\\'>PAW</span>'">
                </a>
                
                <ul class="nav-links">
                    <li class="nav-item">
                        <a href="index.html" class="nav-link">${iconHome} Pulpit</a>
                    </li>
                    
                    <li class="nav-item">
                        <a href="#" class="nav-link">${iconTools} Generatory ▾</a>
                        <div class="dropdown-menu">
                            <a href="szkolenia.html" class="dropdown-item">
                                <span>TEB Szkolenia</span>
                            </a>
                            
                            <a href="qr.html" class="dropdown-item">
                                ${iconQr} <span>Generator QR</span>
                            </a>
                            <div class="dropdown-item disabled">
                                <span>Szkoły Średnie</span> <span class="badge-soon">Wkrótce</span>
                            </div>
                            <div class="dropdown-item disabled">
                                <span>TEB Edukacja</span> <span class="badge-soon">Wkrótce</span>
                            </div>
                        </div>
                    </li>
                    
                    <li class="nav-item">
                        <a href="zasoby.html" class="nav-link">${iconFolder} Zasoby</a>
                    </li>
                    
                    <li class="nav-item">
                        <a href="status.html" class="nav-link">${iconInfo} O systemie</a>
                    </li>
                </ul>
            </div>
            
            <div class="nav-right">
                <a href="kontakt.html" class="btn btn-secondary" style="height: 36px; padding: 0 15px; font-size: 13px;">
                    ${iconHelp} Pomoc / Kontakt
                </a>
            </div>
        </nav>
        `;
    }

    // --- 3. WSTRZYKIWANIE CONTEXT BAR ---
    const contextPlaceholder = document.getElementById('page-context');
    
    if (contextPlaceholder) {
        const title = contextPlaceholder.dataset.title || "Tytuł Strony";
        const desc = contextPlaceholder.dataset.desc || "";
        const path = contextPlaceholder.dataset.path || "PAW / Narzędzia";
        
        const contextHTML = `
        <div class="context-bar">
            <div class="context-container">
                <span class="text-eyebrow">${path}</span>
                <h1 class="text-h1">${title}</h1>
                ${desc ? `<p style="color: var(--text-secondary); max-width: 800px; font-size: 15px;">${desc}</p>` : ''}
            </div>
        </div>
        `;
        contextPlaceholder.outerHTML = contextHTML;
    }

    // --- 4. PODŚWIETLANIE AKTYWNEGO LINKU ---
    highlightActiveLink();
}

function highlightActiveLink() {
    const currentPath = window.location.pathname.split("/").pop() || 'index.html';
    const links = document.querySelectorAll(".nav-link, .dropdown-item");
    
    links.forEach(link => {
        if(link.getAttribute("href") === currentPath) {
            link.classList.add("active");
            if(link.classList.contains("dropdown-item")) {
                const parentItem = link.closest(".nav-item");
                if (parentItem) {
                    const parentLink = parentItem.querySelector(".nav-link");
                    if (parentLink) parentLink.classList.add("active");
                }
            }
        }
    });
}