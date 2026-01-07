// js/core/gallery.js - Zarządzanie Galerią (Wersja z Wyszukiwaniem)

document.addEventListener("DOMContentLoaded", () => {
    // --- KONFIGURACJA ---
    const JSON_PATH = 'data/gallery.json';
    const IMAGES_BASE_PATH = 'assets/gallery/'; 
    // --------------------

    const openBtn = document.getElementById('openGalleryBtn');
    const closeBtn = document.getElementById('closeGalleryBtn');
    const modal = document.getElementById('galleryModal');
    
    const categoryList = document.getElementById('categoryList');
    const galleryGrid = document.getElementById('galleryGrid');
    const currentCategoryTitle = document.getElementById('currentCategoryTitle');
    const searchInput = document.getElementById('gallerySearchInput');

    let galleryData = []; // Baza danych w pamięci
    let activeCategory = null; // Obecnie wybrana kategoria

    // 1. Otwieranie / Zamykanie
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.classList.add('active');
            if (galleryData.length === 0) loadGalleryData();
            // Reset wyszukiwania przy otwarciu
            if(searchInput) searchInput.value = '';
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    // 2. Ładowanie danych
    function loadGalleryData() {
        fetch(JSON_PATH)
            .then(res => {
                if (!res.ok) throw new Error("Błąd sieci");
                return res.json();
            })
            .then(data => {
                galleryData = data;
                renderCategories();
                
                // Domyślnie otwórz pierwszą kategorię
                if (galleryData.length > 0) {
                    selectCategory(galleryData[0]);
                }
            })
            .catch(err => {
                console.error("Gallery Error:", err);
                galleryGrid.innerHTML = `<div class="gallery-empty">Nie udało się wczytać galerii.</div>`;
            });
    }

    // 3. Renderowanie Listy Kategorii
    function renderCategories() {
        categoryList.innerHTML = '';
        
        galleryData.forEach(cat => {
            const li = document.createElement('li');
            li.className = 'category-item';
            li.textContent = cat.name;
            li.dataset.id = cat.id;
            
            li.addEventListener('click', () => {
                searchInput.value = ''; // Czyścimy szukanie
                selectCategory(cat);
            });
            
            categoryList.appendChild(li);
        });
    }

    function selectCategory(category) {
        activeCategory = category;
        
        // Highlight na liście
        document.querySelectorAll('.category-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === category.id);
        });

        // Nagłówek
        currentCategoryTitle.textContent = category.name;
        
        // Render zdjęć
        renderImages(category.images);
    }

    // 4. Renderowanie Siatki Zdjęć
    function renderImages(imagesArray) {
        galleryGrid.innerHTML = '';

        if (!imagesArray || imagesArray.length === 0) {
            galleryGrid.innerHTML = '<div class="gallery-empty">Brak zdjęć spełniających kryteria.</div>';
            return;
        }

        imagesArray.forEach(img => {
            const fullSrc = IMAGES_BASE_PATH + img.filename;
            
            const div = document.createElement('div');
            div.className = 'gallery-item';
            
            div.innerHTML = `
                <img src="${fullSrc}" alt="${img.title}" loading="lazy">
                <div class="gallery-item-overlay">${img.title}</div>
                ${img.isNew ? '<span class="badge-new">NOWOŚĆ</span>' : ''}
            `;
            
            div.addEventListener('click', () => {
                if (typeof window.loadFromGallery === 'function') {
                    window.loadFromGallery(fullSrc);
                    closeModal();
                }
            });

            galleryGrid.appendChild(div);
        });
    }

    // 5. OBSŁUGA WYSZUKIWANIA (SEARCH)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query.length < 2) {
                // Jeśli mniej niż 2 znaki, wracamy do widoku kategorii
                if (activeCategory) selectCategory(activeCategory);
                return;
            }

            // Odznaczamy kategorie na liście
            document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
            currentCategoryTitle.textContent = `Wyniki wyszukiwania: "${query}"`;

            // Przeszukujemy WSZYSTKIE kategorie
            let results = [];
            
            galleryData.forEach(cat => {
                const matches = cat.images.filter(img => {
                    const inTitle = img.title.toLowerCase().includes(query);
                    // Sprawdzamy tagi (jeśli istnieją)
                    const inTags = img.tags && img.tags.some(tag => tag.toLowerCase().includes(query));
                    
                    return inTitle || inTags;
                });
                results = results.concat(matches);
            });

            renderImages(results);
        });
    }
});