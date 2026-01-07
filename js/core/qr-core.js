/* js/core/qr-core.js */
class QRManager {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        
        // --- KONFIGURACJA KOLORÓW (TEB) ---
        this.brandColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#0F4496';
        this.white = '#FFFFFF';
        
        // Stan
        this.isNegative = false; 
        this.currentText = '';

        // --- KONFIGURACJA GEOMETRII ---
        this.config = {
            baseSize: 800,       // Rozmiar samego kodu QR
            margin: 80,          // Margines (Quiet Zone)
            borderRadius: 80,    // Zaokrąglenie całego pliku
            logoScale: 0.165,     // Skala logo względem kodu
            logoPadding: 32      // Oddech logo
        };
        
        // --- DANE SYGNETU (Czysta ścieżka wektorowa) ---
        // Wyciągnąłem "d" z Twojego SVG, żeby osadzać to natywnie
        this.logoPathData = "M245.525 0V57.7599H392.414L245.525 204.649L40.8529 0H0V257.475L245.525 503L491.05 257.475V0H245.525ZM433.267 233.552L245.525 421.294L57.7599 233.552V98.6128L245.502 286.355L433.244 98.6128V233.552H433.267Z";
        // Oryginalne wymiary sygnetu (potrzebne do skalowania w SVG)
        this.logoViewBox = { w: 492, h: 503 };

