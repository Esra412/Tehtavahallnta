// 1. Teemojen määrittely (sama kuin muilla sivuilla)
const themes = [
  { bg: "#F1F3FE", text: "#6B7280", accent: "#6C63FF", card: "#BBC1D4" },
  { bg: "#fff7e6", text: "#0f2a44", accent: "#ff8fb3", card: "#ffffff" },
  { bg: "#55423d", text: "#fff3ec", accent: "#ffc0ad", card: "#271c19" },
  { bg: "#11120D", text: "#FFFAF4", accent: "#D8CFBC", card: "#565448" },
  { bg: "#0f172a", text: "#e2e8f0", accent: "#38bdf8", card: "#020617" }
];

// --- Teeman latausfunktio ---
async function applyTheme() {
    try {
        const response = await fetch('../Teema/get_user_settings.php'); 
        const data = await response.json();

        if (data.success) {
            const theme = themes[data.theme_index];
            if (theme) {
                document.documentElement.style.setProperty('--bg', theme.bg);
                document.documentElement.style.setProperty('--text', theme.text);
                document.documentElement.style.setProperty('--accent', theme.accent);
                document.documentElement.style.setProperty('--card', theme.card);
            }
        }
    } catch (error) {
        console.log("Teeman lataus epäonnistui FAQ-sivulla");
    }
}

// Suoritetaan heti kun sivu latautuu
document.addEventListener("DOMContentLoaded", applyTheme);

// --- Nykyinen FAQ-koodisi jatkuu tästä ---
const items = document.querySelectorAll('.faq-item');
items.forEach(item => {
  const button = item.querySelector('.faq-question');
  button.addEventListener('click', () => {
    items.forEach(i => {
      if (i !== item) {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = null;
      }
    });

    item.classList.toggle('active');
    const answer = item.querySelector('.faq-answer');

    if (item.classList.contains('active')) {
      answer.style.maxHeight = answer.scrollHeight + "px";
    } else {
      answer.style.maxHeight = null;
    }
  });
});