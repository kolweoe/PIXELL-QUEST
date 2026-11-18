
const roomArt = document.querySelector('.room-art');
const roomCanvas = document.querySelector('.room-canvas');
const isDecorating = false;


// =====================================
// SISTEM LEVEL DAN EXP
// =====================================

const EXP_PER_LEVEL = 500;

function addQuestExp(amount) {
  amount = Number(amount);

  if (!Number.isFinite(amount) || amount <= 0) return;

  let level = Number(
    localStorage.getItem("pixelQuestLevel") || 1
  );

  let exp = Number(
    localStorage.getItem("pixelQuestEXP") || 0
  );

  exp += amount;

  let levelUp = false;

  while (exp >= EXP_PER_LEVEL) {
    exp -= EXP_PER_LEVEL;
    level++;
    levelUp = true;
  }

  localStorage.setItem("pixelQuestLevel", level);
  localStorage.setItem("pixelQuestEXP", exp);

  return {
    level: level,
    exp: exp,
    levelUp: levelUp
  };
}
function updateCoins() {
  if (coinsDisplay) {
    coinsDisplay.textContent = totalCoins;
  }

  // Sinkronkan Coins agar terbaca oleh Lobby
  localStorage.setItem("pixelQuestCoins", totalCoins);
}

// =====================================
// BACKGROUND OTOMATIS BERDASARKAN WAKTU
// =====================================

function updateLobbyBackground() {
  const hour = new Date().getHours();

  let backgroundTime;

  if (hour >= 6 && hour < 15) {
    backgroundTime = "bg-siang";
  } else if (hour >= 15 && hour < 18) {
    backgroundTime = "bg-sore";
  } else {
    backgroundTime = "bg-malam";
  }

  document.body.classList.remove(
    "bg-siang",
    "bg-sore",
    "bg-malam"
  );

  document.body.classList.add(backgroundTime);
}

function updateLobbyCoins() {
  const savedCoins = localStorage.getItem("pixelQuestCoins");
  const coinsElement = document.getElementById("coins");

  if (!coinsElement) return;

  coinsElement.textContent =
    savedCoins !== null ? savedCoins : "1250";
}

// Jalankan saat halaman dibuka
updateLobbyBackground();

// Periksa waktu setiap satu menit
setInterval(updateLobbyBackground, 60000);


// Kamar menggunakan ukuran dan posisi tetap.
const roomZoom = 1;

roomCanvas.style.transform = "none";
roomCanvas.style.cursor = "default";
const miniQuestName = document.getElementById("mini-quest-name");
const miniQuestStatus = document.getElementById("mini-quest-status");
const miniQuestTimer = document.getElementById("mini-quest-timer");

function updateMiniQuest() {
  const miniQuest = document.getElementById("mini-quest");
  const dashboardLayout = document.querySelector(".dashboard-layout");
  const dashboardSidebar = document.querySelector(".dashboard-sidebar");

  if (!miniQuest || !dashboardLayout || !dashboardSidebar) return;

  let savedTimer = null;

  try {
    savedTimer = JSON.parse(
      localStorage.getItem("pixelQuestTimerState")
    );
  } catch (error) {
    console.error("[LOBBY] Gagal membaca timer Quest:", error);
  }

const hasActiveQuest =
  savedTimer &&
  savedTimer.timerQuestId &&
  (
    savedTimer.timerRunning === true ||
    savedTimer.timerPaused === true ||
    savedTimer.timerFinished === true
  );

// Periksa ringkasan Quest hari ini.
let todaySummary = null;

try {
  todaySummary = JSON.parse(
    localStorage.getItem("pixelQuestTodaySummary")
  );
} catch (error) {
  console.warn("[LOBBY] Ringkasan Quest tidak valid.");
}

const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0")
].join("-");

const hasTodayQuest =
  todaySummary &&
  todaySummary.date === today &&
  todaySummary.hasQuest === true;

