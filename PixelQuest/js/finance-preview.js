const FINANCE_API_URL =
  "https://script.google.com/macros/s/AKfycbyvCRo7dp8VMtVXegBwzvqHX6CE4XZhCvdcQeLj6mUtxBJ-oMZnfQGeHFCAs05fFNekog/exec";
    // Kembali ke Lobby
  document
    .getElementById("close-finance-button")
    ?.addEventListener("click", () => {
      window.location.href = "index.html";
    });
document.addEventListener("DOMContentLoaded", () => {
  // Elemen utama
  const transactionModal = document.getElementById("finance-transaction-modal");
  const transactionForm = document.getElementById("finance-transaction-form");

  const addTransactionButton = document.getElementById("add-transaction-button");
  const closeTransactionButton = document.getElementById("close-transaction-modal");
  const cancelTransactionButton = document.getElementById("cancel-transaction-button");

  const transactionList = document.getElementById("finance-transaction-list");

  const balanceElement = document.getElementById("finance-balance");
  const incomeElement = document.getElementById("finance-income");
  const expenseElement = document.getElementById("finance-expense");

  const monthTitle = document.getElementById("finance-month-title");

  // Data transaksi sementara disimpan di browser
  let transactions = JSON.parse(
    localStorage.getItem("pixelQuestFinanceTransactions") || "[]"
  );

  let currentMonth = new Date();
  let currentTransactionPage = 1;
    const transactionsPerPage = 5;
    let financeChart = null;
    let currentChartPeriod = "week";
    let savingTarget = JSON.parse(
  localStorage.getItem("pixelQuestSavingTarget") || "null"
  );

  // Format Rupiah
  function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Simpan transaksi
  function saveTransactions() {
    localStorage.setItem(
      "pixelQuestFinanceTransactions",
      JSON.stringify(transactions)
    );
  }

async function loadTransactions() {
  try {
    const response = await fetch(FINANCE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        aksi: "ambil-transaksi"
      })
    });

    const hasil = await response.json();

    if (!response.ok || !hasil.success) {
      throw new Error(
        hasil.message || "Gagal mengambil transaksi."
      );
    }

    transactions = hasil.data.map(item => ({
      id: item.transaction_id,
      transaction_id: item.transaction_id,
      type: item.jenis === "pemasukan" ? "income" : "expense",
      name: item.deskripsi,
      category: item.kategori,
      amount: item.jumlah_rupiah,
      date: item.tanggal_lokal
    }));

    saveTransactions();
    currentTransactionPage = 1;
    loadTransactions();
    loadSavingTarget();

  } catch (error) {
    console.error("Gagal memuat transaksi:", error);
    alert("Data transaksi dari Google Sheets gagal dimuat.");
  }
}

  // Tampilkan bulan
  function updateMonthTitle() {
    monthTitle.textContent = currentMonth
      .toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric"
      })
      .toUpperCase();
  }

  // Ambil transaksi pada bulan yang sedang dibuka
  function getMonthlyTransactions() {
    return transactions.filter(transaction => {
      const date = new Date(transaction.date + "T00:00:00");

      return (
        date.getMonth() === currentMonth.getMonth() &&
        date.getFullYear() === currentMonth.getFullYear()
      );
    });
  }

  
