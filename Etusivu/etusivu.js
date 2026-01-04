const langSelect = document.getElementById("language-select");

if (langSelect) {
  langSelect.addEventListener("change", () => {
    const lang = langSelect.value;
    localStorage.setItem("language", lang);
    applyLanguage(lang);
  });
}

const loginBtn = document.querySelector(".login-btn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    window.location.href = "../Kirjautuminen/kirjautuminen.html";
  });
}
 