// Tidak ada Quest hari ini dan tidak ada timer aktif.
if (!hasActiveQuest) {
  dashboardLayout.classList.remove("has-active-quest");
  miniQuest.classList.remove("is-active");

  if (hasTodayQuest) {
    miniQuest.hidden = false;
    dashboardSidebar.hidden = false;
    miniQuest.classList.add("is-visible");

    miniQuestName.textContent =
      todaySummary.questName || "Quest Hari Ini";

    miniQuestStatus.textContent =
      "Pilih Quest untuk memulai petualangan";

    miniQuestTimer.textContent = "--:--";
  } else {
    miniQuest.classList.remove("is-visible");

    miniQuestName.textContent = "Belum ada quest aktif";
    miniQuestStatus.textContent = "Tugasmu akan muncul di sini.";
    miniQuestTimer.textContent = "--:--";
  }

  return;
}
  let remainingSeconds = Math.max(
    0,
    Number(savedTimer.remainingSeconds) || 0
  );

  if (savedTimer.timerRunning === true) {
    const endTime = Number(savedTimer.timerEndTime);

    if (Number.isFinite(endTime) && endTime > 0) {
      remainingSeconds = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000)
      );
    }
  }

  if (savedTimer.timerFinished === true) {
    remainingSeconds = 0;
  }

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const timerText =
    String(hours).padStart(2, "0") + ":" +
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");

miniQuest.hidden = false;
dashboardSidebar.hidden = false;

dashboardLayout.classList.add("has-active-quest");
miniQuest.classList.add("is-active");
miniQuest.classList.add("is-visible");

  miniQuestName.textContent =
    savedTimer.timerQuestName || "Quest aktif";

  miniQuestTimer.textContent = timerText;

  if (savedTimer.timerFinished === true) {
    miniQuestStatus.textContent =
      "Waktu selesai — buka Quest untuk evaluasi";
  } else if (savedTimer.timerPaused === true) {
    miniQuestStatus.textContent = "Quest sedang dijeda";
  } else if (remainingSeconds <= 0) {
    miniQuestStatus.textContent =
      "Waktu habis — buka Quest untuk evaluasi";
  } else {
    miniQuestStatus.textContent = "Quest sedang berlangsung";
  }
}

updateMiniQuest();
setInterval(updateMiniQuest, 1000);

updateLobbyCoins();
function updateLobbyCoins() {
  const savedCoins = localStorage.getItem("pixelQuestCoins");
  const coinsElement = document.getElementById("coins");

  coinsElement.textContent =
    savedCoins !== null ? savedCoins : "1250";
}

/* =====================================
   SISTEM UPGRADE KAMAR
===================================== */

const ROOM_MAX_LEVEL = 8;

const roomUpgradeCosts = {
  2: 400,
  3: 700,
  4: 1000,
  5: 1400,
  6: 1900,
  7: 2500,
  8: 3200
};

const roomNames = {
  1: "Kamar awal",
  2: "Pojok belajar",
  3: "Ruang santai",
  4: "Dinding berhias",
  5: "Pojok baca",
  6: "Area pakaian",
  7: "Teman baru",
  8: "Pojok Hobi"
};

// Ganti alamat gambar Level 8 jika asetnya sudah tersedia.
const roomImages = {
  1: "assets/kamar2.jpeg",
  2: "assets/kamar2.jpg",
  3: "assets/kamar3.jpg",
  4: "assets/kamar4.jpg",
  5: "assets/kamar5.jpg",
  6: "assets/kamar6.jpg",
  7: "assets/kamar7.jpg",
  8: "assets/kamar7.jpg" // Sementara, ganti dengan gambar Level 8 nanti.
};

const roomUpgradeButton = document.getElementById("room-upgrade-button");
const roomUpgradeDescription = document.getElementById("upgrade-description");
const roomUpgradeProgress = document.getElementById("room-upgrade-progress");
const roomUpgradeRemaining = document.getElementById("room-upgrade-remaining");

function getRoomLevel() {
  const savedLevel = Number(
    localStorage.getItem("pixelQuestRoomLevel") || 1
  );

  return Math.min(
    Math.max(Number.isFinite(savedLevel) ? savedLevel : 1, 1),
    ROOM_MAX_LEVEL
  );
}

