
// =====================================
// 1. DATA QUEST SEMENTARA
// =====================================
const API_URL = "https://script.google.com/macros/s/AKfycbyJlfi6H2oEx10brYSXi_7eWDt4V5y3KsrXpmMk8UIBnjZr820kp92rzQ80kifvPb6V/exec";
// =====================================
// DATA QUEST DARI GOOGLE SHEETS
// =====================================

const quests = [];
// =====================================
// 1A. DATA KATEGORI QUEST
// =====================================

const questCategories = [
  { id: "belajar", name: "Belajar", icon: "belajar.png" },
  { id: "pekerjaan", name: "Pekerjaan", icon: "pekerjaan.png" },
  { id: "ibadah", name: "Ibadah", icon: "ibadah.png" },
  { id: "kesehatan", name: "Kesehatan", icon: "kesehatan.png" },
  { id: "olahraga", name: "Olahraga", icon: "olahraga.png" },
  { id: "kreativitas", name: "Kreativitas", icon: "kreativitas.png" },
  { id: "rumah_tangga", name: "Rumah Tangga", icon: "rumah-tangga.png" },
  { id: "keuangan", name: "Keuangan", icon: "keuangan.png" },
  { id: "hiburan", name: "Hiburan", icon: "hiburan.png" },
  { id: "bermain_game", name: "Bermain Game", icon: "bermain-game.png" },
  { id: "sosial", name: "Sosial", icon: "sosial.png" },
  { id: "lainnya", name: "Lainnya", icon: "lainnya.png" }
];

// =====================================
// 1B. SISTEM GAMBAR OTOMATIS QUEST
// =====================================

function getQuestCategoryImage(category) {
  const selectedCategory = questCategories.find(function(item) {
    return item.id === category;
  });

  if (!selectedCategory) {
    return "assets/images/quest-categories/lainnya.png";
  }

  return "assets/images/quest-categories/" + selectedCategory.icon;
}

// =====================================
// 2. MENGAMBIL ELEMEN HTML
// =====================================

const questList = document.getElementById("quest-list");
let currentCategory = "all";
// Menyimpan kategori Quest yang sedang dipilih
let selectedQuestCategory = "belajar";
// Pagination daftar Quest
let questListPage = 1;
const questsPerPage = 4;

const questPrevPage = document.getElementById("quest-prev-page");
const questNextPage = document.getElementById("quest-next-page");
const questPageIndicator = document.getElementById("quest-page-indicator");

const questForm = document.getElementById("quest-form");
const backToQuestFormButton = document.getElementById("back-to-quest-form-button");
// =====================================
// TANGGAL MULAI DAN AKHIR QUEST
// =====================================

const questStartDateInput = document.getElementById(
  "new-quest-start-date"
);

const questPeriodInput = document.getElementById(
  "new-quest-period"
);

const questDatePreview = document.getElementById(
  "quest-date-preview"
);

// Mengambil tanggal lokal hari ini
function getTodayLocalDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Mengubah tanggal YYYY-MM-DD menjadi objek Date UTC
function parseQuestDate(value) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

// Menambahkan bulan atau tahun tanpa masalah tanggal overflow
function addQuestMonths(date, months) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();

  const firstDay = new Date(Date.UTC(year, month, 1));

  const lastDay = new Date(
    Date.UTC(
      firstDay.getUTCFullYear(),
      firstDay.getUTCMonth() + 1,
      0
    )
  ).getUTCDate();

  return new Date(
    Date.UTC(
      firstDay.getUTCFullYear(),
      firstDay.getUTCMonth(),
      Math.min(day, lastDay)
    )
  );
}

// Menghitung tanggal akhir berdasarkan periode
function calculateQuestEndDate(startValue, period) {
  if (!startValue || !period) return "";

  const startDate = parseQuestDate(startValue);
  let nextDate;

  if (period === "weekly") {
    nextDate = new Date(startDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 7);

  } else if (period === "monthly") {
    nextDate = addQuestMonths(startDate, 1);

  } else if (period === "yearly") {
    nextDate = addQuestMonths(startDate, 12);

  } else {
    return "";
  }

  // Tanggal akhir adalah satu hari sebelum periode berikutnya
  nextDate.setUTCDate(nextDate.getUTCDate() - 1);

  return nextDate.toISOString().slice(0, 10);
}

// Format tanggal menjadi bahasa Indonesia
function formatQuestDate(dateValue) {
  const date = parseQuestDate(dateValue);

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

// Memperbarui informasi tanggal berakhir
function updateQuestDatePreview() {
  if (!questStartDateInput || !questPeriodInput || !questDatePreview) {
    return;
  }

  const tanggalMulai = questStartDateInput.value;
  const periode = questPeriodInput.value;

  if (!tanggalMulai) {
    questDatePreview.textContent = "Pilih tanggal mulai Quest.";
    return;
  }

  if (!periode) {
    questDatePreview.textContent =
      "Pilih periode untuk melihat tanggal berakhir.";
    return;
  }

  const tanggalBerakhir = calculateQuestEndDate(
    tanggalMulai,
    periode
  );

  questDatePreview.textContent =
    "Quest berlangsung dari " +
    formatQuestDate(tanggalMulai) +
    " sampai " +
    formatQuestDate(tanggalBerakhir) +
    ". Batas pengerjaan: pukul 23.00.";
}

// Mengatur tanggal awal otomatis ke hari ini
function setDefaultQuestStartDate() {
  if (!questStartDateInput) return;

  const hariIni = getTodayLocalDate();

  questStartDateInput.min = hariIni;
  questStartDateInput.value = hariIni;

  updateQuestDatePreview();
}

// Jalankan saat halaman dibuka
if (questStartDateInput && questPeriodInput) {
  setDefaultQuestStartDate();

  questStartDateInput.addEventListener(
    "change",
    updateQuestDatePreview
  );

  questPeriodInput.addEventListener(
    "change",
    updateQuestDatePreview
  );
}


if (questForm) {
  questForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const hariDipilih = Array.from(
      document.querySelectorAll('input[name="quest-days"]:checked')
    ).map(input => Number(input.value));

    if (hariDipilih.length === 0) {
      alert("Pilih minimal satu hari untuk Quest!");
      return;
    }

    const tombolSimpan = document.getElementById("save-quest-button");

    const dataQuest = {
      aksi: "tambah-quest",
      nama_quest: document.getElementById("new-quest-name").value.trim(),
      deskripsi: document.getElementById("new-quest-description").value.trim(),
      kategori: document.getElementById("new-quest-category").value,

      tanggal_mulai: questStartDateInput.value,
      tanggal_berakhir: calculateQuestEndDate(
        questStartDateInput.value,
        questPeriodInput.value
      ),

      hari_berulang: hariDipilih.map(hari => [
        "MINGGU", "SENIN", "SELASA", "RABU",
        "KAMIS", "JUMAT", "SABTU"
      ][hari]).join(","),

      waktu_mulai: document.getElementById("new-quest-start-time").value,
      durasi_menit: Number(document.getElementById("new-quest-duration").value),
      periode: document.getElementById("new-quest-period").value,
      target_sesi: Number(document.getElementById("new-quest-target").value),
      tingkat_kesulitan: document.getElementById("new-quest-difficulty").value,
      telegram_aktif: true
    };

    console.log("DATA QUEST YANG AKAN DIKIRIM:", dataQuest);

    tombolSimpan.disabled = true;
    tombolSimpan.textContent = "MENDAFTARKAN...";

    try {
      // 1. Simpan Quest ke Spreadsheet
      const hasil = await kirimQuestKeSpreadsheet(dataQuest);

      console.log("Respons Google Sheets:", hasil);

      if (!hasil || hasil.success !== true || !hasil.quest_id) {
        throw new Error(
          hasil?.message || "Quest gagal disimpan."
        );
      }

      const questIdBaru = String(hasil.quest_id);

      // 2. Ambil ulang data asli dari Spreadsheet
      const berhasilDimuat = await loadQuestData();

      if (!berhasilDimuat) {
        throw new Error(
          "Quest tersimpan, tetapi daftar Quest gagal dimuat ulang. Muat ulang data sebelum mencoba menambahkan lagi."
        );
      }

      // 3. Cari Quest yang baru dibuat
      const indexQuestBaru = quests.findIndex(function(quest) {
        return String(quest.questId) === questIdBaru;
      });

      if (indexQuestBaru === -1) {
        throw new Error(
          "Quest tersimpan, tetapi tidak ditemukan dalam daftar aktif."
        );
      }

      const questBaru = quests[indexQuestBaru];

      // 4. Perbarui tampilan
      currentCategory = questBaru.category;
      questListPage = 1;

      categoryButtons.forEach(function(button) {
        button.classList.toggle(
          "active",
          button.dataset.category === currentCategory
        );
      });

      questForm.reset();
      setDefaultQuestStartDate();

      showQuest(indexQuestBaru);

      alert("Quest berhasil didaftarkan dan ditambahkan ke buku!");

    } catch (error) {
      console.error("Gagal mendaftarkan Quest:", error);

      alert(
        "Gagal mendaftarkan Quest:\n" + error.message
      );

    } finally {
      tombolSimpan.disabled = false;
      tombolSimpan.textContent = "⚔ DAFTARKAN MISI";
    }
  });
}

