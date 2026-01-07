// js/core/icons.js - Centralna Biblioteka Ikon SVG

const ICONS = {
    // --- 1. IKONY NAWIGACJI I INTERFEJSU (UI) ---
    'home': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    'tools': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    'folder': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    'info': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    'help': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
    'qr': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    // --- 2. DUŻE IKONY KAFELKÓW (DASHBOARD) ---
    
    // Ikonka: Czapka + Otwarta Książka (Dla: TEB Szkolenia)
    'training': `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.25 16.4548V19.0521C13.25 19.6202 13.571 20.1396 14.0792 20.3937L14.6584 20.6833C15.503 21.1056 16.497 21.1056 17.3416 20.6833L17.9208 20.3937C18.429 20.1396 18.75 19.6202 18.75 19.0521V16.4548" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5686 15.6521L14.9215 17.2554C15.6035 17.5815 16.3965 17.5815 17.0785 17.2554L20.4314 15.6521C20.7788 15.486 21 15.1351 21 14.75C21 14.3649 20.7788 14.014 20.4314 13.8479L17.0785 12.2446C16.3965 11.9185 15.6035 11.9185 14.9215 12.2446L11.5686 13.8479C11.2212 14.014 11.0001 14.3649 11.0001 14.75C11.0001 15.1351 11.2212 15.486 11.5686 15.6521V15.6521Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 14.7435V17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 10V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7.50007 15.0203C6.45701 15.0229 5.43416 15.3082 4.54043 15.846C4.23603 16.0443 3.84782 16.0613 3.5273 15.8902C3.20678 15.7192 3.00473 15.3873 3.00001 15.024L3.00009 5.63501C2.99133 5.22721 3.15673 4.835 3.45484 4.55661C5.93696 2.31937 9.76276 2.51788 12 5.00001" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 10.9997L20.9999 5.635C21.0087 5.22721 20.8433 4.835 20.5452 4.5566C18.063 2.31937 14.2372 2.51788 12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,

    // Ikonka: Sama Czapka Absolwenta (Dla: Szkoły Średnie / TEB Edukacja)
    'school': `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.70301 4.09499L3.52901 7.52499C2.23101 8.24599 2.23101 10.112 3.52901 10.833L9.70301 14.263C11.131 15.056 12.868 15.056 14.297 14.263L20.471 10.833C21.769 10.112 21.769 8.24599 20.471 7.52499L14.297 4.09499C12.868 3.30199 11.132 3.30199 9.70301 4.09499Z" stroke="currentColor" stroke-width="1.419" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5.991 12.2V16.124C5.991 17.073 6.466 17.958 7.255 18.483L8.862 19.552C10.763 20.816 13.237 20.816 15.137 19.552L16.744 18.483C17.534 17.958 18.008 17.072 18.008 16.124V12.2" stroke="currentColor" stroke-width="1.4167" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,

    // Ikonka: Notatnik (Dla: Bank Zasobów)
    'resources': `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18 21H6C4.895 21 4 20.105 4 19V5C4 3.895 4.895 3 6 3H18C19.105 3 20 3.895 20 5V19C20 20.105 19.105 21 18 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 8H5.33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 12H5.33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2.88 16H5.33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 3V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 8H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `
};


// Zapewnienie kompatybilności wstecznej (dla starych skryptów używających ICON_SET)
const ICON_SET = ICONS;

// --- FUNKCJA 1: Dla JavaScriptu ---
// Zwraca kod SVG jako string
function getIcon(name, className = '') {
    const svg = ICONS[name];
    if (!svg) {
        console.warn(`Ikona nie znaleziona: ${name}`);
        return '';
    }
    if (className) {
        return svg.replace('<svg', `<svg class="${className}"`);
    }
    return svg;
}

// --- FUNKCJA 2: Automatyczna zamiana w HTML ---
// Szuka elementów <span data-icon="nazwa"></span> i wstawia tam ikonę
function replaceIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
        const iconName = el.getAttribute('data-icon');
        if (ICONS[iconName]) {
            el.innerHTML = ICONS[iconName];
            const svg = el.querySelector('svg');
            if (svg) {
                svg.style.width = '1em';
                svg.style.height = '1em';
                svg.style.verticalAlign = 'middle';
            }
            el.removeAttribute('data-icon');
        }
    });
}

document.addEventListener("DOMContentLoaded", replaceIcons);