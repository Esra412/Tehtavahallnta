console.log("LANG.JS LADATTU");

const DEFAULT_LANG = "fi";
const savedLang = localStorage.getItem("language") || DEFAULT_LANG;

applyLanguage(savedLang);

const langSelect = document.getElementById("language-select");
if (langSelect) {
  langSelect.value = savedLang;

  langSelect.addEventListener("change", () => {
    const lang = langSelect.value;
    localStorage.setItem("language", lang);
    applyLanguage(lang);
  });
}

// tämä osaa lukea "theme.title" → translations.theme.title
function getNestedValue(obj, key) {
  return key.split(".").reduce((o, i) => (o ? o[i] : null), obj);
}

async function applyLanguage(lang) {
  console.log("LADATAAN:", lang);

  try {
    const response = await fetch(`/Tehtavahallnta/lang/${lang}.json`);
    if (!response.ok) throw new Error("HTTP " + response.status);

    const translations = await response.json();

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      const value = getNestedValue(translations, key);

      if (value) {
        el.innerHTML = value; // innerHTML jotta <br> toimii
      }
    });

  } catch (err) {
    console.error("KIELITIEDOSTON LATAUS EPÄONNISTUI", err);
  }
}