const detailTitle = document.getElementById("detail-title");
const detailDescription = document.getElementById("detail-description");

const questTimer = document.getElementById("quest-timer");
const questReward = document.querySelector(".quest-reward");
const questStreak = document.querySelector(".quest-streak");

const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const cancelTimerButton = document.getElementById("cancel-timer-button");
const summaryButton = document.getElementById("summary-button");
const questBookPage = document.getElementById("quest-book-page");
const openQuestBookButton = document.getElementById("open-quest-book-button");
const backToQuestButton = document.getElementById("back-to-quest-button");
const saveReflectionButton = document.getElementById("save-reflection-button");
const deleteQuestButton = document.getElementById("delete-quest-button");
const closeButton = document.querySelector(".close-button");


// =====================================
// 3. VARIABEL TIMER
// =====================================

let selectedQuest = 0;
let remainingSeconds = 0;
let timerInterval = null;
let timerRunning = false;
let timerFinished = false;
let timerQuestIndex = null;
let timerPaused = false;
let activeElapsedSeconds = 0;
let timerEndTime = null;
let timerSavedQuestIndex = null;
let totalCoins = 1250;
const coinsDisplay = document.getElementById("coins-display");
function updateCoins() {
  if (coinsDisplay) {
    coinsDisplay.textContent = totalCoins;
  }

  // Simpan saldo agar dapat dibaca halaman Lobby
  localStorage.setItem(
    "pixelQuestCoins",
    String(totalCoins)
  );
}
function saveTimerState() {
  const timerState = {
    selectedQuestId: quests[selectedQuest]
      ? quests[selectedQuest].questId
      : null,

    timerQuestId:
      timerQuestIndex !== null && quests[timerQuestIndex]
        ? quests[timerQuestIndex].questId
        : null,

    timerQuestName:
      timerQuestIndex !== null && quests[timerQuestIndex]
      ? quests[timerQuestIndex].name
      : null,

    remainingSeconds,
    activeElapsedSeconds,
    timerRunning,
    timerPaused,
    timerFinished,
    timerEndTime
  };

  localStorage.setItem(
    "pixelQuestTimerState",
    JSON.stringify(timerState)
  );
}

function loadTimerState() {
  const savedTimer = localStorage.getItem("pixelQuestTimerState");

  if (!savedTimer) return false;

  try {
    const data = JSON.parse(savedTimer);

    // Format timer lama belum memiliki identitas Quest.
    // Jangan memulihkan timer dengan indeks yang berpotensi salah.
    if (!data.timerQuestId && (
      data.timerRunning ||
      data.timerPaused ||
      data.timerFinished
    )) {
      localStorage.removeItem("pixelQuestTimerState");
      return false;
    }

    // Cari Quest yang sebelumnya dipilih
    const indexQuestDipilih = quests.findIndex(function(quest) {
      return String(quest.questId) === String(data.selectedQuestId);
    });

    if (indexQuestDipilih !== -1) {
      selectedQuest = indexQuestDipilih;
    } else {
      selectedQuest = 0;
    }

    // Cari Quest pemilik timer
    if (
      data.timerRunning ||
      data.timerPaused ||
      data.timerFinished
    ) {
      const indexPemilikTimer = quests.findIndex(function(quest) {
        return String(quest.questId) === String(data.timerQuestId);
      });

      if (indexPemilikTimer === -1) {
        localStorage.removeItem("pixelQuestTimerState");
        return false;
      }

      timerQuestIndex = indexPemilikTimer;
    } else {
      timerQuestIndex = null;
    }

    // Pulihkan nilai timer
    remainingSeconds = Math.max(
      0,
      Number(data.remainingSeconds) || 0
    );

    activeElapsedSeconds = Math.max(
      0,
      Number(data.activeElapsedSeconds) || 0
    );

    timerPaused = data.timerPaused === true;
    timerFinished = data.timerFinished === true;
    timerRunning = false;

   timerEndTime =
  data.timerEndTime !== null &&
  data.timerEndTime !== undefined
    ? Number(data.timerEndTime)
    : null;

    // Pulihkan timer yang sebelumnya sedang berjalan
    if (data.timerRunning === true) {
      if (
  !Number.isFinite(timerEndTime) ||
  timerEndTime <= 0
) {
        localStorage.removeItem("pixelQuestTimerState");
        return false;
      }

      remainingSeconds = Math.max(
        0,
        Math.ceil((timerEndTime - Date.now()) / 1000)
      );

      activeElapsedSeconds = Math.max(
        0,
        quests[timerQuestIndex].duration - remainingSeconds
      );

      if (remainingSeconds <= 0) {
        remainingSeconds = 0;
        timerFinished = true;
        timerPaused = false;
      } else {
        timerRunning = true;
      }
    }

    // Pastikan Quest yang sudah selesai tidak melanjutkan timer
    if (
      quests[timerQuestIndex] &&
      quests[timerQuestIndex].statusPengerjaan === "SELESAI"
    ) {
      localStorage.removeItem("pixelQuestTimerState");
      timerQuestIndex = null;
      timerRunning = false;
      timerPaused = false;
      timerFinished = false;
      timerEndTime = null;
      return false;
    }

    return true;

  } catch (error) {
    console.error("Gagal memulihkan timer:", error);
    localStorage.removeItem("pixelQuestTimerState");
    return false;
  }
}