function renderFinanceChart() {
  const canvas = document.getElementById("finance-expense-chart");

  if (!canvas || typeof Chart === "undefined") return;

  const now = new Date();
  let filteredTransactions = [];

  if (currentChartPeriod === "week") {
    const startOfWeek = new Date(now);
    const day = (now.getDay() + 6) % 7;
    startOfWeek.setDate(now.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    filteredTransactions = transactions.filter(item => {
      const date = new Date(item.date + "T00:00:00");
      return date >= startOfWeek && date <= now &&
        item.type === "expense";
    });
  } else {
    filteredTransactions = getMonthlyTransactions().filter(
      item => item.type === "expense"
    );
  }

  const categoryNames = {
    food: "Makanan",
    transport: "Transportasi",
    education: "Pendidikan",
    shopping: "Belanja",
    salary: "Gaji",
    allowance: "Uang saku",
    other: "Lainnya"
  };

  const categoryTotals = {};

  filteredTransactions.forEach(item => {
    categoryTotals[item.category] =
      (categoryTotals[item.category] || 0) + item.amount;
  });

  const labels = Object.keys(categoryTotals).map(
    key => categoryNames[key] || key
  );

  const values = Object.values(categoryTotals);

  if (financeChart) {
    financeChart.destroy();
  }

  financeChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: labels.length ? labels : ["Belum ada pengeluaran"],
      datasets: [{
        data: values.length ? values : [1],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: context => {
              if (!values.length) return "Belum ada data";
              return `${context.label}: ${formatRupiah(context.raw)}`;
            }
          }
        }
      }
    }
  });

  const legend = document.getElementById("finance-chart-legend");
  legend.innerHTML = "";

  if (!labels.length) {
    legend.textContent = "Belum ada pengeluaran.";
    return;
  }

  labels.forEach((label, index) => {
    const item = document.createElement("div");
    item.textContent = `${label}: ${formatRupiah(values[index])}`;
    legend.appendChild(item);
  });
}


function renderSavingTarget() {
  const nameElement = document.getElementById("finance-target-name");
  const percentageElement = document.getElementById("finance-target-percentage");
  const progressBar = document.getElementById("finance-target-progress-bar");
  const collectedElement = document.getElementById("finance-target-collected");
  const deadlineElement = document.getElementById("finance-target-deadline");

  if (!savingTarget) {
    nameElement.textContent = "BELUM ADA TARGET";
    percentageElement.textContent = "0%";
    progressBar.style.width = "0%";
    collectedElement.textContent = "Rp 0";
    deadlineElement.textContent = "BELUM ADA TARGET";
    return;
  }

  const percentage = Math.min(
    100,
    Math.floor(
      (savingTarget.collected / savingTarget.amount) * 100
    )
  );

  nameElement.textContent = savingTarget.name.toUpperCase();
  percentageElement.textContent = `${percentage}%`;
  progressBar.style.width = `${percentage}%`;
  collectedElement.textContent =
    `${formatRupiah(savingTarget.collected)} / ${formatRupiah(savingTarget.amount)}`;

  deadlineElement.textContent = savingTarget.deadline
    ? `DEADLINE: ${savingTarget.deadline}`
    : "TANPA DEADLINE";
}

// Memuat target tabungan dari Google Sheets
async function loadSavingTarget() {
  try {
    const response = await fetch(FINANCE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        aksi: "ambil-target-tabungan"
      })
    });

    const teksRespons = await response.text();
    console.log("Respons ambil target:", teksRespons);

    const hasil = JSON.parse(teksRespons);

    if (!response.ok || !hasil.success) {
      throw new Error(
        hasil.message || "Gagal mengambil target tabungan."
      );
    }

    if (hasil.data) {
      savingTarget = {
        name: hasil.data.nama_target,
        amount: hasil.data.jumlah_target,
        collected: hasil.data.jumlah_terkumpul,
        deadline: hasil.data.tanggal_deadline,
        goal_id: hasil.data.goal_id
      };
    } else {
      savingTarget = null;
    }

    localStorage.setItem(
      "pixelQuestSavingTarget",
      JSON.stringify(savingTarget)
    );

    renderSavingTarget();

  } catch (error) {
    console.error("Gagal memuat target tabungan:", error);
    alert("Target tabungan dari Google Sheets gagal dimuat.");
  }
}


  // Perbarui tampilan
