const profilePic = document.getElementById('profile-pic');
const profileMenu = document.querySelector('.profile-menu');
const createBoardBtn = document.getElementById('create-board-btn');
const allBoards = document.getElementById('all-boards');
const searchInput = document.getElementById('search-board');
const joinInput = document.getElementById('board-code');
const favoritesContainer = document.getElementById('favorites');
const recentContainer = document.getElementById('recent');

const RECENT_LIMIT = 5; //Määritellää äskettäisten taulujen limitti
const RECENT_KEY = "recentBoards";


const popup = document.getElementById('create-popup');
const confirmCreate = document.getElementById('confirm-create');
const cancelCreate = document.getElementById('cancel-create');
const titleInput = document.getElementById('new-board-title');
const privacySelect = document.getElementById('privacy-select');

let boards = [];
let recentBoards = [];
let currentUser = "testikäyttäjä"; // demo, korvaa oikealla kirjautuneella käyttäjällä

//teemat

// Teemojen määrittely 
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


// --- profiili ---
profilePic.addEventListener('click', () => {
  profileMenu.classList.toggle('hidden');
});

function logout() {
  alert("Uloskirjautuminen onnistui!");
  window.location.href = "../Etusivu/etusivu.html";
}

function theme() {
  window.location.href = "../Muut/Teema/Teema.html";
}

function question() {
  window.location.href = "../Muut/FAQ/FAQ.html";
}

// --- popup ---
createBoardBtn.addEventListener('click', () => {
  popup.classList.remove('hidden');
});

cancelCreate.addEventListener('click', () => {
  popup.classList.add('hidden');
  titleInput.value = '';
});

confirmCreate.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  const visibility = privacySelect.value;

  if (!title) {
    alert("Anna taululle nimi!");
    return;
  }

  try {
    // Lähetetään pyyntö backendille
    const res = await fetch('create_board.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title, visibility })
    });
    const json = await res.json();

    if (json.error) {
      alert(json.error);
      return;
    }

    // Sulje popup onnistuneen luomisen jälkeen
    popup.classList.add('hidden');
    titleInput.value = '';

    alert(`Taulu luotu! ${json.code ? "Koodi: " + json.code : "Yksityinen taulu"}`);

    // Lisää taulu listaan
    boards.push({ id: json.board_id, title, visibility, code: json.code || null, favorite: false });
    renderBoards();

  } catch (err) {
    alert("Virhe luotaessa taulua: " + err.message);
  }
});

// --- renderöinti ---
function renderBoards() {
  allBoards.innerHTML = '';
  favoritesContainer.innerHTML = '';

  boards.forEach((b, index) => {
    const card = document.createElement('div');
    card.classList.add('board-card');

    // Taulun nimi
    const title = document.createElement('span');
    title.textContent = b.title;

    // Napit ⭐ + 🗑️
    const buttonRow = document.createElement("div");
    buttonRow.style.display = "flex";
    buttonRow.style.gap = "8px";

    // Suosikki
    const favBtn = document.createElement('button');
    favBtn.textContent = b.favorite ? "⭐" : "☆";
    favBtn.addEventListener('click', e => {
      e.stopPropagation();
      b.favorite = !b.favorite;
      renderBoards();
    });

    // Poisto
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener('click', e => {
      e.stopPropagation();
      deleteBoard(b.id);
    });

    buttonRow.appendChild(favBtn);
    buttonRow.appendChild(deleteBtn);

    card.appendChild(title);
    card.appendChild(buttonRow);

    // Taulun avaaminen
    card.addEventListener('click', () => openBoard(index));

    allBoards.appendChild(card);

    // Suosikit-osio
    if (b.favorite) {
      const favCard = card.cloneNode(true);

      favCard.addEventListener('click', () => openBoard(index));

      // Poiston toimivuus suosikeissa
      favCard.querySelector("button:last-child")
        .addEventListener("click", e => {
          e.stopPropagation();
          deleteBoard(b.id);
        });

      // Suosikin toimivuus 
      favCard.querySelector("button:first-child")
        .addEventListener("click", e => {
          e.stopPropagation();
          b.favorite = false;
          renderBoards();
        });

      favoritesContainer.appendChild(favCard);
    }
  });
}


// --- lataa taulut 
document.addEventListener("DOMContentLoaded", () => {
  loadBoards();
  renderRecentBoards();
});

async function loadBoards() {
  try {
    const res = await fetch("get_boards.php");
    const data = await res.json();

    boards = data.map(b => ({
      id: b.id,
      title: b.title,
      visibility: b.visibility,
      code: b.code,
      favorite: false
    }));

    renderBoards();
  } catch (err) {
    alert("Taulut eivät latautuneet");
  }
}


// --- taulun avaaminen ---
function openBoard(index) {
  const board = boards[index];

  // Päivitä äskettäin avatut
  updateRecentBoards(board);

  window.open(
    `../taulunakyma/taulunakyma.html?id=${board.id}`,
    "_blank"
  );
}



// --- taulujen haku ---
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(query)
  );

  renderFilteredBoards(filteredBoards);
});