function renderQuestList() {
  questList.innerHTML = "";

  // FILTER: SEMUA QUEST atau HARI INI
  const filteredQuests = quests
    .map((quest, index) => ({
      ...quest,
      originalIndex: index
    }))
    .filter(quest => {
      if (currentCategory === "today") {
        return quest.isHariIni === true;
      }

      return true;
    });

  // PAGINATION
  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuests.length / questsPerPage)
  );

  questListPage = Math.min(
    Math.max(1, questListPage),
    totalPages
  );

  const startIndex = (questListPage - 1) * questsPerPage;

  const visibleQuests = filteredQuests.slice(
    startIndex,
    startIndex + questsPerPage
  );

  // TAMPILKAN QUEST
  visibleQuests.forEach(function(quest) {
    const button = document.createElement("button");

    button.className = "quest-item";
    button.dataset.quest = quest.originalIndex;

    if (quest.statusPengerjaan === "SELESAI") {
      button.classList.add("quest-completed");
    }

    if (quest.originalIndex === selectedQuest) {
      button.classList.add("active");
    }

    const iconContainer = document.createElement("span");
    iconContainer.className = "quest-icon";

    const image = document.createElement("img");
    image.src = getQuestCategoryImage(quest.category);
    image.alt = quest.name;

    iconContainer.appendChild(image);

    const infoContainer = document.createElement("span");
    infoContainer.className = "quest-item-info";

    const title = document.createElement("strong");
    title.textContent = quest.name;

    const reward = document.createElement("small");
    reward.textContent = "Reward: " + quest.reward + " Coins";

    infoContainer.appendChild(title);
    infoContainer.appendChild(reward);

    const rank = document.createElement("span");
    rank.className = "quest-rank";
    rank.textContent = quest.difficulty || "";

    button.appendChild(iconContainer);
    button.appendChild(infoContainer);
    button.appendChild(rank);

    button.addEventListener("click", function() {
      showQuest(quest.originalIndex);
    });

    questList.appendChild(button);
  });

  // JIKA KOSONG
  if (filteredQuests.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.textContent =
      currentCategory === "today"
        ? "Belum ada Quest untuk hari ini."
        : "Belum ada Quest aktif.";

    questList.appendChild(emptyMessage);
  }

  // NAVIGASI HALAMAN
  questPageIndicator.textContent =
    questListPage + " / " + totalPages;

  questPrevPage.disabled = questListPage === 1;
  questNextPage.disabled = questListPage === totalPages;
}

// NAVIGASI HALAMAN QUEST

questPrevPage.addEventListener("click", function() {
  if (questListPage > 1) {
    questListPage--;
    renderQuestList();
  }
});

questNextPage.addEventListener("click", function() {
  questListPage++;
  renderQuestList();
});

// =====================================
// 4. FORMAT WAKTU
// =====================================

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    String(hours).padStart(2, "0") + ":" +
    String(minutes).padStart(2, "0") + ":" +
    String(secs).padStart(2, "0")
  );
}


// =====================================
// 5. MENAMPILKAN DETAIL QUEST
// =====================================
function showQuest(index, pulihkanTimer = false) {

  // =====================================
  // 1. PERIKSA DATA QUEST
  // =====================================

  if (!quests.length) {
    selectedQuest = 0;

    deleteQuestButton.hidden = true;

    detailTitle.textContent = "BELUM ADA QUEST";
    detailDescription.textContent =
      "Tambahkan Quest pertamamu untuk memulai petualangan.";

    questReward.textContent = "🪙 +0 COINS";
    questStreak.textContent = "🔥 0 HARI";

    renderQuestList();

    questTimer.textContent = "00:00:00";
    startButton.disabled = true;
    pauseButton.disabled = true;
    cancelTimerButton.disabled = true;
    summaryButton.disabled = true;

    return;
  }

  // Pastikan index valid.
  if (index < 0 || index >= quests.length) {
    index = 0;
  }

  // =====================================
  // 2. PERIKSA TIMER
  // =====================================

  if (timerRunning && index !== timerQuestIndex) {
    alert("Jeda timer terlebih dahulu sebelum membuka Quest lain.");
    return;
  }

  selectedQuest = index;

  const quest = quests[index];

const sudahSelesai = questSudahSelesai(quest);

  // =====================================
  // 3. TAMPILKAN DETAIL QUEST
  // =====================================

  deleteQuestButton.hidden = !quest.questId;

  detailTitle.textContent = quest.name;
  detailDescription.textContent = quest.description;

  questReward.textContent =
    "🪙 +" + quest.reward + " COINS";

  questStreak.textContent =
    "🔥 " + (quest.streak || 0) + " HARI";

  renderQuestList();

  // =====================================
  // 4. TAMPILAN TIMER
  // =====================================

  if (timerRunning) {

    questTimer.textContent = formatTime(remainingSeconds);

    startButton.textContent = "BERJALAN";
    startButton.disabled = true;

    pauseButton.disabled = false;
    cancelTimerButton.disabled = false;
    summaryButton.disabled = true;

  } else if (timerPaused && timerQuestIndex !== null) {

    pauseButton.disabled = true;
    cancelTimerButton.disabled = false;
    summaryButton.disabled = true;

    if (index === timerQuestIndex) {

      questTimer.textContent = formatTime(remainingSeconds);

      startButton.textContent = "LANJUTKAN";
      startButton.disabled = sudahSelesai;

    } else {

      questTimer.textContent = formatTime(quest.duration);

      startButton.textContent = "MULAI";
      startButton.disabled = sudahSelesai;
    }

  } else if (timerFinished && index === timerQuestIndex) {

    questTimer.textContent = "00:00:00";

    startButton.textContent = "SELESAI";
    startButton.disabled = true;

    pauseButton.disabled = true;
    cancelTimerButton.disabled = true;
    summaryButton.disabled = false;

  } else {

    resetTimer();

    startButton.disabled = sudahSelesai;
  }
}

function openQuestBook() {
  const quest = quests[selectedQuest];

  if (!quest) {
    alert("Pilih Quest terlebih dahulu!");
    return;
  }

  document.querySelector(".quest-layout").hidden = true;
  questBookPage.hidden = false;

  document.getElementById("quest-book-title").textContent =
    quest.name;

  document.getElementById("quest-book-subtitle").textContent =
    "Catatan perjalanan Quest ini";

  questBookHistoryPage = 1;
  renderQuestBookHistory();
}

function buatIdCatatan() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return "catatan-" + Date.now() + "-" +
    Math.random().toString(36).substring(2, 10);
}


function simpanCatatanLokal(quest, dataCatatan) {
  if (!quest) {
    throw new Error("Quest tidak ditemukan.");
  }

  const storageKey =
    "pixelQuestBook_" + (quest.questId || quest.name);

  let entries = [];

  try {
    entries = JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );

    if (!Array.isArray(entries)) {
      entries = [];
    }
  } catch (error) {
    throw new Error("Data Buku Catatan tidak dapat dibaca.");
  }

  const entry = {
    entryId: buatIdCatatan(),
    date: new Date().toLocaleDateString("id-ID"),
    createdAt: new Date().toISOString(),
    ...dataCatatan
  };

  entries.push(entry);

  localStorage.setItem(
    storageKey,
    JSON.stringify(entries)
  );

  return entry;
}



function saveQuestReflection() {
  const quest = quests[selectedQuest];

  if (!quest) {
    alert("Silakan pilih Quest terlebih dahulu.");
    return;
  }

  const reflection = {
    jenisCatatan: "CATATAN_QUEST",

    learned: document
      .getElementById("reflection-learned").value.trim(),

    challenge: document
      .getElementById("reflection-challenge").value.trim(),

    improve: document
      .getElementById("reflection-improve").value.trim(),

    notes: document
      .getElementById("reflection-notes").value.trim()
  };

  if (
    !reflection.learned &&
    !reflection.challenge &&
    !reflection.improve &&
    !reflection.notes
  ) {
    alert("Isi setidaknya satu bagian refleksi!");
    return;
  }

  try {
    simpanCatatanLokal(quest, reflection);

    document.querySelectorAll(
      "#quest-book-entries textarea"
    ).forEach(function(input) {
      input.value = "";
    });

    questBookHistoryPage = 1;
    renderQuestBookHistory();

    alert("Catatan berhasil disimpan di Buku Catatan!");
  } catch (error) {
    console.error("Gagal menyimpan catatan:", error);
    alert("Catatan gagal disimpan: " + error.message);
  }
}

let questBookHistoryPage = 1;
const questBookEntriesPerPage = 2;

