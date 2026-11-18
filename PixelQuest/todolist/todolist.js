
// ==========================================
// PIXEL QUEST — TO-DO LIST
// Tahap 1: Tambah tugas dan penyimpanan lokal
// ==========================================

const STORAGE_KEY = "pixelQuestTodoTasks";

// Elemen halaman
const addButton = document.querySelector(".add-button");
const todayTasks = document.getElementById("todayTasks");
const tomorrowTasks = document.getElementById("tomorrowTasks");
const upcomingTasks = document.getElementById("upcomingTasks");
const overdueTasks = document.getElementById("overdueTasks");


// Ambil data dari localStorage
let tasks = loadTasks();
let currentFilter = "all";

// ==========================================
// TANGGAL LOKAL
// ==========================================

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateOffset(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);

  return getLocalDateString(date);
}

function addDaysToDateString(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  date.setDate(date.getDate() + days);

  return getLocalDateString(date);
}


// Membuat jadwal berikutnya untuk tugas berulang
function processRecurringTasks() {
  const originalTasks = tasks.map(task => ({ ...task }));
  const today = getLocalDateString();
  let changed = false;

  // Memberi identitas rangkaian pada tugas lama
  tasks.forEach(task => {
    if (!task.seriesId) {
      task.seriesId = task.id;
      changed = true;
    }
  });

  // Cari tugas paling baru dari setiap rangkaian
  const latestBySeries = new Map();

  tasks.forEach(task => {
    const seriesId = task.seriesId;
    const latest = latestBySeries.get(seriesId);

    if (!latest || task.date > latest.date) {
      latestBySeries.set(seriesId, task);
    }
  });

  const newTasks = [];

  latestBySeries.forEach((latestTask, seriesId) => {
    if (
      latestTask.repeat !== "daily" &&
      latestTask.repeat !== "weekly"
    ) {
      return;
    }

    const interval = latestTask.repeat === "daily" ? 1 : 7;
    let previousTask = latestTask;

    // Buat jadwal yang terlewat sampai mencapai hari ini
    while (
      previousTask.date < today &&
      !previousTask.nextOccurrenceCreated
    ) {
      previousTask.nextOccurrenceCreated = true;

      const nextTask = {
        ...previousTask,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        seriesId,
        date: addDaysToDateString(previousTask.date, interval),
        completed: false,
        createdAt: new Date().toISOString(),
        generatedFrom: previousTask.id,
        nextOccurrenceCreated: false
      };

      newTasks.push(nextTask);
      previousTask = nextTask;
    }
  });

  if (newTasks.length > 0) {
    tasks.push(...newTasks);
    changed = true;
  }

  // Simpan perubahan satu kali saja
  if (changed && !saveTasks()) {
    tasks = originalTasks;
  }
}


// ==========================================
// PENYIMPANAN DATA
// ==========================================

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error("Gagal membaca data tugas:", error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Gagal menyimpan data tugas:", error);
    alert("Tugas gagal disimpan di browser.");
    return false;
  }
}

// ==========================================
// FORM TAMBAH TUGAS
// ==========================================