function renderFilteredBoards(filteredBoards) {
  allBoards.innerHTML = '';
  favoritesContainer.innerHTML = '';

  filteredBoards.forEach((b, index) => {
    const card = document.createElement('div');
    card.classList.add('board-card');

    const title = document.createElement('span');
    title.textContent = b.title;

    const favBtn = document.createElement('button');
    favBtn.textContent = b.favorite ? "⭐" : "☆";
    favBtn.addEventListener('click', e => {
      e.stopPropagation();
      b.favorite = !b.favorite;
      renderFilteredBoards(filteredBoards);
    });

    card.appendChild(title);
    card.appendChild(favBtn);

    card.addEventListener('click', () => {
      const realIndex = boards.indexOf(b);
      openBoard(realIndex);
    });

    allBoards.appendChild(card);

    if (b.favorite) {
      const favCard = card.cloneNode(true);
      favCard.addEventListener('click', () => {
        const realIndex = boards.indexOf(b);
        openBoard(realIndex);
      });
      favoritesContainer.appendChild(favCard);
    }
  });
}
//Poisto---------------------------------------------------
async function deleteBoard(boardId) {
  if (!confirm("Haluatko varmasti poistaa tämän taulun?")) return;

  try {
    const res = await fetch("delete_board.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: boardId })
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    // Poista taulu frontendistä
    boards = boards.filter(b => b.id !== boardId);

    // Poista myös äskettäisistä
    let recent = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    recent = recent.filter(b => b.id !== boardId);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));

    renderBoards();
    renderRecentBoards();

  } catch (err) {
    alert("Taulun poisto epäonnistui");
  }
}

async function applyUserSettings() {
    try {
        const res = await fetch('../Muut/Teema/get_user_settings.php'); 
        const user = await res.json();
        
        if (user.success) {
            // asenna teema
            const userTheme = themes[user.theme_index]; 
            if(userTheme) {
                document.documentElement.style.setProperty('--bg', userTheme.bg);
                document.documentElement.style.setProperty('--accent', userTheme.accent);
                document.documentElement.style.setProperty('--card', userTheme.card);
            }
            
            // päivitä profiilikuva
            const profilePicEl = document.getElementById('profile-pic');
            if (profilePicEl) {
                profilePicEl.src = "../Muut/Teema/" + user.profile_pic;
            }
        }
    } catch (err) {
        console.log("Asetusten latausvirhe");
    }
}

//  
document.addEventListener("DOMContentLoaded", () => {
    applyUserSettings(); // lataa käyttäjän asetukset
    loadBoards();
});


// Yhdistetty funktio asetusten lataamiseen
async function loadAndApplyUserSettings() {
    try {
        // MUUTA TÄMÄ POLKU tarvittaessa: '../Muut/Teema/get_user_settings.php'
        const response = await fetch('../Muut/Teema/get_user_settings.php'); 
        const data = await response.json();

        if (data.success) {
            // 1. Käytä teemaa
            const theme = themes[data.theme_index];
            if (theme) {
                document.documentElement.style.setProperty('--bg', theme.bg);
                document.documentElement.style.setProperty('--text', theme.text);
                document.documentElement.style.setProperty('--accent', theme.accent);
                document.documentElement.style.setProperty('--card', theme.card);
            }

            // 2. Päivitä profiilikuva
            const profileImg = document.getElementById("profile-pic");
            if (profileImg) {
                // Varmista polku profiilikuvaan
                profileImg.src = "../Muut/Teema/" + data.profile_pic;
            }
        }
    } catch (error) {
        console.error("Asetusten lataus epäonnistui:", error);
    }
}
// VAIN YKSI DOMContentLoaded-kuuntelija
document.addEventListener("DOMContentLoaded", () => {
    loadAndApplyUserSettings(); 
    loadBoards(); // Tämä lataa ne kadonneet taulut
});

async function deleteBoard(boardId) {
  if (!confirm("Haluatko varmasti poistaa tämän taulun?")) return;

  boards = boards.filter(b => b.id !== boardId);

  // Poista myös äskettäisistä
  let recent = JSON.parse(localStorage.getItem("recentBoards")) || [];
  recent = recent.filter(b => b.id !== boardId);
  localStorage.setItem("recentBoards", JSON.stringify(recent));

  renderBoards();
  renderRecentBoards();
}


function updateRecentBoards(board) {
  let recent = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];

  // Poista jos taulu on jo listalla
  recent = recent.filter(b => b.id !== board.id);

  // Lisää kärkeen
  recent.unshift({
    id: board.id,
    title: board.title
  });

  // Rajaa max 5
  if (recent.length > RECENT_LIMIT) {
    recent = recent.slice(0, RECENT_LIMIT);
  }

  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  renderRecentBoards();
}

function renderRecentBoards() {
  recentContainer.innerHTML = "";

  const recent = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];

  recent.forEach(r => {
    const board = boards.find(b => b.id === r.id);
    if (!board) return;

    const card = document.createElement("div");
    card.classList.add("board-card");

    const title = document.createElement("span");
    title.textContent = board.title;

    card.appendChild(title);

    card.addEventListener("click", () => {
      const index = boards.indexOf(board);
      openBoard(index);
    });

    recentContainer.appendChild(card);
  });
}