// Quest yang sedang dibuka di Buku Petualangan
let selectedBookQuestId = null;
function renderQuestBookHistory() {

  const historyList = document.getElementById("quest-book-history-list");
  const pagination = document.getElementById("quest-book-history-pagination");
  const pageIndicator = document.getElementById("history-page-indicator");
  const prevButton = document.getElementById("history-prev-button");
  const nextButton = document.getElementById("history-next-button");

  if (!historyList || !pagination || !pageIndicator ||
      !prevButton || !nextButton) {
    console.error("Elemen Buku Petualangan tidak ditemukan.");
    return;
  }

  function escapeHTML(value) {
    return String(value ?? "-").replace(/[&<>"']/g, function(char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  // Ambil Quest yang dipilih di halaman utama
  const quest = quests[selectedQuest];

  if (!quest) {
    historyList.innerHTML =
      "<p>Silakan pilih Quest terlebih dahulu.</p>";

    pagination.hidden = true;
    return;
  }

  // Ambil catatan khusus Quest tersebut
  const storageKey =
    "pixelQuestBook_" + (quest.questId || quest.name);

  let entries = JSON.parse(
    localStorage.getItem(storageKey) || "[]"
  );

  if (!Array.isArray(entries)) {
    entries = [];
  }

  // Berikan ID pada catatan lama jika belum ada
  let adaPerubahan = false;

  entries.forEach(function(entry) {
    if (!entry.entryId) {
      entry.entryId = buatIdCatatan();
      adaPerubahan = true;
    }
  });

  if (adaPerubahan) {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  }

  // Urutkan catatan terbaru di atas
  entries.sort(function(a, b) {
    return new Date(b.createdAt || 0) -
           new Date(a.createdAt || 0);
  });

  // Paginasi
  const totalPages = Math.max(
    1,
    Math.ceil(entries.length / questBookEntriesPerPage)
  );

  questBookHistoryPage = Math.min(
    Math.max(1, questBookHistoryPage),
    totalPages
  );

  const startIndex =
    (questBookHistoryPage - 1) * questBookEntriesPerPage;

  const visibleEntries = entries.slice(
    startIndex,
    startIndex + questBookEntriesPerPage
  );

  // Tampilkan CATATAN SAJA
  const reflectionHTML = visibleEntries.length
    ? visibleEntries.map(function(entry) {
        return `
          <article class="quest-history-entry">

            <h4>${escapeHTML(entry.date)}</h4>
            <p>
          <strong>
          ${
            entry.jenisCatatan === "REFLEKSI_SELESAI"
            ?"RANGKUMAN SETELAH QUEST SELESAI"
            :"CATATAN PERJALANAN QUEST"
          }
          </strong>
          </p>

${
  entry.evaluasi
    ? `<p><strong>Evaluasi:</strong> ${escapeHTML(entry.evaluasi)}</p>`
    : ""
}

            <p>
              <strong>Yang dipelajari:</strong>
              ${escapeHTML(entry.learned)}
            </p>

            <p>
              <strong>Kesulitan:</strong>
              ${escapeHTML(entry.challenge)}
            </p>

            <p>
              <strong>Perbaikan:</strong>
              ${escapeHTML(entry.improve)}
            </p>

            <p>
              <strong>Catatan:</strong>
              ${escapeHTML(entry.notes)}
            </p>

            <button
              type="button"
              class="delete-history-button"
              data-storage-key="${escapeHTML(storageKey)}"
              data-entry-id="${escapeHTML(entry.entryId)}"
            >
              🗑 HAPUS CATATAN
            </button>

          </article>
        `;
      }).join("")
    : "<p>Belum ada catatan untuk Quest ini.</p>";

  historyList.innerHTML = `
    <section class="quest-book-reflections">
      <h3>RIWAYAT CATATAN</h3>
      ${reflectionHTML}
    </section>
  `;

  // Atur paginasi
  pagination.hidden = entries.length <= questBookEntriesPerPage;

  pageIndicator.textContent =
    questBookHistoryPage + " / " + totalPages;

  prevButton.disabled = questBookHistoryPage === 1;
  nextButton.disabled = questBookHistoryPage === totalPages;
}


document.getElementById("quest-book-history-list")
  .addEventListener("click", function(event) {

    const button = event.target.closest(".delete-history-button");

    if (!button) return;

    const storageKey = button.dataset.storageKey;
    const entryId = button.dataset.entryId;

    if (!storageKey || !entryId) {
      alert("Data catatan tidak ditemukan.");
      return;
    }

    const yakin = confirm(
      "Apakah kamu yakin ingin menghapus catatan ini?"
    );

    if (!yakin) return;

    try {
      const entries = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );

      const index = entries.findIndex(function(entry) {
        return String(entry.entryId) === String(entryId);
      });

      if (index === -1) {
        alert("Catatan tidak ditemukan atau sudah dihapus.");
        return;
      }

      // Hapus hanya satu catatan berdasarkan ID
      entries.splice(index, 1);

      if (entries.length === 0) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(
          storageKey,
          JSON.stringify(entries)
        );
      }

      questBookHistoryPage = 1;
      renderQuestBookHistory();

      alert("Catatan berhasil dihapus.");

    } catch (error) {
      console.error("Gagal menghapus catatan:", error);
      alert("Terjadi kesalahan saat menghapus catatan.");
    }
  });

document.getElementById("history-next-button").addEventListener("click", function() {
  questBookHistoryPage++;
  renderQuestBookHistory();
});



function closeQuestBook() {
  questBookPage.hidden = true;
  document.querySelector(".quest-layout").hidden = false;
}

// =====================================
// 7. RESET TIMER
// =====================================
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerEndTime = null;

  // Jika masih ada sesi yang dijeda, jangan hapus sesi tersebut
  if (
    timerPaused &&
    timerQuestIndex !== null &&
    quests[timerQuestIndex]
  ) {
    const questPemilikTimer = quests[timerQuestIndex];

    questTimer.textContent = formatTime(remainingSeconds);

    startButton.textContent = "LANJUTKAN";
    startButton.disabled =
      selectedQuest !== timerQuestIndex ||
      questPemilikTimer.statusPengerjaan === "SELESAI";

    pauseButton.disabled = true;
    cancelTimerButton.disabled = false;
    summaryButton.disabled = true;

    return;
  }

  localStorage.removeItem("pixelQuestTimerState");

  timerQuestIndex = null;
  remainingSeconds = quests[selectedQuest]
    ? quests[selectedQuest].duration
    : 0;

  activeElapsedSeconds = 0;
  timerRunning = false;
  timerPaused = false;
  timerFinished = false;

  pauseButton.disabled = true;
  cancelTimerButton.disabled = true;
  summaryButton.disabled = true;

  questTimer.textContent = formatTime(remainingSeconds);

if (
  !quests[selectedQuest] ||
  quests[selectedQuest].statusPengerjaan === "SELESAI" ||
  quests[selectedQuest].category === "completed"
) {
    startButton.textContent = "SUDAH SELESAI";
    startButton.disabled = true;
  } else {
    startButton.textContent = "MULAI";
    startButton.disabled = false;
  }
}


