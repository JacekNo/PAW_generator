/**
 * PAW Graphic Generator Core
 * Silnik generujący grafiki na canvasie.
 * Niezależny od danych - przyjmuje konfigurację w konstruktorze.
 */

class GraphicGenerator {
    /**
     * @param {Array} configArray - Tablica obiektów konfiguracyjnych (wymiary, nakładki itp.)
     */
    constructor(configArray) {
        // 1. Dane konfiguracyjne
        this.configs = configArray;
        
        // 2. Stan aplikacji
        this.userImage = null;       // Załadowany obrazek użytkownika
        this.offsets = {};           // Pozycje przesunięcia { id: {x, y} }
        this.overlaysLoaded = {};    // Załadowane obrazy nakładek (cache)
        
        // 3. Uchwyty do DOM (Cache DOM elements)
        this.grid = document.getElementById('grid');
        this.textInput = document.getElementById('textInput');
        this.imageInput = document.getElementById('imageInput');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.galleryBtn = document.getElementById('openGalleryBtn');
        this.globalWarning = document.getElementById('globalWarning');

        // Inicjalizacja offsetów
        this.configs.forEach(cfg => {
            this.offsets[cfg.id] = { x: 0, y: 0 };
        });
    }

    /**
     * Główna metoda startowa
     */
    async init() {
        if (!this.grid) {
            console.error("Błąd krytyczny: Nie znaleziono kontenera #grid");
            return;
        }

        // 1. Ładujemy wszystkie nakładki (async)
        await this.loadOverlays();
        
        // 2. Budujemy strukturę HTML (Canvasy)
        this.buildGrid();
        
        // 3. Podpinamy zdarzenia (Inputy, Drag&Drop, Pobieranie)
        this.attachEvents();

        // 4. Pierwsze rysowanie (gdy fonty są gotowe)
        document.fonts.ready.then(() => {
            this.redrawAll();
        });

        console.log(`PAW Generator uruchomiony. Załadowano ${this.configs.length} formatów.`);
    }

    /**
     * Ładuje obrazy nakładek (.png) zdefiniowane w configu
     */
    loadOverlays() {
        const promises = this.configs.map(cfg => {
            return new Promise((resolve) => {
                if (!cfg.overlay) {
                    resolve();
                    return;
                }
                const img = new Image();
                img.src = cfg.overlay;
                img.onload = () => { 
                    this.overlaysLoaded[cfg.id] = img; 
                    resolve(); 
                };
                img.onerror = () => { 
                    console.warn(`Nie udało się załadować nakładki: ${cfg.overlay}`); 
                    resolve(); 
                };
            });
        });
        return Promise.all(promises);
    }

    /**
     * Generuje kafelki podglądu w DOM
     */
    buildGrid() {
        this.grid.innerHTML = ''; // Czyścimy grid

        this.configs.forEach(cfg => {
            const div = document.createElement('div');
            div.className = 'preview-card';
            
            // HTML Kafelka
            div.innerHTML = `
                <div class="preview-header">
                    <span>${cfg.name}</span>
                    <span>${cfg.w}x${cfg.h}</span>
                </div>
                <div class="canvas-wrapper">
                    <canvas id="canvas_${cfg.id}" width="${cfg.w}" height="${cfg.h}"></canvas>
                </div>
                ${cfg.hasText ? `<div id="warn_${cfg.id}" class="limit-warning">Tekst ucięty (max ${cfg.maxLines} linie)!</div>` : ''}
            `;
            
            this.grid.appendChild(div);
            
            // Aktywacja przesuwania dla tego kafelka
            this.setupDrag(cfg.id);
        });
    }

