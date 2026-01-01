const themes = [
{
    bg: "#F1F3FE", 
    text: "#6B7280",
    accent: "#6C63FF",
    card: "#bbc1d4ff"
  },
  {
    bg: "#fff7e6", 
    text: "#0f2a44",
    accent: "#ff8fb3",
    card: "#ffffff"
  },
  {
    bg: "#55423d",
    text: "#fff3ec",
    accent: "#ffc0ad",
    card: "#271c19"
  },
  {
    bg: "#11120D",
    text: "#FFFAF4",
    accent: "#D8CFBC",
    card: "#565448"
  },
  {
    bg: "#0f172a",
    text: "#e2e8f0",
    accent: "#38bdf8",
    card: "#020617"
  }
];
let selectedThemeIndex = 0;
let selectedAvatarSrc = "profiili/avatar1.jpg";

function setTheme(index) {
    selectedThemeIndex = index; // tallennetaan valittu teema
    const theme = themes[index];
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--text', theme.text);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--card', theme.card);
}

function setAvatar(src) {
    const relativePath = src.substring(src.lastIndexOf('profiili/'));
    selectedAvatarSrc = relativePath;
    document.getElementById("top-avatar").src = src;
}

// klikkaa "aseta teema ja profiilikuva" nappia niiin tieto menee dataan tallennus php tiedostoon
async function saveSettings() {
    try {
        const response = await fetch('save_settings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                theme_index: selectedThemeIndex,
                profile_pic: selectedAvatarSrc
            })
        });
        const result = await response.json();
        if (result.success) {
            alert("Asetukset tallennettu onnistuneesti!");
        } else {
            alert("Virhe: " + result.error);
        }
    } catch (error) {
        console.error("Tallennusvirhe:", error);
    }
}