// =====================================
// 8. MENJALANKAN TIMER
// =====================================
function startTimer() {
  // Pastikan ada Quest yang dipilih
  if (!quests.length || !quests[selectedQuest]) {
    alert("Belum ada Quest yang dapat dijalankan!");
    return;
  }

  if (timerRunning || timerFinished) return;

  const quest = quests[selectedQuest];

  // Cegah memulai Quest yang sudah selesai
if (
  questSudahSelesai(quest) ||
  quest.category === "completed"
) {
  alert("Quest ini sudah diselesaikan!");
  startButton.textContent = "SUDAH SELESAI";
  startButton.disabled = true;
  return;
}

  // Cegah memulai Quest lain jika masih ada sesi yang dijeda
  if (
    timerPaused &&
    timerQuestIndex !== null &&
    timerQuestIndex !== selectedQuest
  ) {
    alert(
      "Masih ada Quest yang dijeda. Lanjutkan atau batalkan Quest tersebut terlebih dahulu."
    );
    return;
  }

  // Tetapkan Quest pemilik timer
  timerQuestIndex = selectedQuest;

  timerRunning = true;
  timerPaused = false;

  timerEndTime = Date.now() + remainingSeconds * 1000;

  startButton.textContent = "BERJALAN";
  startButton.disabled = true;
  pauseButton.disabled = false;
  cancelTimerButton.disabled = false;

  saveTimerState();
jalankanIntervalTimer();
}
function jalankanIntervalTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(function() {
    if (
      timerQuestIndex === null ||
      !quests[timerQuestIndex]
    ) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning = false;
      return;
    }

    const quest = quests[timerQuestIndex];

    if (quest.statusPengerjaan === "SELESAI") {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning = false;
      return;
    }

    remainingSeconds = Math.max(
      0,
      Math.ceil((timerEndTime - Date.now()) / 1000)
    );

    activeElapsedSeconds = Math.min(
      quest.duration,
      Math.max(0, quest.duration - remainingSeconds)
    );

    questTimer.textContent = formatTime(remainingSeconds);

    saveTimerState();

    if (remainingSeconds <= 0) {
      finishTimer();
    }
  }, 250);
}


function pauseTimer() {
  if (!timerRunning) return;

  if (
    timerQuestIndex === null ||
    !quests[timerQuestIndex]
  ) {
    console.error("Quest pemilik timer tidak ditemukan.");
    return;
  }

  const quest = quests[timerQuestIndex];

  if (quest.statusPengerjaan === "SELESAI") {
    alert("Quest ini sudah diselesaikan.");
    return;
  }

  remainingSeconds = Math.max(
    0,
    Math.ceil((timerEndTime - Date.now()) / 1000)
  );

  activeElapsedSeconds = Math.max(
    0,
    quest.duration - remainingSeconds
  );

  clearInterval(timerInterval);
  timerInterval = null;

  timerRunning = false;
  timerPaused = true;
  timerEndTime = null;

  startButton.textContent = "LANJUTKAN";
  startButton.disabled = false;

  pauseButton.disabled = true;
  cancelTimerButton.disabled = false;

  questTimer.textContent = formatTime(remainingSeconds);

  saveTimerState();
}

function cancelTimer() {
  if (!timerRunning && !timerPaused && !timerFinished) {
    alert("Tidak ada sesi timer yang sedang berjalan.");
    return;
  }

  const konfirmasi = confirm(
    "Batalkan sesi timer ini? Progres waktu sesi akan dihapus."
  );

  if (!konfirmasi) return;

  clearInterval(timerInterval);
  timerInterval = null;

  // Ambil Quest pemilik timer sebelum identitasnya dihapus
  const questIndex = timerQuestIndex;
  const questPemilikTimer = quests[questIndex];

  timerRunning = false;
  timerPaused = false;
  timerFinished = false;

  timerEndTime = null;
  timerQuestIndex = null;
  activeElapsedSeconds = 0;

  if (questPemilikTimer) {
    remainingSeconds = questPemilikTimer.duration;
  } else if (quests[selectedQuest]) {
    remainingSeconds = quests[selectedQuest].duration;
  } else {
    remainingSeconds = 0;
  }

  localStorage.removeItem("pixelQuestTimerState");

  questTimer.textContent = formatTime(remainingSeconds);

  if (
    !quests[selectedQuest] ||
    quests[selectedQuest].statusPengerjaan === "SELESAI"
  ) {
    startButton.textContent = "SUDAH SELESAI";
    startButton.disabled = true;
  } else {
    startButton.textContent = "MULAI";
    startButton.disabled = false;
  }

  pauseButton.disabled = true;
  cancelTimerButton.disabled = true;
  summaryButton.disabled = true;

  alert("Sesi timer berhasil dibatalkan.");
}
// =====================================
// 9. TIMER SELESAI
// =====================================

function finishTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  const questIndex = timerQuestIndex;

  if (questIndex === null || !quests[questIndex]) {
    console.error("Quest pemilik timer tidak ditemukan.");
    return;
  }

  const quest = quests[questIndex];

  // Jangan menyelesaikan sesi jika Quest sudah selesai sebelumnya
  if (quest.statusPengerjaan === "SELESAI") {
    console.warn("Quest ini sudah diselesaikan.");
    return;
  }

  timerRunning = false;
  timerFinished = true;
  timerPaused = false;

  const plannedSeconds = quest.duration;

  activeElapsedSeconds = Math.min(
    activeElapsedSeconds,
    plannedSeconds
  );

  remainingSeconds = 0;
  timerEndTime = null;

  questTimer.textContent = "00:00:00";

  startButton.textContent = "SELESAI";
  startButton.disabled = true;

  pauseButton.disabled = true;
  cancelTimerButton.disabled = true;
  summaryButton.disabled = false;

  saveTimerState();

  alert("Quest selesai! Silakan isi rangkuman.");
}

function getDurationBonus() {
  const actualMinutes = Math.floor(activeElapsedSeconds / 60);

  if (actualMinutes <= 15) return 0;
  if (actualMinutes <= 30) return 0.10;
  if (actualMinutes <= 60) return 0.20;
  if (actualMinutes <= 90) return 0.30;

  return 0.40;
}
function getBaseReward(difficulty) {
  const rewards = {
    easy: 10,
    normal: 20,
    hard: 35,
    epic: 50
  };

  return rewards[difficulty] || 0;
}
function getBaseExp(difficulty) {
  return getBaseReward(difficulty);
}
function calculateQuestReward(difficulty, evaluation) {
  const baseCoin = getBaseReward(difficulty);
  const baseExp = getBaseExp(difficulty);
  const durationBonus = getDurationBonus();

  const evaluationMultiplier = {
    berhasil: 1,
    sebagian: 0.5,
    gagal: 0
  };

 const multiplier = evaluationMultiplier[
  String(evaluation).toLowerCase()
];

  if (multiplier === undefined) {
    throw new Error("Evaluasi Quest tidak valid.");
  }

  const durationMultiplier = 1 + durationBonus;

  return {
    coin: Math.floor(baseCoin * durationMultiplier * multiplier),
    exp: Math.floor(baseExp * durationMultiplier * multiplier)
  };
}

async function deleteSelectedQuest() {
  if (timerRunning || timerPaused) {
  alert("Selesaikan atau lanjutkan timer sebelum menghapus Quest.");
  return;
}
  const quest = quests[selectedQuest];

  if (!quest || !quest.questId) {
    alert("ID Quest tidak ditemukan.");
    return;
  }

  const konfirmasi = confirm(
    'Apakah kamu yakin ingin menonaktifkan Quest "' +
    quest.name + '"?'
  );

  if (!konfirmasi) return;

  deleteQuestButton.disabled = true;
  deleteQuestButton.textContent = "MENONAKTIFKAN...";

  try {
    const hasil = await nonaktifkanQuestDiSpreadsheet(quest.questId);

    if (!hasil.success) {
      throw new Error(hasil.message || "Quest gagal dinonaktifkan.");
    }

    quests.splice(selectedQuest, 1);
    saveQuestData();

    alert("Quest berhasil dinonaktifkan!");

    currentCategory = "daily";

    categoryButtons.forEach(function(button) {
      button.classList.toggle(
        "active",
        button.dataset.category === currentCategory
      );
    });

    renderQuestList();

    const indexQuest = quests.findIndex(
      quest => quest.category === currentCategory
    );

    if (indexQuest !== -1) {
      showQuest(indexQuest);
    }

  } catch (error) {
    alert("Gagal menonaktifkan Quest: " + error.message);
    console.error(error);

  } finally {
    deleteQuestButton.disabled = false;
    deleteQuestButton.textContent = "HAPUS QUEST";
  }
}
// =====================================
// 10. MENYELESAIKAN QUEST
// =====================================
// =====================================
// SELESAIKAN QUEST
// =====================================