    /**
     * Podpina wszystkie listenery
     */
    attachEvents() {
        // Zmiana tekstu
        if (this.textInput) {
            this.textInput.addEventListener('input', () => this.redrawAll());
        }

        // Wgranie pliku z dysku
        if (this.imageInput) {
            this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Przycisk Pobierz
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.handleDownload());
        }
    }

    /**
     * Obsługa wgrania pliku z dysku
     */
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                this.setUserImage(img);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Publiczna metoda do ustawiania zdjęcia (używana też przez Galerię)
     */
    setUserImage(imgElement) {
        this.userImage = imgElement;
        // Reset offsetów przy nowym zdjęciu
        Object.keys(this.offsets).forEach(k => this.offsets[k] = { x: 0, y: 0 });
        this.redrawAll();
    }

    /**
     * Obsługa przesuwania zdjęcia myszką (Drag & Drop na canvasie)
     */
    setupDrag(id) {
        const canvas = document.getElementById(`canvas_${id}`);
        if (!canvas) return;

        let isDown = false;
        let startX, startY;

        canvas.addEventListener('mousedown', e => {
            if (!this.userImage) return; // Nie przesuwamy pustego
            isDown = true;
            startX = e.offsetX;
            startY = e.offsetY;
            canvas.style.cursor = 'grabbing';
        });

        window.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                canvas.style.cursor = 'grab';
            }
        });

        canvas.addEventListener('mousemove', e => {
            if (!isDown || !this.userImage) return;
            
            // Obliczamy przesunięcie
            const dx = e.offsetX - startX;
            const dy = e.offsetY - startY;
            
            // Aktualizujemy stan
            this.offsets[id].x += dx;
            this.offsets[id].y += dy;
            
            // Reset punktu startowego
            startX = e.offsetX;
            startY = e.offsetY;
            
            this.redrawAll();
        });
    }

    /**
     * Główna pętla rysująca - odświeża wszystkie canvasy
     */
   /**
     * Główna pętla rysująca - odświeża wszystkie canvasy
     * Z DODANĄ BLOKADĄ PRZESUWANIA (CLAMPING)
     */
    redrawAll() {
        const text = this.textInput ? this.textInput.value : "";
        let anyWarning = false;

        this.configs.forEach(cfg => {
            const canvas = document.getElementById(`canvas_${cfg.id}`);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const warnEl = document.getElementById(`warn_${cfg.id}`);
            
            // 1. Tło (Białe) - na wypadek dziur, ale zaraz im zapobiegniemy
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, cfg.w, cfg.h);

            // 2. Zdjęcie Użytkownika
            if (this.userImage) {
                // Obszar, który zdjęcie musi pokryć (cały canvas lub tylko photoHeight)
                const areaH = cfg.photoHeight || cfg.h;
                const areaW = cfg.w;

                // Obliczanie skali "Cover" (wypełnij)
                const scaleW = areaW / this.userImage.width;
                const scaleH = areaH / this.userImage.height;
                const scale = Math.max(scaleW, scaleH); // Wybieramy większą skalę, żeby nie było dziur
                
                const dw = this.userImage.width * scale;
                const dh = this.userImage.height * scale;
                
                // Pozycja bazowa (wyśrodkowana)
                const baseX = (areaW - dw) / 2;
                const baseY = (areaH - dh) / 2;

                // --- MATEMATYKA BLOKADY (CLAMPING) ---
                
                // Granice: zdjęcie nie może "wejść" do środka canvasa
                // minX: prawa krawędź zdjęcia dotyka prawej krawędzi canvasa
                // maxX: lewa krawędź zdjęcia dotyka lewej krawędzi canvasa (czyli 0)
                const minX = areaW - dw;
                const maxX = 0;
                
                const minY = areaH - dh;
                const maxY = 0;

                // Obliczamy potencjalną pozycję z uwzględnieniem przesunięcia usera
                let targetX = baseX + this.offsets[cfg.id].x;
                let targetY = baseY + this.offsets[cfg.id].y;

                // Zamykamy w klamry (Clamp)
                // Math.min(Math.max(val, min), max)
                let clampedX = Math.min(Math.max(targetX, minX), maxX);
                let clampedY = Math.min(Math.max(targetY, minY), maxY);

                // WAŻNE: Aktualizujemy offset w pamięci, żeby myszka się nie "ślizgała"
                // Jeśli tego nie zrobisz, po dojechaniu do krawędzi myszka będzie "uciekać" od zdjęcia
                this.offsets[cfg.id].x = clampedX - baseX;
                this.offsets[cfg.id].y = clampedY - baseY;

                // Rysujemy w bezpiecznej pozycji
                ctx.drawImage(this.userImage, clampedX, clampedY, dw, dh);
            }

            // 3. Nakładka (Overlay PNG)
            if (this.overlaysLoaded[cfg.id]) {
                ctx.drawImage(this.overlaysLoaded[cfg.id], 0, 0, cfg.w, cfg.h);
            } else if (cfg.overlay) {
                ctx.strokeStyle = 'red'; ctx.lineWidth = 5; ctx.strokeRect(0, 0, cfg.w, cfg.h);
            }

            // 4. Tekst
            if (cfg.hasText && text) {
                const lines = this.calculateLines(ctx, text, cfg);
                
                if (warnEl) {
                    if (lines.length > cfg.maxLines) {
                        warnEl.style.display = 'block'; anyWarning = true;
                    } else {
                        warnEl.style.display = 'none';
                    }
                }

                ctx.fillStyle = '#1D1D1B';
                ctx.font = `bold ${cfg.fontSize}pt "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                
                const lineHeightPx = cfg.fontSize * 1.33 * (cfg.lineHeight || 1.2);
                
                lines.slice(0, cfg.maxLines).forEach((lineStr, index) => {
                    ctx.fillText(lineStr.trim(), cfg.textX, cfg.textY + (index * lineHeightPx));
                });
            }
        });

        if (this.globalWarning) {
            this.globalWarning.style.display = anyWarning ? 'inline' : 'none';
        }
    }

    /**
     * Algorytm łamania tekstu
     */
    calculateLines(ctx, text, cfg) {
        // Ustawiamy font przed pomiarem!
        ctx.font = `bold ${cfg.fontSize}pt "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
        
        const rawLines = text.split('\n');
        const finalLines = [];

        rawLines.forEach(paragraph => {
            const words = paragraph.split(' ');
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const width = ctx.measureText(currentLine + " " + word).width;
                
                if (width < cfg.maxWidth) {
                    currentLine += " " + word;
                } else {
                    finalLines.push(currentLine);
                    currentLine = word;
                }
            }
            finalLines.push(currentLine);
        });

        return finalLines;
    }

    /**
     * Logika pobierania paczki ZIP
     */
    handleDownload() {
        const textValue = this.textInput ? this.textInput.value : "Bez_nazwy";
        const safeName = textValue.split('\n')[0].replace(/[^a-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]/gi, '').trim().substring(0, 30) || "TEB_Grafika";

        // 1. Logowanie (PHP)
        if(typeof fetch !== 'undefined') {
            fetch('logger.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: textValue })
            }).catch(e => console.warn('Logger error:', e));
        }

        // 2. Generowanie ZIP
        const zip = new JSZip();
        let count = 0;

        this.configs.forEach(cfg => {
            const canvas = document.getElementById(`canvas_${cfg.id}`);
            if(!canvas) return;

            canvas.toBlob(blob => {
                zip.file(`${safeName}_${cfg.id}.png`, blob);
                count++;
                
                // Gdy przetworzono wszystkie pliki
                if (count === this.configs.length) {
                    zip.generateAsync({type:"blob"}).then(content => {
                        saveAs(content, `TEB_${safeName}.zip`);
                    });
                }
            });
        });
    }
}