        // Generujemy też wersję obrazkową (dla Canvas/PNG)
        this.updateLogoImage();
    }

    // --- 1. WALIDACJA ---
    isValidUrl(string) {
        if (!string) return false;
        const cleanStr = string.trim().toLowerCase();
        let domain = cleanStr.replace(/^(https?:\/\/)?/, '').split('/')[0];
        // Regex: Wymaga liter w TLD, blokuje 444.www
        const domainRegex = /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
        return domainRegex.test(domain);
    }

    // --- 2. ZMIANA TRYBU ---
    setNegative(isNegative) {
        this.isNegative = isNegative;
        this.updateLogoImage(); // Aktualizujemy kolor logo w pamięci
        if (this.currentText) {
            this.generate(this.currentText);
        }
    }

    updateLogoImage() {
        const color = this.isNegative ? this.white : this.brandColor;
        // Budujemy pełny SVG string dla obiektu Image
        const svgString = `<svg width="${this.logoViewBox.w}" height="${this.logoViewBox.h}" viewBox="0 0 ${this.logoViewBox.w} ${this.logoViewBox.h}" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${this.logoPathData}" fill="${color}"/></svg>`;
        
        this.logoUrl = 'data:image/svg+xml;base64,' + btoa(svgString);
        this.logoImg = new Image();
        this.logoImg.src = this.logoUrl;
    }

    // --- 3. GENEROWANIE I PODGLĄD ---
    generate(text) {
        this.currentText = text;
        if (!this.container) return;

        if (!text) {
            this.container.innerHTML = '';
            return;
        }

        // 1. Generujemy "surowy" kod QR w pamięci (ukryty div)
        // Dzięki temu nie zaśmiecamy DOM-u, dopóki nie złożymy całości
        const tempDiv = document.createElement('div');
        
        // Kolory biblioteki (Odwrotne dla negatywu)
        const bg = this.isNegative ? this.brandColor : this.white;
        const fg = this.isNegative ? this.white : this.brandColor;

        new QRCode(tempDiv, {
            text: text,
            width: this.config.baseSize,
            height: this.config.baseSize,
            colorDark: fg,
            colorLight: bg,
            correctLevel: QRCode.CorrectLevel.H
        });

        // 2. Czekamy moment na render biblioteki i składamy finalny obraz
        // Timeout jest potrzebny, bo qrcode.js jest lekko asynchroniczny przy rysowaniu
        setTimeout(() => {
            const sourceCanvas = tempDiv.querySelector('canvas');
            if (sourceCanvas) {
                // To jest funkcja, która "składa" wszystko (margines, logo, kod)
                this._renderFinalImage(sourceCanvas, (finalCanvas) => {
                    // 3. Wrzucamy gotowy obraz do podglądu
                    this.container.innerHTML = '';
                    
                    // Style CSS injection dla podglądu (Fix skalowania)
                    finalCanvas.style.width = '100%';
                    finalCanvas.style.height = 'auto';
                    finalCanvas.style.display = 'block';
                    finalCanvas.style.borderRadius = '12px'; // Zaokrąglenie w CSS dla estetyki podglądu
                    
                    this.container.appendChild(finalCanvas);
                });
            }
        }, 10);
    }

    /**
     * Główna funkcja renderująca (używana przez Podgląd i PNG)
     * Tworzy nowy Canvas z marginesami, tłem i logo
     */
    _renderFinalImage(sourceCanvas, callback) {
        const { baseSize, margin, borderRadius, logoScale, logoPadding } = this.config;
        
        // Obliczamy rozmiar całości
        const finalSize = baseSize + (margin * 2);
        
        const canvas = document.createElement('canvas');
        canvas.width = finalSize;
        canvas.height = finalSize;
        const ctx = canvas.getContext('2d');

        // Kolory
        const bgColor = this.isNegative ? this.brandColor : this.white;
        
        // 1. Tło Całości (Zaokrąglone)
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(0, 0, finalSize, finalSize, borderRadius);
        } else {
            ctx.rect(0, 0, finalSize, finalSize);
        }
        ctx.fill();
        ctx.clip(); // Wszystko co wyjdzie poza zaokrąglenie, znika

        // 2. Wklejamy kod QR (z przesunięciem o margines)
        ctx.drawImage(sourceCanvas, margin, margin);

        // 3. Rysujemy Logo
        // Upewniamy się, że logo jest załadowane
        const drawLogo = () => {
            const size = baseSize;
            const logoSize = size * logoScale;
            const logoPos = margin + (size - logoSize) / 2;

            // Tło pod logo (Safety Zone) - ten sam kolor co tło pliku
            ctx.fillStyle = bgColor;
            const p = logoPadding;
            
            // Rysujemy kwadrat ochronny
            ctx.fillRect(logoPos - p, logoPos - p, logoSize + (p*2), logoSize + (p*2));
            
            // Rysujemy sygnet
            ctx.drawImage(this.logoImg, logoPos, logoPos, logoSize, logoSize);
            
            callback(canvas);
        };

        if (this.logoImg.complete) {
            drawLogo();
        } else {
            this.logoImg.onload = drawLogo;
        }
    }

    // --- 4. POBIERANIE PNG ---
    downloadPNG(filename = 'teb-qr') {
        // Pobieramy canvas bezpośrednio z podglądu, bo on jest już "gotowy"
        // (Wcześniej funkcja generate() już go złożyła metodą _renderFinalImage)
        const previewCanvas = this.container.querySelector('canvas');
        
        if (!previewCanvas) {
            alert('Najpierw wygeneruj kod!');
            return;
        }

        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = previewCanvas.toDataURL("image/png");
        link.click();
    }

    // --- 5. POBIERANIE SVG (Wektorowe - Poprawione) ---
    downloadSVG(filename = 'teb-qr') {
        if (!this.currentText) return;

        // Generujemy wirtualną instancję dla danych wektorowych
        const tempDiv = document.createElement('div');
        const qrcode = new QRCode(tempDiv, {
            text: this.currentText,
            width: 1000, height: 1000,
            correctLevel: QRCode.CorrectLevel.H
        });
        
        const modules = qrcode._oQRCode.modules;
        const moduleCount = modules.length;
        
        const { baseSize, margin, logoScale, logoPadding } = this.config;
        
        // Wymiary SVG
        // Używamy 1000 jako bazy dla SVG, niezależnie od canvasa
        const boxSize = 1000; 
        const marginSvg = 100; // Proporcjonalny margines w SVG
        const contentSize = boxSize - (marginSvg * 2);
        const moduleSize = contentSize / moduleCount;
        
        const bgColor = this.isNegative ? this.brandColor : this.white;
        const rectColor = this.isNegative ? this.white : this.brandColor;
        
        // Start SVG
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${boxSize}" height="${boxSize}" viewBox="0 0 ${boxSize} ${boxSize}">`;
        
        // 1. Tło (Całość)
        svgContent += `<rect width="100%" height="100%" fill="${bgColor}"/>`;
        
        // 2. Moduły QR (jako grupa)
        svgContent += `<g fill="${rectColor}">`;
        for (let r = 0; r < moduleCount; r++) {
            for (let c = 0; c < moduleCount; c++) {
                if (modules[r][c]) {
                    const x = marginSvg + (c * moduleSize);
                    const y = marginSvg + (r * moduleSize);
                    // +0.1 likwiduje cieniutkie linie między klockami w niektórych renderach
                    svgContent += `<rect x="${x}" y="${y}" width="${moduleSize + 0.1}" height="${moduleSize + 0.1}"/>`;
                }
            }
        }
        svgContent += `</g>`;

        // 3. Safety Zone (Kwadrat na środku)
        const logoSizeSvg = contentSize * logoScale;
        const logoPaddingSvg = logoPadding * (contentSize / baseSize); // Skalowanie paddingu
        const center = boxSize / 2;
        const zoneSize = logoSizeSvg + (logoPaddingSvg * 2);
        
        svgContent += `<rect x="${center - zoneSize/2}" y="${center - zoneSize/2}" width="${zoneSize}" height="${zoneSize}" fill="${bgColor}"/>`;

        // 4. LOGO JAKO KRZYWE (<path>) - TO NAPRAWIA PROBLEM W EDYTORACH
        const logoX = center - logoSizeSvg/2;
        const logoY = center - logoSizeSvg/2;
        
        // Musimy przeskalować sygnet z jego oryginalnego viewBox (492x503) do rozmiaru docelowego w SVG
        // Obliczamy skalę transformacji
        const scaleX = logoSizeSvg / this.logoViewBox.w;
        const scaleY = logoSizeSvg / this.logoViewBox.h;
        // Wybieramy mniejszą skalę żeby zachować proporcje (fit)
        const scale = Math.min(scaleX, scaleY);
        
        // Centrowanie w osi sygnetu (jeśli nie jest idealnym kwadratem)
        const transX = logoX + (logoSizeSvg - (this.logoViewBox.w * scale)) / 2;
        const transY = logoY + (logoSizeSvg - (this.logoViewBox.h * scale)) / 2;

        // Kolor sygnetu w SVG
        const logoColor = this.isNegative ? this.white : this.brandColor;

        svgContent += `<g transform="translate(${transX}, ${transY}) scale(${scale})">`;
        svgContent += `<path d="${this.logoPathData}" fill="${logoColor}"/>`;
        svgContent += `</g>`;
        
        svgContent += `</svg>`;

        const blob = new Blob([svgContent], {type: "image/svg+xml;charset=utf-8"});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.svg`;
        link.click();
    }
}