function tambahkanExpQuest(amount) {
  amount = Number(amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const EXP_PER_LEVEL = 500;

  let level = Number(
    localStorage.getItem("pixelQuestLevel") || 1
  );

  let exp = Number(
    localStorage.getItem("pixelQuestEXP") || 0
  );

  exp += Math.floor(amount);

  let levelUp = false;

  while (exp >= EXP_PER_LEVEL) {
    exp -= EXP_PER_LEVEL;
    level++;
    levelUp = true;
  }

  localStorage.setItem("pixelQuestLevel", String(level));
  localStorage.setItem("pixelQuestEXP", String(exp));

// Perbarui tampilan Level dan EXP
updateExpDisplay();


  console.log("[EXP] Reward berhasil ditambahkan:", {
    received: Math.floor(amount),
    level: level,
    exp: exp,
    levelUp: levelUp
  });

  return {
    level: level,
    exp: exp,
    levelUp: levelUp
  };
}


async function completeQuest(evaluation) {
  const questIndex = timerQuestIndex;

  if (questIndex === null || !quests[questIndex]) {
    alert("Quest pemilik timer tidak ditemukan.");
    return false;
  }

  const quest = quests[questIndex];

  // Mencegah penyelesaian ganda.
  if (quest.statusPengerjaan === "SELESAI") {
    alert("Quest ini sudah pernah diselesaikan!");
    return false;
  }

  if (quest._completionInProgress) {
    alert("Penyelesaian Quest sedang diproses. Mohon tunggu.");
    return false;
  }

  const evaluasi = String(evaluation).toUpperCase();

  if (!["BERHASIL", "SEBAGIAN", "GAGAL"].includes(evaluasi)) {
    alert("Evaluasi Quest tidak valid.");
    return false;
  }

  quest._completionInProgress = true;

  try {
    // =====================================
    // 1. KIRIM DATA KE GOOGLE APPS SCRIPT
    // =====================================

    console.log("[QUEST] Mengirim penyelesaian Quest...", {
      quest_id: quest.questId,
      evaluasi: evaluasi
    });

    const hasil = await kirimQuestKeSpreadsheet({
      aksi: "selesaikan-quest",
      quest_id: quest.questId,
      evaluasi: evaluasi
    });

    console.log("[QUEST] Respons Apps Script:", hasil);

    if (!hasil || hasil.success !== true) {
      throw new Error(
        hasil?.message ||
        hasil?.error ||
        "Apps Script tidak memberikan konfirmasi keberhasilan."
      );
    }

    // =====================================
    // 2. PERBARUI STATUS BERDASARKAN RESPONS
    // =====================================

    quest.sesiSelesai = Number(
      hasil.sesi_selesai ?? quest.sesiSelesai ?? 0
    );

    quest.targetSesi = Number(
      hasil.target_sesi ?? quest.targetSesi ?? 1
    );

    quest.sisaSesi = Number(
      hasil.sisa_sesi ??
      Math.max(0, quest.targetSesi - quest.sesiSelesai)
    );

    quest.targetTercapai =
      hasil.target_tercapai === true;

    quest.statusPengerjaan = quest.targetTercapai
      ? "SELESAI"
      : "BELUM_SELESAI";

    quest.evaluation = evaluasi;
    quest.completedAt = hasil.selesai_pada || null;

    quest.bolehDikerjakan =
      hasil.boleh_dikerjakan === true;

    quest.statusTampilan = quest.targetTercapai
      ? "SELESAI"
      : "HARI_INI";

    quest.isHariIni = true;
    quest.sudahKedaluwarsa = false;

    // =====================================
    // 3. HITUNG REWARD
    // =====================================

    const reward = calculateQuestReward(
      quest.difficulty,
      evaluasi
    );

    const rewardResult = CoinSystem.award(
      totalCoins,
      reward.coin,
      "Reward Quest: " + quest.name
    );

totalCoins = rewardResult.balance;
quest.expEarned = reward.exp;

// Tambahkan EXP ke progres pemain
const expResult = tambahkanExpQuest(reward.exp);

updateCoins();

if (rewardResult.transaction) {
  sinkronkanTransaksiKoin(
    rewardResult.transaction,
    quest.questId
  );
}

    // =====================================
    // 4. BERSIHKAN TIMER
    // =====================================

    clearInterval(timerInterval);
    timerInterval = null;

    timerQuestIndex = null;
    timerRunning = false;
    timerPaused = false;
    timerFinished = false;
    timerEndTime = null;

    remainingSeconds = 0;
    activeElapsedSeconds = 0;

    localStorage.removeItem("pixelQuestTimerState");

// 5. SIMPAN DATA LOKAL
saveQuestData();

// 6. SINKRONKAN TRANSAKSI COINS KE SPREADSHEET
if (rewardResult.transaction) {
  sinkronkanTransaksiKoin(
    rewardResult.transaction,
    quest.questId
  );
}

    // =====================================
    // 6. PERBARUI TAMPILAN
    // =====================================

    selectedQuest = questIndex;

    renderQuestList();
    showQuest(selectedQuest);

    // =====================================
    // 7. KONFIRMASI KEBERHASILAN
    // =====================================

    console.log("[QUEST] Penyelesaian berhasil dikonfirmasi.", {
      sesi_selesai: quest.sesiSelesai,
      target_sesi: quest.targetSesi,
      target_tercapai: quest.targetTercapai
    });

    alert(
      "QUEST BERHASIL DIKIRIM!\n\n" +
      "Quest: " + quest.name + "\n" +
      "Evaluasi: " + evaluasi + "\n" +
      "Sesi selesai: " + quest.sesiSelesai +
      " dari " + quest.targetSesi + "\n" +
      "Sisa sesi: " + quest.sisaSesi + "\n" +
      "Status: " +
      (quest.targetTercapai
        ? "QUEST SELESAI"
        : "MASIH BERLANJUT") +
      "\n\nApps Script telah mengonfirmasi penyelesaian Quest."
    );

    return true;

  } catch (error) {
    console.error(
      "[QUEST] GAGAL MENYELESAIKAN QUEST:",
      error
    );

    alert(
      "PENYELESAIAN QUEST GAGAL!\n\n" +
      "Quest: " + quest.name + "\n" +
      "Pesan error: " + error.message +
      "\n\nData belum dikonfirmasi berhasil oleh Apps Script."
    );

    return false;

  } finally {
    quest._completionInProgress = false;
  }
}

// =====================================
// 10. EVALUASI QUEST
// =====================================


async function openSummary() {
  console.log("Tombol rangkuman diklik");
  console.log("timerFinished:", timerFinished);

  alert("Tombol rangkuman berhasil diklik!");

  if (!timerFinished) return;
  const questIndex = timerQuestIndex;
  const quest = quests[questIndex];

  if (!quest) {
    alert("Quest tidak ditemukan.");
    return;
  }

  // Lanjutkan kode lama di bawahnya


  const evaluasi = prompt(
    "Pilih evaluasi Quest:\n\n" +
    "Ketik salah satu:\n" +
    "BERHASIL\n" +
    "SEBAGIAN\n" +
    "GAGAL"
  );

  if (evaluasi === null) return;

  const nilaiEvaluasi = evaluasi.trim().toUpperCase();

  if (!["BERHASIL", "SEBAGIAN", "GAGAL"].includes(nilaiEvaluasi)) {
    alert("Evaluasi tidak valid.");
    return;
  }

  summaryButton.disabled = true;

  const berhasil = await completeQuest(nilaiEvaluasi);

  if (!berhasil) {
    summaryButton.disabled = false;
    return;
  }

  const rangkuman = prompt(
    "Quest berhasil diselesaikan!\n\n" +
    "Tuliskan rangkuman perjalanan Quest-mu:\n\n" +
    "Apa yang kamu pelajari atau capai?"
  );

  if (rangkuman !== null && rangkuman.trim() !== "") {
    try {
      simpanCatatanLokal(quest, {
        jenisCatatan: "REFLEKSI_SELESAI",
        evaluasi: nilaiEvaluasi,
        learned: rangkuman.trim(),
        challenge: "",
        improve: "",
        notes: ""
      });

      questBookHistoryPage = 1;
      renderQuestBookHistory();

      alert("Rangkuman berhasil disimpan di Buku Catatan!");
    } catch (error) {
      console.error("Gagal menyimpan rangkuman:", error);
      alert("Rangkuman gagal disimpan: " + error.message);
    }
  }
}



// =====================================
// 11. EVENT TOMBOL
// =====================================

startButton.addEventListener("click", startTimer);
deleteQuestButton.addEventListener("click", deleteSelectedQuest);
pauseButton.addEventListener("click", pauseTimer);
cancelTimerButton.addEventListener("click", cancelTimer);
summaryButton.addEventListener("click", openSummary);
openQuestBookButton.addEventListener("click", openQuestBook);
backToQuestButton.addEventListener("click", closeQuestBook);
saveReflectionButton.addEventListener("click", saveQuestReflection);

// =====================================
// 12. TOMBOL TUTUP
// =====================================

closeButton.addEventListener("click", function() {
  window.location.href = "index.html";
});


// =====================================
// 13. TAMPILKAN QUEST PERTAMA
// =====================================
// 2. NAVIGASI KATEGORI QUEST
// 2. NAVIGASI KATEGORI QUEST
const categoryButtons = document.querySelectorAll(".category-button");
const questHeading = document.querySelector(".quest-list-page h1");
if (!questHeading) {
  console.error("Elemen judul Quest tidak ditemukan!");
}


// =====================================
// NAVIGASI QUEST
// =====================================

// Atur tombol aktif saat halaman dibuka
categoryButtons.forEach(function(button) {
  button.classList.toggle(
    "active",
    button.dataset.category === currentCategory
  );
});

categoryButtons.forEach(function(button) {
  button.addEventListener("click", function() {

    if (timerRunning || timerPaused) {
      alert("Selesaikan timer terlebih dahulu!");
      return;
    }

    const category = button.dataset.category;

    // Atur tombol aktif
    categoryButtons.forEach(function(item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    // =================================
    // FORM QUEST BARU
    // =================================

    if (category === "new") {
      questHeading.textContent = "BUAT QUEST BARU";

      questList.hidden = true;
      questForm.hidden = false;
      deleteQuestButton.hidden = true;

      detailTitle.hidden = true;
      detailDescription.hidden = true;
      questStreak.hidden = true;
      questTimer.hidden = true;
      questReward.hidden = true;

      const questActions = document.querySelector(".quest-actions");

      if (questActions) {
        questActions.hidden = true;
      }

      detailTitle.textContent = "BUAT QUEST BARU";
      detailDescription.textContent =
        "Isi formulir untuk membuat Quest milikmu.";

      resetTimer();
      return;
    }

    // =================================
    // FILTER QUEST
    // =================================

    currentCategory = category;
    questListPage = 1;

    questForm.hidden = true;
    questList.hidden = false;
    deleteQuestButton.hidden = false;

    detailTitle.hidden = false;
    detailDescription.hidden = false;
    questStreak.hidden = false;
    questTimer.hidden = false;
    questReward.hidden = false;

    const questActions = document.querySelector(".quest-actions");

    if (questActions) {
      questActions.hidden = false;
    }

    // Judul halaman
    if (category === "all") {
      questHeading.textContent = "SEMUA QUEST";

    } else if (category === "today") {
      questHeading.textContent = "QUEST HARI INI";
    }

    // Cari Quest pertama yang sesuai filter
    const firstQuest = quests.findIndex(function(quest) {

      if (category === "today") {
        return quest.isHariIni === true;
      }

      return true;
    });

    if (firstQuest !== -1) {
      showQuest(firstQuest);

    } else {
      selectedQuest = null;

      renderQuestList();

      detailTitle.textContent = "BELUM ADA QUEST";

      detailDescription.textContent =
        category === "today"
          ? "Belum ada Quest yang dijadwalkan hari ini."
          : "Belum ada Quest aktif.";

      questReward.textContent = "🪙 +0 COINS";
      questStreak.textContent = "🔥 0 HARI";

      resetTimer();
    }

  });
});

updateCoins();

// =====================================
// PENYIMPANAN DATA QUEST
// =====================================
function saveQuestData() {

  const data = {
    totalCoins: totalCoins
  };

  localStorage.setItem(
    "pixelQuestPreviewData",
    JSON.stringify(data)
  );
}

function mapQuestDariSpreadsheet(data) {
  return {
    questId: data.quest_id,
    name: data.nama_quest,
    description: data.deskripsi,

    // Kategori asli Quest, bukan status penyelesaian.
    category: data.kategori,

    duration: (Number(data.durasi_menit) || 0) * 60,
    difficulty: data.tingkat_kesulitan,

    tanggalMulai: data.tanggal_mulai,
    tanggalBerakhir: data.tanggal_berakhir,
    hariBerulang: data.hari_berulang,
    waktuMulai: data.waktu_mulai,

    periode: data.periode,
    targetSesi: data.target_sesi,
    sesiSelesai: Number(data.sesi_selesai) || 0,
sisaSesi: Math.max(
  0,
  Number(data.target_sesi || 0) -
  Number(data.sesi_selesai || 0)
),

   statusPengerjaan: String(
  data.status_pengerjaan || "BELUM_SELESAI"
).trim().toUpperCase(),
    completedAt: data.selesai_pada,
    evaluation: data.evaluasi,

    statusTampilan: data.status_tampilan,
    isHariIni: data.is_hari_ini,
    sudahKedaluwarsa: data.sudah_kedaluwarsa,

    telegramAktif: data.telegram_aktif,
    reward: getBaseReward(data.tingkat_kesulitan),
    streak: 0
  };
}

function questSudahSelesai(quest) {
  return String(quest?.statusPengerjaan || "")
    .trim()
    .toUpperCase() === "SELESAI";
}
// =====================================
// MEMUAT DATA QUEST
// =====================================
async function loadQuestData() {
  // Muat saldo lokal
  const savedData = localStorage.getItem("pixelQuestPreviewData");

  if (savedData) {
    try {
      const data = JSON.parse(savedData);

      if (Number.isFinite(data.totalCoins)) {
        totalCoins = data.totalCoins;
      }
    } catch (error) {
      console.error("Gagal memuat saldo:", error);
    }
  }

  // Sinkronkan saldo yang sudah dipulihkan ke penyimpanan Lobby
  updateCoins();

  try {
    console.log("Mengambil data Quest dari Spreadsheet...");

    const hasil = await kirimQuestKeSpreadsheet({
      aksi: "ambil-quest"
    });

    console.log("Respons ambil Quest:", hasil);

    if (!hasil || hasil.success !== true) {
      throw new Error(
        hasil?.message || "Google Apps Script mengembalikan kegagalan."
      );
    }

    if (!Array.isArray(hasil.quest)) {
      throw new Error(
        "Data Quest bukan array. Periksa respons ambilQuest() di Apps Script."
      );
    }

    const daftarQuest = hasil.quest.map(
      mapQuestDariSpreadsheet
    );

    // Ganti data hanya setelah pengambilan berhasil
quests.splice(0, quests.length, ...daftarQuest);

// Simpan ringkasan Quest hari ini untuk dibaca Lobby.
const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0")
].join("-");

const todayQuests = quests.filter(quest =>
  quest.isHariIni === true &&
  !questSudahSelesai(quest)
);

localStorage.setItem(
  "pixelQuestTodaySummary",
  JSON.stringify({
    date: today,
    hasQuest: todayQuests.length > 0,
    questName: todayQuests[0]?.name || ""
  })
);


console.log("Quest berhasil dimuat:", quests);
console.log("Jumlah Quest:", quests.length);

// Jika Buku Petualangan sedang terbuka,
// perbarui daftar Quest setelah data selesai dimuat.
if (
  questBookPage &&
  !questBookPage.hidden
) {
  questBookHistoryPage = 1;
  renderQuestBookHistory();
}

return true;

  } catch (error) {
    console.error("GAGAL MEMUAT QUEST DARI SPREADSHEET:", error);
    console.error("Detail error:", error.message);

    return false;
  }
}
// =====================================
// 14. INISIALISASI APLIKASI
// =====================================

async function inisialisasiAplikasi() {

  // 1. Ambil Quest dari Google Sheets
  const questBerhasilDimuat = await loadQuestData();

  if (!questBerhasilDimuat) {
    console.warn("Data Quest belum berhasil dimuat.");
  }

  // 2. Pulihkan timer
  const timerBerhasilDipulihkan = loadTimerState();

  // 3. Tentukan Quest awal
  if (!timerBerhasilDipulihkan) {

    const initialQuest = quests.findIndex(function(quest) {
      return quest.isHariIni === true;
    });

    selectedQuest = initialQuest !== -1
      ? initialQuest
      : 0;
  }

  // 4. Perbarui koin
  updateCoins();

  // 5. Tampilkan Quest
  showQuest(selectedQuest, timerBerhasilDipulihkan);

// 6. Lanjutkan timer tanpa mengubah waktu akhir aslinya
if (timerBerhasilDipulihkan && timerRunning) {
  jalankanIntervalTimer();
}
}

// =====================================
// TAMPILAN LEVEL DAN EXP
// =====================================

function updateExpDisplay() {
  const levelDisplay = document.getElementById("level-display");
  const expDisplay = document.getElementById("exp-display");
  const expProgressFill = document.getElementById("exp-progress-fill");

  const level = Number(localStorage.getItem("pixelQuestLevel") || 1);
  const exp = Number(localStorage.getItem("pixelQuestEXP") || 0);

  const expPerLevel = 500;
  const percentage = Math.min(
    (exp / expPerLevel) * 100,
    100
  );

  if (levelDisplay) {
    levelDisplay.textContent = level;
  }

  if (expDisplay) {
    expDisplay.textContent = `${exp} / ${expPerLevel} EXP`;
  }

  if (expProgressFill) {
    expProgressFill.style.width = `${percentage}%`;
  }
}

// Jalankan inisialisasi
inisialisasiAplikasi();
updateExpDisplay();
// =====================================
// KONEKSI GOOGLE APPS SCRIPT
// =====================================



// =====================================
// KIRIM DATA KE GOOGLE SHEETS
// =====================================
async function kirimQuestKeSpreadsheet(dataQuest) {

  const isReadRequest = dataQuest.aksi === "ambil-quest";
  const maxPercobaan = isReadRequest ? 3 : 1;

  let errorTerakhir;

  for (let percobaan = 1; percobaan <= maxPercobaan; percobaan++) {

    try {
      console.log(
        `Menghubungi Spreadsheet: percobaan ${percobaan}/${maxPercobaan}`
      );

      // Kirim request ke Google Apps Script
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(dataQuest)
      });

      // Periksa respons HTTP
      if (!response.ok) {
        throw new Error("HTTP Error: " + response.status);
      }

      // Baca respons dari Spreadsheet
      const hasil = await response.json();

      if (!hasil) {
        throw new Error("Respons Spreadsheet kosong.");
      }

      console.log("Respons Spreadsheet:", hasil);

      return hasil;

    } catch (error) {

      errorTerakhir = error;

      console.error(
        `Gagal pada percobaan ${percobaan}:`,
        error
      );

      if (percobaan < maxPercobaan) {
        await new Promise(resolve =>
          setTimeout(resolve, 1500 * percobaan)
        );
      }
    }
  }

  console.error("Koneksi Spreadsheet gagal:", errorTerakhir);

  throw errorTerakhir;
}


