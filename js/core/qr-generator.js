/* js/core/qr-generator.js */
/* Moduł generatora QR dla systemu PAW */

class QRManager {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        
        // --- KONFIGURACJA Z DESIGN SYSTEMU ---
        this.brandColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#0F4496';
        this.white = '#FFFFFF';
        
        // Stan
        this.isNegative = false; 
        this.currentText = '';

        // --- KONFIGURACJA GEOMETRII ---
        this.config = {
            baseSize: 800,       // Wewnętrzna rozdzielczość
            margin: 80,          // Quiet Zone (px)
            borderRadius: 80,    // Promień zaokrąglenia pliku
            logoScale: 0.165,    // Skala logo (16.5%)
            logoPadding: 32      // Padding wokół logo
        };
        
        // SVG Data (Sygnet TEB - Optimized Path)
        this.logoPathData = "M245.525 0V57.7599H392.414L245.525 204.649L40.8529 0H0V257.475L245.525 503L491.05 257.475V0H245.525ZM433.267 233.552L245.525 421.294L57.7599 233.552V98.6128L245.502 286.355L433.244 98.6128V233.552H433.267Z";
        this.logoViewBox = { w: 492, h: 503 };

        this.updateLogoImage();
    }

    /* ---------------- WALIDACJA ---------------- */
    isValidUrl(string) {
        if (!string) return false;
        const cleanStr = string.trim().toLowerCase();
        // Usuwamy protokół do analizy
        let domain = cleanStr.replace(/^(https?:\/\/)?/, '').split('/')[0];
        
        // Strict Regex: Wymaga liter w TLD, blokuje IP-like (np. 444.www)
        const domainRegex = /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
        return domainRegex.test(domain);
    }

    /* ---------------- ZARZĄDZANIE STANEM ---------------- */
    setNegative(isNegative) {
        this.isNegative = isNegative;
        this.updateLogoImage();
        if (this.currentText) this.generate(this.currentText);
    }

    updateLogoImage() {
        const color = this.isNegative ? this.white : this.brandColor;
        // SVG jako Base64 dla Canvas
        const svgString = `<svg width="${this.logoViewBox.w}" height="${this.logoViewBox.h}" viewBox="0 0 ${this.logoViewBox.w} ${this.logoViewBox.h}" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${this.logoPathData}" fill="${color}"/></svg>`;
        this.logoUrl = 'data:image/svg+xml;base64,' + btoa(svgString);
        
        this.logoImg = new Image();
        this.logoImg.src = this.logoUrl;
    }

    /* ---------------- RENDEROWANIE (CORE) ---------------- */
    generate(text) {
        this.currentText = text;
        if (!this.container) return;

        if (!text) {
            this.container.innerHTML = ''; // Stan pusty
            return;
        }

        // 1. Wirtualny DOM dla biblioteki
        const tempDiv = document.createElement('div');
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

        // 2. Asynchroniczne składanie obrazu
        setTimeout(() => {
            const sourceCanvas = tempDiv.querySelector('canvas');
            if (sourceCanvas) {
                this._renderFinalImage(sourceCanvas, (finalCanvas) => {
                    this.container.innerHTML = '';
                    
                    // Style podglądu (Override inline styles z biblioteki)
                    finalCanvas.style.width = '100%';
                    finalCanvas.style.height = 'auto';
                    finalCanvas.style.display = 'block';
                    finalCanvas.style.borderRadius = '12px'; 
                    
                    this.container.appendChild(finalCanvas);
                });
            }
        }, 10);
    }

    /**
     * Główny silnik graficzny. Składa: Tło + QR + Logo.
     * Używany zarówno do Podglądu (scaled down css) jak i PNG (high res).
     */
    _renderFinalImage(sourceCanvas, callback) {
        const { baseSize, margin, borderRadius, logoScale, logoPadding } = this.config;
        const finalSize = baseSize + (margin * 2);
        
        const canvas = document.createElement('canvas');
        canvas.width = finalSize;
        canvas.height = finalSize;
        const ctx = canvas.getContext('2d');
        const bgColor = this.isNegative ? this.brandColor : this.white;

        // 1. Tło (Rounded Rect)
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(0, 0, finalSize, finalSize, borderRadius);
        else ctx.rect(0, 0, finalSize, finalSize);
        ctx.fill();
        ctx.clip();

        // 2. Kod QR
        ctx.drawImage(sourceCanvas, margin, margin);

        // 3. Logo & Safety Zone
        const drawLogo = () => {
            const size = baseSize;
            const logoSize = size * logoScale;
            const logoPos = margin + (size - logoSize) / 2;

            // Safety Zone
            ctx.fillStyle = bgColor;
            const p = logoPadding;
            ctx.fillRect(logoPos - p, logoPos - p, logoSize + (p*2), logoSize + (p*2));
            
            // Sygnet
            ctx.drawImage(this.logoImg, logoPos, logoPos, logoSize, logoSize);
            
            callback(canvas);
        };

        if (this.logoImg.complete) drawLogo();
        else this.logoImg.onload = drawLogo;
    }

    /* ---------------- EKSPORT ---------------- */
    downloadPNG(filename = 'teb-qr') {
        const previewCanvas = this.container.querySelector('canvas');
        if (!previewCanvas) return;

        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = previewCanvas.toDataURL("image/png");
        link.click();
    }

    downloadSVG(filename = 'teb-qr') {
        if (!this.currentText) return;

        // --- Generowanie SVG Wektorowego ---
        // (Wymaga osobnej instancji biblioteki dla danych modułów)
        const tempDiv = document.createElement('div');
        const qrcode = new QRCode(tempDiv, {
            text: this.currentText,
            width: 1000, height: 1000,
            correctLevel: QRCode.CorrectLevel.H
        });
        
        const modules = qrcode._oQRCode.modules;
        const moduleCount = modules.length;
        
        const { baseSize, margin, logoScale, logoPadding } = this.config;
        
        // Setup SVG
        const boxSize = 1000; 
        const marginSvg = 100;
        const contentSize = boxSize - (marginSvg * 2);
        const moduleSize = contentSize / moduleCount;
        
        const bgColor = this.isNegative ? this.brandColor : this.white;
        const rectColor = this.isNegative ? this.white : this.brandColor;
        
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${boxSize}" height="${boxSize}" viewBox="0 0 ${boxSize} ${boxSize}">`;
        
        // Tło
        svg += `<rect width="100%" height="100%" fill="${bgColor}"/>`;
        
        // Moduły (Kropki)
        svg += `<g fill="${rectColor}">`;
        for (let r = 0; r < moduleCount; r++) {
            for (let c = 0; c < moduleCount; c++) {
                if (modules[r][c]) {
                    const x = marginSvg + (c * moduleSize);
                    const y = marginSvg + (r * moduleSize);
                    svg += `<rect x="${x}" y="${y}" width="${moduleSize + 0.1}" height="${moduleSize + 0.1}"/>`;
                }
            }
        }
        svg += `</g>`;

        // Logo Zone
        const logoSizeSvg = contentSize * logoScale;
        const logoPaddingSvg = logoPadding * (contentSize / baseSize);
        const center = boxSize / 2;
        const zoneSize = logoSizeSvg + (logoPaddingSvg * 2);
        
        svg += `<rect x="${center - zoneSize/2}" y="${center - zoneSize/2}" width="${zoneSize}" height="${zoneSize}" fill="${bgColor}"/>`;

        // Logo Path
        const logoX = center - logoSizeSvg/2;
        const logoY = center - logoSizeSvg/2;
        const scale = Math.min(logoSizeSvg / this.logoViewBox.w, logoSizeSvg / this.logoViewBox.h);
        const transX = logoX + (logoSizeSvg - (this.logoViewBox.w * scale)) / 2;
        const transY = logoY + (logoSizeSvg - (this.logoViewBox.h * scale)) / 2;
        const logoColor = this.isNegative ? this.white : this.brandColor;

        svg += `<g transform="translate(${transX}, ${transY}) scale(${scale})">`;
        svg += `<path d="${this.logoPathData}" fill="${logoColor}"/>`;
        svg += `</g></svg>`;

        const blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.svg`;
        link.click();
    }
}