function renderFinance() {
  const monthlyTransactions = getMonthlyTransactions();

  // Urutkan transaksi dari tanggal terbaru
  monthlyTransactions.sort((a, b) => b.date.localeCompare(a.date));

  // Hitung jumlah halaman
  const totalPages = Math.max(
    1,
    Math.ceil(monthlyTransactions.length / transactionsPerPage)
  );

  // Pastikan halaman tetap valid
  currentTransactionPage = Math.min(currentTransactionPage, totalPages);

  // Ambil transaksi sesuai halaman
  const startIndex = (currentTransactionPage - 1) * transactionsPerPage;
  const displayedTransactions = monthlyTransactions.slice(
    startIndex,
    startIndex + transactionsPerPage
  );

  transactionList.innerHTML = "";

  if (monthlyTransactions.length === 0) {
    transactionList.innerHTML = `
      <tr class="empty-transaction">
        <td colspan="4">Belum ada transaksi.</td>
      </tr>
    `;
  } else {
    displayedTransactions.forEach(transaction => {
      const row = document.createElement("tr");

      const icon = transaction.type === "income" ? "🟢" : "🔴";
      const amount = transaction.type === "income"
        ? `+ ${formatRupiah(transaction.amount)}`
        : `- ${formatRupiah(transaction.amount)}`;

      
row.innerHTML = `
  <td>${transaction.date}</td>
  <td>${icon}</td>
  <td>${transaction.name}</td>
  <td>${amount}</td>
  <td>
    <button type="button" class="edit-transaction-button"
      data-id="${transaction.id}">EDIT</button>
    <button type="button" class="delete-transaction-button"
      data-id="${transaction.id}">HAPUS</button>
  </td>
`;


      transactionList.appendChild(row);
    });
  }

  // Perbarui indikator halaman
  document.getElementById("transaction-page-indicator").textContent =
    `${currentTransactionPage}/${totalPages}`;

  // Perhitungan ringkasan tetap menggunakan semua transaksi bulan ini
  const income = monthlyTransactions
    .filter(item => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const expense = monthlyTransactions
    .filter(item => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  balanceElement.textContent = formatRupiah(income - expense);
  incomeElement.textContent = formatRupiah(income);
  expenseElement.textContent = formatRupiah(expense);
  renderFinanceChart();
}

  // Buka modal
  addTransactionButton.addEventListener("click", () => {
    transactionModal.hidden = false;

    document.getElementById("transaction-date").value =
      new Date().toISOString().slice(0, 10);
  });

  // Tutup modal
  function closeModal() {
    transactionModal.hidden = true;
    delete transactionForm.dataset.editId;
    transactionForm.reset();
  }

  closeTransactionButton.addEventListener("click", closeModal);
  cancelTransactionButton.addEventListener("click", closeModal);

  // Simpan transaksi baru

transactionForm.addEventListener("submit", async event => {
  event.preventDefault();

  const type = document.getElementById("transaction-type").value;
  const name = document.getElementById("transaction-name").value.trim();
  const category = document.getElementById("transaction-category").value;
  const amount = Number(document.getElementById("transaction-amount").value);
  const date = document.getElementById("transaction-date").value;

  if (!name || !category || !date || !Number.isFinite(amount) || amount <= 0) {
    alert("Mohon lengkapi data transaksi dengan benar.");
    return;
  }

  const editId = transactionForm.dataset.editId;

if (editId) {
  const transaction = transactions.find(
    item => String(item.id) === String(editId)
  );

  if (!transaction || !transaction.transaction_id) {
    alert("ID transaksi tidak ditemukan. Silakan muat ulang halaman.");
    return;
  }

  const dataTransaksi = {
    aksi: "edit-transaksi",
    transaction_id: transaction.transaction_id,
    tanggal_lokal: date,
    jenis: type === "income" ? "pemasukan" : "pengeluaran",
    kategori: category,
    deskripsi: name,
    jumlah_rupiah: amount,
    metode: "Lainnya"
  };

  try {
    const response = await fetch(FINANCE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(dataTransaksi)
    });

    const teksRespons = await response.text();
    console.log("Respons edit transaksi:", teksRespons);

    const hasil = JSON.parse(teksRespons);

    if (!response.ok || !hasil.success) {
      throw new Error(hasil.message || "Gagal memperbarui transaksi.");
    }

    transaction.type = type;
    transaction.name = name;
    transaction.category = category;
    transaction.amount = amount;
    transaction.date = date;

    delete transactionForm.dataset.editId;

  } catch (error) {
    console.error("Gagal mengedit transaksi:", error);
    alert("Transaksi gagal diperbarui di Google Sheets.");
    return;
  }


  } else {
    const dataTransaksi = {
      aksi: "tambah-transaksi",
      tanggal_lokal: date,
      jenis: type === "income" ? "pemasukan" : "pengeluaran",
      kategori: category,
      deskripsi: name,
      jumlah_rupiah: amount,
      metode: "Lainnya"
    };

    try {
      const response = await fetch(FINANCE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(dataTransaksi)
      });

   const teksRespons = await response.text();

console.log("Respons Apps Script:", teksRespons);

const hasil = JSON.parse(teksRespons);

if (!response.ok || !hasil.success) {
  throw new Error(hasil.message || "Transaksi gagal disimpan.");
}

      transactions.push({
        id: Date.now(),
        transaction_id: hasil.transaction_id,
        type,
        name,
        category,
        amount,
        date
      });

    } catch (error) {
      console.error("Gagal menyimpan transaksi:", error);
      alert("Transaksi gagal dikirim ke Google Sheets. Periksa koneksi dan coba lagi.");
      return;
    }
  }

  currentTransactionPage = 1;

  saveTransactions();
  renderFinance();

  transactionForm.reset();
  closeModal();
});


  // Navigasi bulan
  document.getElementById("previous-month-button").addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    currentTransactionPage = 1;
    updateMonthTitle();
    renderFinance();
  });

  document.getElementById("next-month-button").addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    currentTransactionPage = 1;
    updateMonthTitle();
    renderFinance();
  });
  // Navigasi halaman transaksi