function getCurrentCoins() {
  const savedCoins = Number(
    localStorage.getItem("pixelQuestCoins") ?? 1250
  );

  return Number.isFinite(savedCoins) && savedCoins >= 0
    ? savedCoins
    : 0;
}

function updateRoomUpgrade() {
  const level = getRoomLevel();
  const coins = getCurrentCoins();

  // Perbarui gambar kamar.
  if (roomArt) {
    roomArt.src = roomImages[level];
    roomArt.alt = roomNames[level];
  }

  // Perbarui saldo Coins.
  const coinsElement = document.getElementById("coins");

  if (coinsElement) {
    coinsElement.textContent = coins;
  }

  // Perbarui progress kamar.
  if (roomUpgradeProgress) {
    roomUpgradeProgress.style.width =
      `${(level / ROOM_MAX_LEVEL) * 100}%`;
  }

    // Kamar sudah mencapai level maksimal.
  if (level >= ROOM_MAX_LEVEL) {
    roomUpgradeDescription.textContent =
      "LEVEL MAKSIMAL — KAMAR LENGKAP";

    if (roomUpgradeRemaining) {
      roomUpgradeRemaining.textContent = "LEVEL MAKSIMAL";
    }

    roomUpgradeButton.disabled = true;
    return;
  }

  // Hitung biaya upgrade berikutnya.
  const nextLevel = level + 1;
  const cost = roomUpgradeCosts[nextLevel];

  // Hitung Coins yang masih kurang.
  const missingCoins = Math.max(0, cost - coins);

  if (roomUpgradeRemaining) {
    roomUpgradeRemaining.textContent =
      missingCoins > 0
        ? `Kurang ${missingCoins.toLocaleString("id-ID")} Coins`
        : "Siap Upgrade!";
  }

  roomUpgradeDescription.textContent =
    `Lv.${nextLevel}.${roomNames[nextLevel]}.${cost.toLocaleString("id-ID")} Coins`;

  roomUpgradeButton.disabled = coins < cost;
}

if (roomUpgradeButton) {
  roomUpgradeButton.addEventListener("click", function () {
    const currentLevel = getRoomLevel();

    if (currentLevel >= ROOM_MAX_LEVEL) {
      return;
    }

    const nextLevel = currentLevel + 1;
    const upgradeCost = roomUpgradeCosts[nextLevel];
    const currentCoins = getCurrentCoins();

    // Periksa apakah Coins mencukupi.
    if (currentCoins < upgradeCost) {
      alert(
        `Coins tidak cukup!\n\n` +
        `Biaya upgrade: ${upgradeCost} Coins\n` +
        `Coins kamu: ${currentCoins} Coins`
      );
      return;
    }

    // Kurangi Coins dan naikkan level kamar.
    const remainingCoins = currentCoins - upgradeCost;

    localStorage.setItem(
      "pixelQuestCoins",
      String(remainingCoins)
    );

    localStorage.setItem(
      "pixelQuestRoomLevel",
      String(nextLevel)
    );

    // Tampilkan kamar dan saldo terbaru.
    updateRoomUpgrade();

    alert(
      `Upgrade berhasil!\n\n` +
      `Kamar sekarang: ${roomNames[nextLevel]}\n` +
      `Sisa Coins: ${remainingCoins}`
    );
  });
}

// Tampilkan kondisi kamar saat Lobby dibuka.
updateRoomUpgrade();

// Perbarui tampilan jika saldo berubah dari tab lain.
window.addEventListener("storage", function(event) {
  if (
    event.key === "pixelQuestCoins" ||
    event.key === "pixelQuestRoomLevel"
  ) {
    updateRoomUpgrade();
  }
});



// =====================================
// LEVEL DAN EXP LOBBY
// =====================================

const MAX_EXP = 500;

