// Globaali muuttuja, jotta muut JS-tiedostot pääsevät teksteihin käsiksi
let translations = {}; 

async function applyLanguage(lang) {
    try {
        // Haetaan tiedosto lang-kansiosta
        const res = await fetch(`../lang/${lang}.json`);
        if (!res.ok) throw new Error("Käännöstiedostoa ei löytynyt");
        
        translations = await res.json(); 

        // 1. Tavalliset tekstielementit
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            if (translations[key]) el.textContent = translations[key];
        });

        // 2. Placeholder-tekstit
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            if (translations[key]) el.placeholder = translations[key];
        });

        // 3. Title-tekstit
        document.querySelectorAll("[data-i18n-title]").forEach(el => {
            const key = el.dataset.i18nTitle;
            if (translations[key]) el.title = translations[key];
        });

        // Tallenna valinta muistiin
        localStorage.setItem("language", lang);

        // Lähetetään tapahtuma dynaamiselle sisällölle
        document.dispatchEvent(new Event('languageChanged'));

    } catch (err) {
        console.error("Language load failed:", err);
    }
}

// Apufunktio: t('avain') palauttaa tekstin
function t(key) {
    return translations[key] || key; 
}

// --- CUSTOM DROPDOWN LOGIIKKA ALKAA TÄSTÄ ---

function setupCustomSelect() {
    const selected = document.getElementById("selected-lang");
    const optionsContainer = document.getElementById("lang-options");
    const options = optionsContainer ? optionsContainer.querySelectorAll("div") : [];

    if (!selected || !optionsContainer) return;

    // 1. Avaa/sulje valikko klikkaamalla
    selected.addEventListener("click", (e) => {
        e.stopPropagation();
        optionsContainer.classList.toggle("select-hide");
    });

    // 2. Kielen valinta listasta
    options.forEach(option => {
        option.addEventListener("click", function() {
            const lang = this.getAttribute("data-value");
            
            // Päivitä yläpalkin näkyvä teksti ja lippu
            selected.innerHTML = this.innerHTML;
            
            // Suorita kielen vaihto
            applyLanguage(lang);
            
            optionsContainer.classList.add("select-hide");
        });
    });

    // 3. Sulje valikko jos klikataan muualle sivulla
    window.addEventListener("click", () => {
        optionsContainer.classList.add("select-hide");
    });
}

// Alustus kun sivu latautuu
function loadLanguage() {
    const savedLang = localStorage.getItem("language") || "fi";
    applyLanguage(savedLang);

    // Päivitetään custom selectin teksti vastaamaan tallennettua kieltä
    const optionsContainer = document.getElementById("lang-options");
    const selected = document.getElementById("selected-lang");
    
    if (optionsContainer && selected) {
        const activeOption = Array.from(optionsContainer.querySelectorAll("div"))
                                  .find(opt => opt.dataset.value === savedLang);
        if (activeOption) {
            selected.innerHTML = activeOption.innerHTML;
        }
    }

    setupCustomSelect();
}

document.addEventListener("DOMContentLoaded", loadLanguage);