async function sinkronkanTransaksiKoin(transaksi, questId) {
  if (!transaksi) return;

  try {
    const hasil = await kirimQuestKeSpreadsheet({
      aksi: "catat-koin",
      ledger_id: transaksi.id,
      session_id: "QUEST:" + questId + ":" + transaksi.id,
      jenis_transaksi: "MASUK",
      jumlah_koin: transaksi.amount,
      alasan: transaksi.description
    });

    if (!hasil || hasil.success !== true) {
      throw new Error(
        hasil?.message || "Sinkronisasi Coins gagal."
      );
    }

    console.log("[COINS] Berhasil disinkronkan:", hasil);

  } catch (error) {
    console.error(
      "[COINS] Sinkronisasi gagal. Transaksi masih tersimpan lokal:",
      error
    );
  }
}

async function sinkronkanTransaksiKoin(transaksi, questId) {
  if (!transaksi) return;

  try {
    const hasil = await kirimQuestKeSpreadsheet({
      aksi: "catat-koin",
      ledger_id: transaksi.id,
      session_id: "QUEST:" + questId + ":" + transaksi.id,
      jenis_transaksi: "MASUK",
      jumlah_koin: transaksi.amount,
      alasan: transaksi.description
    });

    if (!hasil || hasil.success !== true) {
      throw new Error(
        hasil?.message || "Sinkronisasi Coins gagal."
      );
    }

    console.log("[COINS] Berhasil disinkronkan:", hasil);

  } catch (error) {
    console.error(
      "[COINS] Sinkronisasi gagal. Transaksi masih tersimpan lokal:",
      error
    );
  }
}