function openAddTaskForm(taskId = null) {
  if (document.getElementById("todoDialog")) return;

  const editingTask = taskId
    ? tasks.find(task => task.id === taskId)
    : null;

  if (taskId && !editingTask) return;

  const dialog = document.createElement("dialog");
  dialog.id = "todoDialog";

  dialog.innerHTML = `
    <form id="todoForm">
      <h2>${editingTask ? "Edit Tugas" : "Tambah Tugas Baru"}</h2>

      <label for="taskName">Nama tugas</label>
      <input
        type="text"
        id="taskName"
        maxlength="100"
        placeholder="Contoh: Mengerjakan tugas"
        required
      >
      <label for="taskDescription">Deskripsi (opsional)</label>
    <textarea
      id="taskDescription"
      maxlength="500"
      rows="3"
      placeholder="Tambahkan catatan tugas..."
    ></textarea>

      <label for="taskDate">Tanggal</label>
      <input type="date" id="taskDate" required>

      <label for="taskTime">Waktu</label>
      <input type="time" id="taskTime" required>

      <label for="taskRepeat">Pengulangan</label>
      <select id="taskRepeat">
        <option value="once">Sekali</option>
        <option value="daily">Harian</option>
        <option value="weekly">Mingguan</option>
      </select>

      <label for="taskPriority">Prioritas Tugas</label>
      <select id="taskPriority">
        <option value="important">Penting</option>
        <option value="normal">Tidak Penting</option>
      </select>

      <div class="todo-form-actions">
        <button type="button" id="cancelTask">Batal</button>
        <button type="submit">
          ${editingTask ? "Simpan Perubahan" : "Simpan Tugas"}
        </button>
      </div>
    </form>
  `;

  document.body.appendChild(dialog);

  const form = document.getElementById("todoForm");

  if (editingTask) {
    document.getElementById("taskName").value = editingTask.name;
    document.getElementById("taskDate").value = editingTask.date;
    document.getElementById("taskTime").value = editingTask.time;
    document.getElementById("taskRepeat").value = editingTask.repeat || "once";
    document.getElementById("taskPriority").value = editingTask.priority || "normal";
    document.getElementById("taskDescription").value =editingTask.description || "";
  } else {
    document.getElementById("taskDate").value =
      getLocalDateString();
  }

  document.getElementById("cancelTask").addEventListener("click", () => {
    dialog.close();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (editingTask) {
      editTask(taskId);
    } else {
      addTask();
    }
  });

  dialog.addEventListener("close", () => {
    dialog.remove();
  });

  dialog.showModal();
}


// ==========================================
// TAMBAH TUGAS
// ==========================================

function addTask() {
  const name = document.getElementById("taskName").value.trim();
  const date = document.getElementById("taskDate").value;
  const time = document.getElementById("taskTime").value;
  const repeat = document.getElementById("taskRepeat").value;
  const priority = document.getElementById("taskPriority").value;
  const description = document.getElementById("taskDescription").value.trim();

  if (!name || !date || !time) {
    alert("Mohon lengkapi semua informasi tugas.");
    return;
  }

const newTaskId =
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const newTask = {
  id: newTaskId,
  seriesId: newTaskId,
    name,
    date,
    time,
    repeat,
    priority,
    completed: false,
    description,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);

  if (!saveTasks()) {
    tasks.pop();
    return;
  }

  renderTasks();

  const dialog = document.getElementById("todoDialog");
  if (dialog) {
    dialog.close();
  }
}

function editTask(taskId) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) return;

  const previousTask = { ...tasks[taskIndex] };

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    name: document.getElementById("taskName").value.trim(),
    date: document.getElementById("taskDate").value,
    time: document.getElementById("taskTime").value,
    repeat: document.getElementById("taskRepeat").value,
    priority: document.getElementById("taskPriority").value
  };

  if (!tasks[taskIndex].name ||
      !tasks[taskIndex].date ||
      !tasks[taskIndex].time) {
    alert("Mohon lengkapi semua informasi tugas.");
    tasks[taskIndex] = previousTask;
    return;
  }

  if (!saveTasks()) {
    tasks[taskIndex] = previousTask;
    return;
  }

  renderTasks();

  document.getElementById("todoDialog")?.close();
}


function deleteTask(taskId) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) return;

  const confirmed = confirm("Apakah kamu yakin ingin menghapus tugas ini?");

  if (!confirmed) return;

  const deletedTask = tasks.splice(taskIndex, 1)[0];

  if (!saveTasks()) {
    tasks.splice(taskIndex, 0, deletedTask);
    renderTasks();
    return;
  }

  renderTasks();
}


// ==========================================
// TAMPILKAN TUGAS
// ==========================================

