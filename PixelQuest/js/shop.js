
// =====================================
// PIXEL QUEST - DATA KATALOG TOKO
// =====================================

const shopCharacterCatalog = window.PQ_CHARACTER_CATALOG.filter(
    character => character.price > 0
);
const COINS_KEY = "pixelQuestCoins";
const OWNED_KEY = "pixelQuestOwnedCharacters";

const shopItems = document.getElementById("shop-items");
const shopCoins = document.getElementById("shop-coins");
const preview = document.getElementById("shop-character-preview");
const itemName = document.getElementById("shop-item-name");
const itemDescription = document.getElementById("shop-item-description");
const itemPrice = document.getElementById("shop-item-price");
const buyButton = document.getElementById("shop-buy-button");
const shopMessage = document.getElementById("shop-message");

let selectedShopCharacter = shopCharacterCatalog[0];

// =====================================
// PENYIMPANAN DATA
// =====================================

function getShopCoins() {
    const saved = Number(localStorage.getItem(COINS_KEY) ?? 1250);
    return Number.isFinite(saved) && saved >= 0 ? saved : 0;
}

function getOwnedCharacters() {
    try {
        const saved = JSON.parse(localStorage.getItem(OWNED_KEY) || '["petualang"]');
        return Array.isArray(saved) ? saved : ["petualang"];
    } catch {
        return ["petualang"];
    }
}

function saveOwnedCharacters(characters) {
    localStorage.setItem(OWNED_KEY, JSON.stringify(characters));
}

function updateCoinDisplay() {
    shopCoins.textContent = getShopCoins().toLocaleString("id-ID");
}

// =====================================
// PREVIEW KARAKTER
// =====================================

function showCharacter(character) {
    selectedShopCharacter = character;

    preview.style.backgroundImage = `url("${character.image}")`;
    preview.style.backgroundSize = "400% 100%";
    preview.style.backgroundPosition = "0 0";

    itemName.textContent = character.name;
    itemDescription.textContent = character.description;
    itemPrice.textContent = `🪙 ${character.price.toLocaleString("id-ID")}`;

    updateBuyButton();
}

function updateBuyButton() {
    const owned = getOwnedCharacters().includes(selectedShopCharacter.id);
    const coins = getShopCoins();

    if (owned) {
        buyButton.textContent = "DIMILIKI";
        buyButton.disabled = true;
    } else {
        buyButton.textContent = "BELI";
        buyButton.disabled = coins < selectedShopCharacter.price;
    }
}

// =====================================
// TAMPILKAN KARTU KATALOG
// =====================================

function renderShopCatalog() {
    shopItems.innerHTML = "";

    // Simulasi 4 kartu menggunakan karakter perempuan yang sama
    const previewCharacters = shopCharacterCatalog.length
        ? Array.from({ length: 4 }, () => shopCharacterCatalog[0])
        : [];

    previewCharacters.forEach(character => {
        const card = document.createElement("article");
        card.className = "shop-card";

        const thumbnail = document.createElement("div");
        thumbnail.className = "shop-item-icon";
        thumbnail.style.backgroundImage = `url("${character.image}")`;
        thumbnail.style.backgroundSize = "400% 100%";
        thumbnail.style.backgroundPosition = "0 0";
        thumbnail.style.backgroundRepeat = "no-repeat";

        const name = document.createElement("h3");
        name.textContent = character.name;

        card.append(thumbnail, name);

        card.style.cursor = "pointer";

        card.addEventListener("click", () => {
            showCharacter(character);
            shopMessage.textContent = "";
        });

        shopItems.appendChild(card);
    });
}
// =====================================
// PROSES PEMBELIAN
// =====================================

function buySelectedCharacter() {
    const character = selectedShopCharacter;
    const owned = getOwnedCharacters();

    if (owned.includes(character.id)) {
        shopMessage.textContent = "Karakter ini sudah dimiliki.";
        return;
    }

    const coins = getShopCoins();

    if (coins < character.price) {
        shopMessage.textContent = "Coins kamu belum cukup.";
        return;
    }

    const remainingCoins = coins - character.price;

    localStorage.setItem(COINS_KEY, String(remainingCoins));

    owned.push(character.id);
    saveOwnedCharacters(owned);

    updateCoinDisplay();
    renderShopCatalog();
    updateBuyButton();

    shopMessage.textContent = `${character.name} berhasil dibeli!`;
}

buyButton.addEventListener("click", buySelectedCharacter);

// =====================================
// INISIALISASI TOKO
// =====================================

updateCoinDisplay();
renderShopCatalog();

if (selectedShopCharacter) {
    showCharacter(selectedShopCharacter);
}