document.getElementById("previous-transaction-page")
  .addEventListener("click", () => {
    if (currentTransactionPage > 1) {
      currentTransactionPage--;
      renderFinance();
    }
  });

document.getElementById("next-transaction-page")
  .addEventListener("click", () => {
    const totalPages = Math.max(
      1,
      Math.ceil(
        getMonthlyTransactions().length / transactionsPerPage
      )
    );

    if (currentTransactionPage < totalPages) {
      currentTransactionPage++;
      renderFinance();
    }
  });
  
  // Edit transaksi
transactionList.addEventListener("click", async event => {
  const editButton = event.target.closest(".edit-transaction-button");
  const deleteButton = event.target.closest(".delete-transaction-button");

  if (editButton) {
    const id = Number(editButton.dataset.id);
    const transaction = transactions.find(item => item.id === id);

    if (!transaction) return;

    document.getElementById("transaction-type").value = transaction.type;
    document.getElementById("transaction-name").value = transaction.name;
    document.getElementById("transaction-category").value = transaction.category;
    document.getElementById("transaction-amount").value = transaction.amount;
    document.getElementById("transaction-date").value = transaction.date;

    transactionForm.dataset.editId = id;
    transactionModal.hidden = false;
  }

  if (deleteButton) {
    const id = Number(deleteButton.dataset.id);

    const transaction = transactions.find(item => item.id === id);

    if (!transaction) return;

    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;

    if (!transaction.transaction_id) {
      alert("ID transaksi tidak ditemukan.");
      return;
    }

    try {
      const response = await fetch(FINANCE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          aksi: "hapus-transaksi",
          transaction_id: transaction.transaction_id
        })
      });

      const teksRespons = await response.text();
      console.log("Respons hapus transaksi:", teksRespons);

      const hasil = JSON.parse(teksRespons);

      if (!response.ok || !hasil.success) {
        throw new Error(hasil.message || "Gagal menghapus transaksi.");
      }

      transactions = transactions.filter(item => item.id !== id);

      saveTransactions();

      const totalPages = Math.ceil(
        transactions.filter(item => {
          const date = new Date(item.date + "T00:00:00");
          return date.getMonth() === currentMonth.getMonth() &&
                 date.getFullYear() === currentMonth.getFullYear();
        }).length / transactionsPerPage
      );

      if (currentTransactionPage > Math.max(1, totalPages)) {
        currentTransactionPage = Math.max(1, totalPages);
      }

      renderFinance();
      alert("Transaksi berhasil dihapus.");

    } catch (error) {
      console.error("Gagal menghapus transaksi:", error);
      alert("Transaksi gagal dihapus dari Google Sheets.");
    }
  }
});


  // Filter grafik mingguan dan bulanan