function updateLobbyLevel() {
  const level = Number(localStorage.getItem("pixelQuestLevel") || 1);
  const exp = Number(localStorage.getItem("pixelQuestEXP") || 0);

  const levelNumber = document.getElementById("level-number");
  const expFill = document.getElementById("exp-fill");
  const expText = document.getElementById("exp-text");
  const expPop = document.getElementById("exp-pop");

  if (!levelNumber || !expFill || !expText) return;

  const savedLevel = localStorage.getItem("pixelQuestShownLevel");
  const savedExp = localStorage.getItem("pixelQuestShownEXP");

  const previousLevel = Number(savedLevel);
  const previousExp = Number(savedExp);

  const currentProgress = Math.min(
    Math.max((exp / MAX_EXP) * 100, 0),
    100
  );

  levelNumber.textContent = "Lv. " + level;
  expText.textContent = `${exp} / ${MAX_EXP} EXP`;

  // Tampilan awal saat pertama kali membuka Lobby.
  if (savedLevel === null || savedExp === null) {
    expFill.style.transition = "none";
    expFill.style.width = currentProgress + "%";

    requestAnimationFrame(() => {
      expFill.style.transition = "";
    });
  }

  // Animasi ketika naik level.
  else if (level > previousLevel) {
    expFill.style.width = "100%";

    if (expPop) {
      expPop.classList.remove("show");
      void expPop.offsetWidth;
      expPop.classList.add("show");
    }

    setTimeout(() => {
      expFill.style.transition = "none";
      expFill.style.width = "0%";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          expFill.style.transition = "";
          expFill.style.width = currentProgress + "%";
        });
      });
    }, 750);
  }

  // Animasi ketika EXP bertambah.
  else if (exp > previousExp) {
    const oldProgress = Math.min(
      (previousExp / MAX_EXP) * 100,
      100
    );

    expFill.style.transition = "none";
    expFill.style.width = oldProgress + "%";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        expFill.style.transition = "";
        expFill.style.width = currentProgress + "%";
      });
    });
  }

  else {
    expFill.style.width = currentProgress + "%";
  }

  localStorage.setItem("pixelQuestShownLevel", level);
  localStorage.setItem("pixelQuestShownEXP", exp);
}

// Jalankan sekali ketika Lobby dibuka.
updateLobbyLevel();

// Sinkronisasi jika data EXP berubah dari tab lain.
window.addEventListener("storage", function(event) {
  if (
    event.key === "pixelQuestEXP" ||
    event.key === "pixelQuestLevel"
  ) {
    updateLobbyLevel();
  }
});
const furnitureLayer = document.getElementById("furniture-layer");

