# PAW – Platforma Automatyzacji Wizualnej

System webowy typu SaaS dedykowany dla TEB Edukacja, służący do szybkiego generowania materiałów graficznych (posty, story) zgodnych z Brandbookiem.

## 🚀 Funkcjonalności

* **Generator Grafik:** Edycja w przeglądarce (Canvas API) z obsługą wielu formatów jednocześnie (Pion, Poziom, Story, Kwadrat).
* **Inteligentne pozycjonowanie:** System "Clamping" zapobiega powstawaniu białych dziur przy przesuwaniu zdjęcia.
* **Media Library:** Wbudowana galeria zdjęć z wyszukiwarką, tagowaniem i podziałem na kategorie.
* **Eksport ZIP:** Generowanie paczki ze wszystkimi formatami jednym kliknięciem (JSZip).
* **Skalowalna architektura:** Łatwe dodawanie nowych marek (Szkolenia, Technikum, Liceum) poprzez pliki konfiguracyjne.

## 🛠️ Technologie

Projekt jest napisany w czystym **Vanilla JS**, bez zbędnych frameworków, co zapewnia szybkość i łatwość edycji.

* **HTML5 / CSS3** (CSS Grid, Flexbox, CSS Variables)
* **JavaScript (ES6+)**
* **Python** (Skrypty automatyzacji `scanner.py`)
* **Biblioteki zewnętrzne:** `JSZip` (do pakowania plików).

## 📂 Struktura Projektu

```text
/PAW-System
│
├── index.html              # Dashboard (Pulpit)
├── szkolenia.html          # Generator dla marki TEB Szkolenia
├── zasoby.html  
├── status.html  
├── kontakt.html  
│
├── assets/                 # Pliki graficzne
│   ├── gallery/            # Baza zdjęć (podfoldery to kategorie)
│   ├── overlays/           # Ramki/Szablony .png
│   └── icons/              # Ikony interfejsu
│
├── css/
│   ├── main.css            # Główny plik importujący
│   ├── _layout.css         # Układ strony (Grid, Nav)
│   ├── _components.css     # Style kafelków, modali, przycisków
│   └── theme-szkolenia.css # Kolorystyka dla konkretnej marki
│
├── js/
│   ├── core/               # Logika silnika
│   │   ├── generator.js    # Klasa GraphicGenerator (Canvas)
│   │   ├── gallery.js      # Obsługa modala galerii
│   │   └── layout.js       # Dynamiczne menu
│   │
│   └── modules/            # Konfiguracja produktów
│       ├── config-szkolenia.js
│       └── config-liceum.js
│
├── data/
│   └── gallery.json        # Baza danych zdjęć (generowana przez scanner.py)
│
└── scanner.py              # Skrypt Python do aktualizacji bazy zdjęć