function renderTasks() {
  overdueTasks.innerHTML = "";
  todayTasks.innerHTML = "";
  tomorrowTasks.innerHTML = "";
  upcomingTasks.innerHTML = "";

  const today = getLocalDateString();
  const tomorrow = getDateOffset(1);

  const sortedTasks = [...tasks].sort((a, b) => {
    // Urutkan berdasarkan tanggal
    const dateCompare = a.date.localeCompare(b.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    // Prioritas penting berada di atas
    const priorityA = a.priority === "important" ? 0 : 1;
    const priorityB = b.priority === "important" ? 0 : 1;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Jika prioritas sama, urutkan berdasarkan waktu
    return a.time.localeCompare(b.time);
  });

  sortedTasks.forEach((task) => {
    // Terapkan filter
    if (currentFilter === "pending" && task.completed) return;
    if (currentFilter === "completed" && !task.completed) return;

    const taskElement = createTaskElement(task);

    if (task.date < today) {
      overdueTasks.appendChild(taskElement);
    } else if (task.date === today) {
      todayTasks.appendChild(taskElement);
    } else if (task.date === tomorrow) {
      tomorrowTasks.appendChild(taskElement);
    } else {
      upcomingTasks.appendChild(taskElement);
    }
  });

  showEmptyMessage(overdueTasks, "Tidak ada tugas yang terlambat.");
  showEmptyMessage(todayTasks, "Belum ada tugas untuk hari ini.");
  showEmptyMessage(tomorrowTasks, "Belum ada tugas untuk besok.");
  showEmptyMessage(upcomingTasks, "Belum ada tugas mendatang.");

  updateProgress();
}


function setTaskFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll(".filter-button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filter === filter
    );
  });

  renderTasks();
}


// ==========================================
// BENTUK ITEM TUGAS
// ==========================================



function createTaskElement(task) {
  const item = document.createElement("div");
  item.className = `task-item ${task.completed ? "completed" : ""}`;

  // Checkbox status tugas
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = Boolean(task.completed);
  checkbox.setAttribute("aria-label", `Selesaikan ${task.name}`);

  checkbox.addEventListener("change", () => {
    toggleTask(task.id, checkbox.checked);
  });

  // Nama tugas
  const name = document.createElement("span");
  name.className = "task-name";
  name.textContent = task.name;

  // Jam tugas
  const time = document.createElement("span");
  time.className = "task-time";
  time.textContent = task.time;

  // Pengulangan
  const repeat = document.createElement("span");
  repeat.className = "task-repeat";

  const repeatLabels = {
    once: "Sekali",
    daily: "Harian",
    weekly: "Mingguan"
  };
  const description = document.createElement("p");
  description.className = "task-description";
  description.textContent = task.description || "";

  repeat.textContent = repeatLabels[task.repeat] || "Sekali";
  const priority = document.createElement("span");
  priority.className = `task-priority ${task.priority || "normal"}`;
  priority.textContent =
  task.priority === "important" ? "Penting" : "Tidak Penting";

  // Tombol edit
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "edit-task-button";
  editButton.textContent = "Edit";

  editButton.addEventListener("click", () => {
    openAddTaskForm(task.id);
  });

  // Tombol hapus
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-task-button";
  deleteButton.textContent = "Hapus";

  deleteButton.addEventListener("click", () => {
    deleteTask(task.id);
  });

item.append(
  checkbox,
  name,
  time,
  priority,
  repeat,
  editButton,
  deleteButton
);

  return item;
}




function toggleTask(taskId, isCompleted) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) return;

  const previousStatus = tasks[taskIndex].completed;

  tasks[taskIndex].completed = isCompleted;

  if (!saveTasks()) {
    tasks[taskIndex].completed = previousStatus;
    renderTasks();
    return;
  }

  renderTasks();
}


function updateProgress() {
  const today = getLocalDateString();

  const todayTaskList = tasks.filter(task => task.date === today);

  const total = todayTaskList.length;
  const completed = todayTaskList.filter(
    task => task.completed
  ).length;

  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  const progressText = document.getElementById("progressText");
  const progressPercent = document.getElementById("progressPercent");

  if (progressText) {
    progressText.textContent =
      `${completed} dari ${total} tugas selesai`;
  }

  if (progressPercent) {
    progressPercent.textContent = `${percentage}%`;
  }
}

// ==========================================
// PESAN JIKA BELUM ADA TUGAS
// ==========================================

function showEmptyMessage(container, message) {
  if (container.children.length > 0) return;

  const empty = document.createElement("p");
  empty.className = "empty-message";
  empty.textContent = message;

  container.appendChild(empty);
}

// ==========================================
// EVENT DAN INISIALISASI
// ==========================================

addButton.addEventListener("click", () => {
  openAddTaskForm();
});

// Event tombol filter
document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    setTaskFilter(button.dataset.filter);
  });
});

// Proses jadwal berulang ketika halaman dibuka
processRecurringTasks();

// Tampilkan data
renderTasks();