function renderFurniture() {
  if (!furnitureLayer) return;

  const ownedItems = JSON.parse(
    localStorage.getItem("pixelQuestOwnedItems") || "[]"
  );

  const savedPositions = JSON.parse(
    localStorage.getItem("pixelQuestFurniturePositions") || "{}"
  );

  // Data furnitur sementara.
  const furnitureItems = [
    {
      id: "plant",
      name: "Tanaman Hias",
      emoji: "🪴",
      image: "assets/furniture/bunga.jpg"
    },
    {
      id: "lamp",
      name: "Lampu Belajar",
      emoji: "💡"
    },
    {
      id: "bookshelf",
      name: "Rak Buku",
      emoji: "📚"
    },
    {
      id: "clock",
      name: "Jam Dinding",
      emoji: "🕒"
    },
    {
      id: "potion",
      name: "Potion Fokus",
      emoji: "🧪"
    },
    {
      id: "trophy",
      name: "Piala Prestasi",
      emoji: "🏆"
    }
  ];

  furnitureLayer.innerHTML = "";

  furnitureItems.forEach(function (item) {
    // Hanya tampilkan barang yang sudah dimiliki.
    if (!ownedItems.includes(item.id)) return;

    // Bunga menggunakan gambar, barang lainnya menggunakan emoji.
    const furniture = document.createElement(
      item.image ? "img" : "div"
    );

    furniture.className = "furniture-item";
    furniture.dataset.itemId = item.id;
    furniture.draggable = false;

    if (item.image) {
      furniture.src = item.image;
      furniture.alt = item.name;
    } else {
      furniture.classList.add("furniture-emoji");
      furniture.textContent = item.emoji;
      furniture.setAttribute("role", "img");
      furniture.setAttribute("aria-label", item.name);
    }

    // Gunakan posisi tersimpan atau posisi awal.
    furniture.style.left =
      savedPositions[item.id]?.left || "15%";

    furniture.style.top =
      savedPositions[item.id]?.top || "55%";

    furnitureLayer.appendChild(furniture);

    // Furnitur hanya dapat dipindahkan dalam mode dekorasi.
    furniture.addEventListener("pointerdown", function (event) {
      if (!isDecorating) return;
      if (event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();

      furniture.setPointerCapture(event.pointerId);

      const startX = event.clientX;
      const startY = event.clientY;

      // Ubah posisi awal dari persen menjadi piksel.
      const startLeft =
        (parseFloat(furniture.style.left) / 100) *
        furnitureLayer.clientWidth;

      const startTop =
        (parseFloat(furniture.style.top) / 100) *
        furnitureLayer.clientHeight;

      function moveFurniture(moveEvent) {
        const scale = roomZoom || 1;

        let newLeft =
          startLeft + (moveEvent.clientX - startX) / scale;

        let newTop =
          startTop + (moveEvent.clientY - startY) / scale;

        // Jaga furnitur agar tidak keluar dari kamar.
        newLeft = Math.max(
          0,
          Math.min(
            newLeft,
            furnitureLayer.clientWidth - furniture.offsetWidth
          )
        );

        newTop = Math.max(
          0,
          Math.min(
            newTop,
            furnitureLayer.clientHeight - furniture.offsetHeight
          )
        );

        furniture.style.left =
          `${(newLeft / furnitureLayer.clientWidth) * 100}%`;

        furniture.style.top =
          `${(newTop / furnitureLayer.clientHeight) * 100}%`;
      }

      function stopMoving() {
        const positions = JSON.parse(
          localStorage.getItem("pixelQuestFurniturePositions") || "{}"
        );

        positions[item.id] = {
          left: furniture.style.left,
          top: furniture.style.top
        };

        localStorage.setItem(
          "pixelQuestFurniturePositions",
          JSON.stringify(positions)
        );

        furniture.removeEventListener(
          "pointermove",
          moveFurniture
        );

        furniture.removeEventListener(
          "pointerup",
          stopMoving
        );

        furniture.removeEventListener(
          "pointercancel",
          stopMoving
        );
      }

      furniture.addEventListener("pointermove", moveFurniture);
      furniture.addEventListener("pointerup", stopMoving);
      furniture.addEventListener("pointercancel", stopMoving);
    });
  });
}
const soundButton = document.getElementById("soundButton");
let soundEnabled = true;

soundButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;

    soundButton.classList.toggle("is-off", !soundEnabled);

    soundButton.setAttribute(
        "aria-label",
        soundEnabled ? "Matikan suara" : "Nyalakan suara"
    );

    soundButton.classList.remove("sound-animate");
    void soundButton.offsetWidth;
    soundButton.classList.add("sound-animate");
});

renderFurniture();

// NAVIGASI MENU LOBBY
const halaman = {
  quest: "quest-preview.html",
  habits: "todolist/todolist.html",
  finance: "finance-preview.html"
};

// BURGER MENU — PENGATURAN
const menuToggle = document.getElementById("menuToggle");
const burgerMenu = document.getElementById("burgerMenu");

menuToggle.addEventListener("click", () => {
    const isOpening = burgerMenu.hidden;

    burgerMenu.hidden = !isOpening;

    menuToggle.setAttribute(
        "aria-expanded",
        String(isOpening)
    );
});

// Tutup jika klik di luar menu
document.addEventListener("click", (event) => {
    if (
        !burgerMenu.contains(event.target) &&
        !menuToggle.contains(event.target)
    ) {
        burgerMenu.hidden = true;
        menuToggle.setAttribute("aria-expanded", "false");
    }
});