document.querySelectorAll(".chart-filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".chart-filter").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    currentChartPeriod = button.dataset.period;

    renderFinanceChart();
  });
});


const savingTargetModal = document.getElementById("saving-target-modal");
const savingTargetForm = document.getElementById("saving-target-form");

document.getElementById("manage-saving-target-button")
  .addEventListener("click", () => {
    if (savingTarget) {
      document.getElementById("saving-target-name").value =
        savingTarget.name;

      document.getElementById("saving-target-amount").value =
        savingTarget.amount;

      document.getElementById("saving-target-collected-input").value =
        savingTarget.collected;

      document.getElementById("saving-target-deadline-input").value =
        savingTarget.deadline;
    }

    savingTargetModal.hidden = false;
  });

function closeSavingTargetModal() {
  savingTargetModal.hidden = true;
}

document.getElementById("close-saving-target-modal")
  .addEventListener("click", closeSavingTargetModal);

document.getElementById("cancel-saving-target-button")
  .addEventListener("click", closeSavingTargetModal);

savingTargetForm.addEventListener("submit", async event => {
  event.preventDefault();

  const name = document.getElementById("saving-target-name").value.trim();
  const amount = Number(document.getElementById("saving-target-amount").value);
  const collected = Number(
    document.getElementById("saving-target-collected-input").value
  );
  const deadline = document.getElementById("saving-target-deadline-input").value;

  if (
    !name ||
    !deadline ||
    !Number.isFinite(amount) ||
    !Number.isFinite(collected) ||
    amount <= 0 ||
    collected < 0
  ) {
    alert("Mohon periksa kembali data target tabungan.");
    return;
  }

  if (collected > amount) {
    alert("Jumlah tabungan tidak boleh melebihi target.");
    return;
  }

  const dataTarget = {
    aksi: "simpan-target-tabungan",
    nama_target: name,
    jumlah_target: amount,
    jumlah_terkumpul: collected,
    tanggal_deadline: deadline
  };

  try {
    const response = await fetch(FINANCE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(dataTarget)
    });

    const teksRespons = await response.text();
    console.log("Respons simpan target:", teksRespons);

    const hasil = JSON.parse(teksRespons);

    if (!response.ok || !hasil.success) {
      throw new Error(
        hasil.message || "Gagal menyimpan target tabungan."
      );
    }

    savingTarget = {
      name,
      amount,
      collected,
      deadline,
      goal_id: hasil.goal_id
    };

    localStorage.setItem(
      "pixelQuestSavingTarget",
      JSON.stringify(savingTarget)
    );

    renderSavingTarget();
    closeSavingTargetModal();

    alert("Target tabungan berhasil disimpan ke Google Sheets.");

  } catch (error) {
    console.error("Gagal menyimpan target tabungan:", error);
    alert("Target tabungan gagal disimpan ke Google Sheets.");
  }
});

  // Tampilan awal
  currentTransactionPage = 1;
  updateMonthTitle();
  renderFinance();
  renderSavingTarget();
});
