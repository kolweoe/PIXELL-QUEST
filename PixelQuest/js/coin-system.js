
const CoinSystem = {
  DAILY_LIMIT: 100,
  STORAGE_KEY: "pixelQuestCoinData",

  getData() {
    const saved = localStorage.getItem(this.STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Data koin tidak valid:", error);
      }
    }

    return {
      dailyDate: this.getToday(),
      dailyEarned: 0,
      transactions: []
    };
  },

  getToday() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  },

  award(balance, amount, description) {
    const data = this.getData();
    const today = this.getToday();

    // Reset batas harian ketika tanggal berganti
    if (data.dailyDate !== today) {
      data.dailyDate = today;
      data.dailyEarned = 0;
    }

    const remaining = Math.max(
      0,
      this.DAILY_LIMIT - data.dailyEarned
    );

    const received = Math.min(
      Math.max(0, Math.floor(amount)),
      remaining
    );

    if (received > 0) {
      data.dailyEarned += received;

      data.transactions.push({
        id: crypto.randomUUID(),
        type: "income",
        description: description,
        amount: received,
        date: new Date().toISOString()
      });
    }

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(data)
    );

   return {
  balance: balance + received,
  received: received,
  dailyEarned: data.dailyEarned,
  remaining: this.DAILY_LIMIT - data.dailyEarned,
  transaction: received > 0
    ? data.transactions[data.transactions.length - 1]
    : null
};
  }
};