// Tutup dengan Escape
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        burgerMenu.hidden = true;
        menuToggle.setAttribute("aria-expanded", "false");
    }
});


// =================================
// MENU KARAKTER
// =================================

const characterMenu = document.getElementById("character-menu");
const characterList = document.getElementById("character-list");
const closeCharacterMenu = document.getElementById("close-character-menu");
const selectedCharacterName = document.getElementById("selected-character-name");
const playerSprite = document.querySelector(".player-character-sprite");
// Ambil daftar karakter yang sudah dibeli
function getOwnedCharacterIds() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("pixelQuestOwnedCharacters") || '["petualang"]'
        );

        return Array.isArray(saved) ? saved : ["petualang"];
    } catch {
        return ["petualang"];
    }
}

// Karakter awal selalu tersedia.
// Karakter lainnya harus sudah dibeli.
function getAvailableCharacters() {
    const owned = getOwnedCharacterIds();

    return characterCatalog.filter(character =>
        character.id === "petualang" || owned.includes(character.id)
    );
}

// Daftar karakter yang tersedia
const characterCatalog = window.PQ_CHARACTER_CATALOG;

let activeCharacter = localStorage.getItem("pq-active-character") || "petualang";

function selectCharacter(character) {
    if (!playerSprite) return;

    playerSprite.style.backgroundImage = `url("${character.image}")`;

    activeCharacter = character.id;

    localStorage.setItem("pq-active-character", character.id);

    selectedCharacterName.textContent = `Karakter aktif: ${character.name}`;

    renderCharacterList();
}
function renderCharacterList() {
    characterList.innerHTML = "";

    const availableCharacters = getAvailableCharacters();

    availableCharacters.forEach(character => {
        const isSelected = character.id === activeCharacter;

        const option = document.createElement("button");
        option.type = "button";
        option.className = `character-option ${isSelected ? "selected" : ""}`;

        const preview = document.createElement("span");
        preview.className = "character-option-sprite";
        preview.style.backgroundImage = `url("${character.image}")`;

        const name = document.createElement("span");
        name.className = "character-option-name";
        name.textContent = character.name;

        const status = document.createElement("span");
        status.className = "character-option-status";
        status.textContent = isSelected ? "✓ DIPILIH" : "PILIH";

        option.append(preview, name, status);

        option.addEventListener("click", () => {
            selectCharacter(character);
        });

        characterList.appendChild(option);
    });

    const current = availableCharacters.find(
        item => item.id === activeCharacter
    );

    if (current) {
        selectedCharacterName.textContent =
            `Karakter aktif: ${current.name}`;
    }
}

// Buka menu karakter
function openCharacterMenu() {
    renderCharacterList();
    characterMenu.hidden = false;
}

// Tutup menu karakter
function hideCharacterMenu() {
    characterMenu.hidden = true;
}

closeCharacterMenu.addEventListener("click", hideCharacterMenu);

characterMenu.addEventListener("click", event => {
    if (event.target === characterMenu) {
        hideCharacterMenu();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        hideCharacterMenu();
    }
});
// Pulihkan karakter terakhir yang masih dimiliki
const availableCharacters = getAvailableCharacters();

const savedCharacter = availableCharacters.find(
    item => item.id === activeCharacter
);

if (savedCharacter) {
    selectCharacter(savedCharacter);
} else {
    activeCharacter = "petualang";

    const defaultCharacter = characterCatalog.find(
        item => item.id === "petualang"
    );

    selectCharacter(defaultCharacter);
}
// Navigasi Lobby
document.querySelectorAll(".nav-button[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        const page = button.dataset.page;

        if (page === "character") {
            openCharacterMenu();
            return;
        }

      const tujuan = {
        quest: "quest-preview.html",
        habits: "todolist/todolist.html",
        finance: "finance-preview.html",
        shop: "shop.html"
      };

        if (tujuan[page]) {
            window.location.href = tujuan[page];
        } else {
            console.warn("Halaman belum tersedia:", page);
        }
    });
});