async function nonaktifkanQuestDiSpreadsheet(questId) {
  const data = {
    aksi: "nonaktifkan-quest",
    quest_id: questId
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(data)
  });

  return await response.json();
}
// Tombol kembali dari formulir Tambah Quest
if (backToQuestFormButton) {
  backToQuestFormButton.addEventListener("click", function() {
    questForm.hidden = true;

    // Kembalikan tampilan buku Quest
    questList.hidden = false;
    deleteQuestButton.hidden = false;

    detailTitle.hidden = false;
    detailDescription.hidden = false;
    questStreak.hidden = false;
    questTimer.hidden = false;
    questReward.hidden = false;

    const questActions = document.querySelector(".quest-actions");
    if (questActions) questActions.hidden = false;

    // Kembalikan kategori ke Quest Harian
    currentCategory = "daily";


    const firstQuest = quests.findIndex(function(quest) {
      return quest.category === "daily";
    });

    if (firstQuest !== -1) {
      showQuest(firstQuest);
    } else {
      renderQuestList();
      detailTitle.textContent = "BELUM ADA QUEST";
      detailDescription.textContent = "Belum ada Quest harian.";
      questReward.textContent = "🪙 +0 COINS";
      questStreak.textContent = "🔥 0 HARI";
      resetTimer();
    }
  });
}
// Halaman Quest sebelumnya
questPrevPage.addEventListener("click", function() {
  if (questListPage > 1) {
    questListPage--;
    renderQuestList();
  }
});

// Halaman Quest berikutnya
questNextPage.addEventListener("click", function() {
  const totalQuests = quests.filter(
    quest => quest.category === currentCategory
  ).length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalQuests / questsPerPage)
  );

  if (questListPage < totalPages) {
    questListPage++;
    renderQuestList();
  }
});