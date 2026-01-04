// Globaali muuttuja, jotta muut JS-tiedostot (kuten taulunakyma.js) pääsevät teksteihin käsiksi
let translations = {}; 

async function applyLanguage(lang) {
    try {
        const res = await fetch(`../lang/${lang}.json`);
        translations = await res.json(); // Tallennetaan globaaliin muuttujaan

        // 1. Tavalliset tekstielementit
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            if (translations[key]) el.textContent = translations[key];
        });

        // 2. Placeholder-tekstit (inputit)
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            if (translations[key]) el.placeholder = translations[key];
        });

        // 3. Title-tekstit (työkaluvihjeet)
        document.querySelectorAll("[data-i18n-title]").forEach(el => {
            const key = el.dataset.i18nTitle;
            if (translations[key]) el.title = translations[key];
        });

        // Lähetetään tapahtuma, että kieli on ladattu (hyödyllinen dynaamiselle sisällölle)
        document.dispatchEvent(new Event('languageChanged'));

    } catch (err) {
        console.error("Language load failed:", err);
    }
}

// Apufunktio JS-tiedostoille: t('avain') palauttaa tekstin
function t(key) {
    return translations[key] || key; 
}

function loadLanguage() {
    const lang = localStorage.getItem("language") || "fi";
    applyLanguage(lang);

    const select = document.getElementById("language-select");
    if (select) select.value = lang;
}

document.addEventListener("DOMContentLoaded", loadLanguage);