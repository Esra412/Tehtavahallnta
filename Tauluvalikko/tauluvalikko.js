/* =======================
   ELEMENTIT & MUUTTUJAT
======================= */

const profilePic = document.getElementById("profile-pic");
const profileMenu = document.querySelector(".profile-menu");
const createBoardBtn = document.getElementById("create-board-btn");
const allBoards = document.getElementById("all-boards");
const searchInput = document.getElementById("search-board");
const favoritesContainer = document.getElementById("favorites");
const recentContainer = document.getElementById("recent");

const popup = document.getElementById("create-popup");
const confirmCreate = document.getElementById("confirm-create");
const cancelCreate = document.getElementById("cancel-create");
const titleInput = document.getElementById("new-board-title");
const privacySelect = document.getElementById("privacy-select");

const RECENT_KEY = "recentBoards";
const RECENT_LIMIT = 5;

let boards = [];

/* =======================
   TEEMAT
======================= */

const themes = [
  { bg: "#F1F3FE", text: "#6B7280", accent: "#6C63FF", card: "#bbc1d4ff" },
  { bg: "#fff7e6", text: "#0f2a44", accent: "#ff8fb3", card: "#ffffff" },
  { bg: "#55423d", text: "#fff3ec", accent: "#ffc0ad", card: "#271c19" },
  { bg: "#11120D", text: "#FFFAF4", accent: "#D8CFBC", card: "#565448" },
  { bg: "#0f172a", text: "#e2e8f0", accent: "#38bdf8", card: "#020617" }
];

/* =======================
   PROFIILI
======================= */

profilePic.addEventListener("click", () => {
  profileMenu.classList.toggle("hidden");
});

function logout() {
  window.location.href = "../Etusivu/etusivu.html";
}

function theme() {
  window.location.href = "../Muut/Teema/Teema.html";
}

function question() {
  window.location.href = "../Muut/FAQ/FAQ.html";
}

/* =======================
   POPUP – LUO TAULU
======================= */

createBoardBtn.addEventListener("click", () => {
  popup.classList.remove("hidden");
});

cancelCreate.addEventListener("click", () => {
  popup.classList.add("hidden");
  titleInput.value = "";
});

confirmCreate.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const visibility = privacySelect.value;

  if (!title) {
    alert("Anna taululle nimi");
    return;
  }

  try {
    const res = await fetch("create_board.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, visibility })
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.error);
      return;
    }

    popup.classList.add("hidden");
    titleInput.value = "";

    boards.push({
      id: data.board_id,
      title,
      visibility,
      code: data.code || null,
      favorite: false
    });

    renderBoards();

  } catch {
    alert("Taulun luonti epäonnistui");
  }
});

/* =======================
   TAULUJEN LATAUS
======================= */

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
    renderRecentBoards();

  } catch {
    alert("Tauluja ei voitu ladata");
  }
}

/* =======================
   RENDERÖINTI
======================= */

function renderBoards() {
  allBoards.innerHTML = "";
  favoritesContainer.innerHTML = "";

  boards.forEach((b, index) => {
    const card = document.createElement("div");
    card.className = "board-card";

    const title = document.createElement("span");
    title.textContent = b.title;

    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.gap = "8px";

    const favBtn = document.createElement("button");
    favBtn.textContent = b.favorite ? "⭐" : "☆";
    favBtn.onclick = e => {
      e.stopPropagation();
      b.favorite = !b.favorite;
      renderBoards();
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.onclick = e => {
      e.stopPropagation();
      deleteBoard(b.id);
    };

    btnRow.append(favBtn, delBtn);
    card.append(title, btnRow);

    card.onclick = () => openBoard(index);

    allBoards.appendChild(card);

    if (b.favorite) {
      favoritesContainer.appendChild(card.cloneNode(true));
    }
  });
}

/* =======================
   TAULUN AVAUS
======================= */

function openBoard(index) {
  const board = boards[index];
  updateRecentBoards(board);

  window.open(
    `../taulunakyma/taulunakyma.html?id=${board.id}`,
    "_blank"
  );
}

/* =======================
   POISTO (DB + UI)
======================= */

async function deleteBoard(boardId) {
  if (!confirm("Poistetaanko taulu pysyvästi?")) return;

  try {
    const res = await fetch("delete_board.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: boardId })
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.error || "Poisto epäonnistui");
      return;
    }

    boards = boards.filter(b => b.id !== boardId);

    let recent = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    recent = recent.filter(b => b.id !== boardId);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));

    renderBoards();
    renderRecentBoards();

  } catch {
    alert("Palvelinvirhe");
  }
}

/* =======================
   ÄSKETTÄISET
======================= */

function updateRecentBoards(board) {
  let recent = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];

  recent = recent.filter(b => b.id !== board.id);
  recent.unshift({ id: board.id, title: board.title });

  if (recent.length > RECENT_LIMIT) {
    recent = recent.slice(0, RECENT_LIMIT);
  }

  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

function renderRecentBoards() {
  recentContainer.innerHTML = "";

  const recent = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];

  recent.forEach(r => {
    const board = boards.find(b => b.id === r.id);
    if (!board) return;

    const card = document.createElement("div");
    card.className = "board-card";
    card.textContent = board.title;
    card.onclick = () => openBoard(boards.indexOf(board));

    recentContainer.appendChild(card);
  });
}

/* =======================
   ASETUKSET + INIT
======================= */

async function loadAndApplyUserSettings() {
  try {
    const res = await fetch("../Muut/Teema/get_user_settings.php");
    const data = await res.json();

    if (data.success) {
      const t = themes[data.theme_index];
      if (t) {
        document.documentElement.style.setProperty("--bg", t.bg);
        document.documentElement.style.setProperty("--accent", t.accent);
        document.documentElement.style.setProperty("--card", t.card);
      }
      profilePic.src = "../Muut/Teema/" + data.profile_pic;
    }
  } catch {}
}

document.addEventListener("DOMContentLoaded", () => {
  loadAndApplyUserSettings();
  loadBoards();
});

/* =======================
   LIITY KOODILLA
======================= */
const joinBtn = document.getElementById("join-board-btn");
const codeInput = document.getElementById("board-code");

joinBtn.addEventListener("click", async () => {
  const code = codeInput.value.trim();

  if (!code) {
    alert("Syötä koodi");
    return;
  }

  try {
    const res = await fetch("join_board.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const data = await res.json();

    if (!data.success) {
      alert("Koodi on väärin");
      return;
    }

    boards.push({
      id: data.board_id,
      title: data.title,
      visibility: "shared",
      code: code,
      favorite: false
    });

    renderBoards();

    window.open(
      `../taulunakyma/taulunakyma.html?id=${data.board_id}`,
      "_blank"
    );

    codeInput.value = "";

  } catch {
    alert("Palvelinvirhe");
  }
});
