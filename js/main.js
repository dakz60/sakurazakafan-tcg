let deck = [];
let territoryCardId = null;
let collectionFilter = "all";

function openTab(tabId, buttonEl) {
  document.querySelectorAll("button.tab").forEach((button) => button.classList.remove("active"));
  if (buttonEl) {
    buttonEl.classList.add("active");
  }

  document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.classList.add("active");
  }

  if (tabId === "collection") showCollection();
  if (tabId === "allcards") showAllCards();
  if (tabId === "board" && typeof showBoard === "function") showBoard();
}

function normalizeSearchText(text) {
  return String(text || "")
    .replace(/\s+/g, "")
    .replace(/山崎/g, "山﨑")
    .trim()
    .toLowerCase();
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((el) => el.value);
}

function parseTradeEntries(text) {
  return String(text || "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCardEntry(entryText) {
  const [rawId, rawCount] = String(entryText || "").split("*");
  return {
    id: String(rawId || "").trim(),
    count: Math.max(1, parseInt(rawCount, 10) || 1),
  };
}

function findCardById(id) {
  return cards.find((card) => String(card.id) === String(id));
}

function getCardSubTypes(card) {
  if (Array.isArray(card?.subType)) return card.subType;
  if (Array.isArray(card?.subtype)) return card.subtype;
  return [];
}

function formatCompactCardEntry(entryText) {
  const { id, count } = parseCardEntry(entryText);
  return count > 1 ? `${id}×${count}` : id;
}

function convertIdsToCompactList(idText) {
  return parseTradeEntries(idText).map(formatCompactCardEntry).join(",");
}

function formatCardEntry(entryText) {
  const { id, count } = parseCardEntry(entryText);
  const card = findCardById(id);
  if (!card) {
    return count > 1 ? `不明ID:${id}×${count}` : `不明ID:${id}`;
  }

  const suffix = count > 1 ? `×${count}` : "";
  return `${card.name}(${card.rarity})${suffix}`;
}

function convertIdsToNames(idText) {
  return parseTradeEntries(idText).map(formatCardEntry).join("、");
}

function setupSearchSuggestions() {
  const dataList = document.getElementById("cardList");
  if (!dataList || !cards || cards.length === 0) return;

  const uniqueNames = [...new Set(cards.map((card) => card.name))];
  dataList.innerHTML = uniqueNames.map((name) => `<option value="${name}">`).join("");
}

function updateReleaseCountdown() {
  const releaseDate = new Date(2026, 2, 20);
  const today = new Date();

  releaseDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diff = Math.floor((today - releaseDate) / (1000 * 60 * 60 * 24));
  let text = "";

  if (diff < 0) text = `発売まであと${Math.abs(diff)}日`;
  else if (diff === 0) text = "本日発売！";
  else text = `発売から${diff}日!!`;

  const countdown = document.getElementById("releaseCountdown");
  if (countdown) countdown.textContent = text;
}

function showDailyCard() {
  if (!cards || cards.length === 0) return;

  const randomCard = cards[Math.floor(Math.random() * cards.length)];
  const dailyCard = document.getElementById("dailyCard");
  if (!dailyCard) return;

  dailyCard.innerHTML = `
    <img src="${randomCard.img}" alt="${randomCard.name}" style="width:240px; display:block; margin:auto;">
    <div style="text-align:center; margin-top:10px;">${randomCard.name}</div>
  `;
}

function rerollDailyCard() {
  showDailyCard();
}

function showManualCard() {
  const input = document.getElementById("manualCardId");
  if (!input) return;

  const id = input.value.trim();
  const card = findCardById(id);
  if (!card) {
    alert("カードIDが見つかりません");
    return;
  }

  const dailyCard = document.getElementById("dailyCard");
  if (!dailyCard) return;

  dailyCard.innerHTML = `
    <img src="${card.img}" alt="${card.name}" style="width:240px; display:block; margin:auto;">
    <div style="text-align:center; margin-top:10px;">${card.name}</div>
  `;
}

function showAllCards() {
  const container = document.getElementById("cardListAll");
  if (!container) return;

  if (!cards || cards.length === 0) {
    container.textContent = "カードデータがありません";
    return;
  }

  container.innerHTML = cards
    .map(
      (card) => `
        <div class="cardAll">
          <img src="${card.img}" alt="${card.name}" loading="lazy">
          <div>${card.name}</div>
          <div>ID:${card.id}</div>
        </div>
      `
    )
    .join("");
}

function setCollectionFilter(nextFilter) {
  collectionFilter = nextFilter;

  const buttonMap = {
    all: "collectionFilterAll",
    owned: "collectionFilterOwned",
    unowned: "collectionFilterUnowned",
  };

  Object.values(buttonMap).forEach((id) => {
    const button = document.getElementById(id);
    if (button) button.classList.remove("active");
  });

  const activeButton = document.getElementById(buttonMap[nextFilter]);
  if (activeButton) activeButton.classList.add("active");

  showCollection();
}

function getCardCount(cardId) {
  return Math.max(0, parseInt(localStorage.getItem(`cardCount_${cardId}`), 10) || 0);
}

function updateCardCount(cardId, value) {
  const num = Math.max(0, parseInt(value, 10) || 0);
  localStorage.setItem(`cardCount_${cardId}`, String(num));
}

function handleCardCountChange(cardId, value) {
  updateCardCount(cardId, value);
  showCollection();
}

function showCollection() {
  const container = document.getElementById("collectionList");
  if (!container) return;

  if (!cards || cards.length === 0) {
    container.textContent = "カードデータがありません";
    return;
  }

  container.innerHTML = cards
    .filter((card) => {
      const count = getCardCount(card.id);
      if (collectionFilter === "owned") return count > 0;
      if (collectionFilter === "unowned") return count === 0;
      return true;
    })
    .map((card) => {
      const count = getCardCount(card.id);
      return `
        <div class="cardAll collection-card">
          <img src="${card.img}" loading="lazy" alt="${card.name}">
          <div class="collection-card-name">${card.name}</div>
          <input
            type="number"
            min="0"
            value="${count}"
            onchange="handleCardCountChange('${card.id}', this.value)"
          >
        </div>
      `;
    })
    .join("");
}

function search() {
  const name = document.getElementById("searchBox")?.value || "";
  const effect = document.getElementById("effectSearchBox")?.value || "";
  const costMin = document.getElementById("costMin")?.value || "";
  const costMax = document.getElementById("costMax")?.value || "";
  const powerMin = document.getElementById("powerMin")?.value || "";
  const powerMax = document.getElementById("powerMax")?.value || "";
  const hitMin = document.getElementById("hitMin")?.value || "";
  const hitMax = document.getElementById("hitMax")?.value || "";
  const typeFilter = document.getElementById("typeFilter")?.value || "";
  const colorFilter = document.getElementById("colorFilter")?.value || "";
  const suitFilter = document.getElementById("suitFilter")?.value || "";
  const generationFilter = document.getElementById("generationFilter")?.value || "";
  const subTypeFilter = document.getElementById("subTypeFilter")?.value || "";
  const rarityFilter = document.getElementById("rarityFilter")?.value || "";
  const keyWordFilter = document.getElementById("keyWordFilter")?.value || "";
  const cardId = document.getElementById("cardIdSearchBox")?.value || "";
  const result = document.getElementById("result");
  if (!result) return;

  let filtered = cards.filter(
    (card) =>
      (!name || card.name.includes(name)) &&
      (!effect || (card.effect && card.effect.includes(effect))) &&
      (!cardId || String(card.id).includes(cardId))
  );

  if (costMin !== "") filtered = filtered.filter((card) => Number(card.cost) >= Number(costMin));
  if (costMax !== "") filtered = filtered.filter((card) => Number(card.cost) <= Number(costMax));
  if (powerMin !== "") filtered = filtered.filter((card) => card.power != null && Number(card.power) >= Number(powerMin));
  if (powerMax !== "") filtered = filtered.filter((card) => card.power != null && Number(card.power) <= Number(powerMax));
  if (hitMin !== "") filtered = filtered.filter((card) => card.hit != null && Number(card.hit) >= Number(hitMin));
  if (hitMax !== "") filtered = filtered.filter((card) => card.hit != null && Number(card.hit) <= Number(hitMax));

  if (typeFilter !== "") {
    filtered = filtered.filter((card) => {
      if (!card.type) return false;
      const types = String(card.type).split("/");
      if (typeFilter === "unit") return types.includes("unit");
      if (typeFilter === "ace") return types.includes("ace");
      return card.type === typeFilter;
    });
  }

  if (keyWordFilter !== "") {
    filtered = filtered.filter((card) => Array.isArray(card.keyWord) && card.keyWord.includes(keyWordFilter));
  }

  if (colorFilter !== "") filtered = filtered.filter((card) => card.color === colorFilter);
  if (generationFilter !== "") filtered = filtered.filter((card) => card.generation === generationFilter);
  if (rarityFilter !== "") filtered = filtered.filter((card) => card.rarity === rarityFilter);

  if (suitFilter !== "") {
    filtered = filtered.filter((card) => card.suit && String(card.suit).includes(suitFilter));
  }

  if (subTypeFilter === "バスター" || subTypeFilter === "ショット") {
    filtered = filtered.filter((card) => getCardSubTypes(card).includes(subTypeFilter));
  } else if (subTypeFilter === "その他") {
    filtered = filtered.filter((card) => {
      const subTypes = getCardSubTypes(card);
      return !subTypes.includes("バスター") && !subTypes.includes("ショット") && card.type !== "territory";
    });
  }

  if (filtered.length === 0) {
    result.textContent = "見つかりませんでした";
    return;
  }

  result.innerHTML = filtered
    .map((card) => {
      let colorClass = "";
      if (card.color === "白") colorClass = "card-white";
      else if (card.color === "赤") colorClass = "card-red";
      else if (card.color === "青") colorClass = "card-blue";
      else if (card.color === "黒") colorClass = "card-black";

      const imgTag = `<img src="${card.img}" loading="lazy" alt="${card.name}" style="width:85px; height:auto; border-radius:5px; margin-right:5px;">`;
      const subTypes = getCardSubTypes(card).length > 0 ? getCardSubTypes(card).join(",") : "-";
      const keyWords = Array.isArray(card.keyWord) ? card.keyWord.join(",") : "-";

      const info =
        card.type === "command" || card.type === "territory"
          ? `コスト:${card.cost} | 効果:${card.effect || "-"} | レアリティ:${card.rarity || "-"} | 期別:${card.generation || "-"} | トリガー:${subTypes} | キーワード:${keyWords} | カードID:${card.id}`
          : `コスト:${card.cost} | 効果:${card.effect || "-"} | パワー:${card.power || "-"} | ヒット:${card.hit || "-"} | レアリティ:${card.rarity || "-"} | 期別:${card.generation || "-"} | トリガー:${subTypes} | キーワード:${keyWords} | カードID:${card.id}`;

      return `<div class="${colorClass}" style="display:flex; align-items:center; margin-bottom:5px;">
        ${imgTag}<div>${card.name} | ${info}<br>
        <button onclick="addToDeck('${card.id}')">＋</button>
        <button onclick="removeFromDeck('${card.id}')">－</button></div></div>`;
    })
    .join("");
}

function addToDeck(id) {
  const card = findCardById(id);
  if (!card) return;

  if (card.type === "territory") {
    territoryCardId = id;
    updateDeckImages();
    updateDeckStatus();
    return;
  }

  const sameSpecCount = deck.filter((deckId) => {
    const target = findCardById(deckId);
    if (!target) return false;

    return (
      target.name === card.name &&
      target.type === card.type &&
      target.cost === card.cost &&
      target.power === card.power &&
      target.hit === card.hit &&
      target.color === card.color &&
      JSON.stringify(getCardSubTypes(target)) === JSON.stringify(getCardSubTypes(card)) &&
      target.generation === card.generation
    );
  }).length;

  if (sameSpecCount >= 4) {
    alert("同じカードは4枚までです");
    return;
  }

  if (deck.length >= 50) {
    alert("デッキは50枚までです");
    return;
  }

  deck.push(id);
  updateDeckImages();
  updateDeckStatus();
}

function removeFromDeck(id) {
  const index = deck.indexOf(id);
  if (index !== -1) deck.splice(index, 1);
  if (territoryCardId === id) territoryCardId = null;
  updateDeckImages();
  updateDeckStatus();
}

function updateDeckImages() {
  const deckDiv = document.getElementById("deckImages");
  const territoryDiv = document.getElementById("territoryImage");
  if (!deckDiv || !territoryDiv) return;

  deckDiv.innerHTML = "";
  deck.slice(0, 50).forEach((cardId) => {
    const card = findCardById(cardId);
    if (!card) return;

    const img = document.createElement("img");
    img.src = card.img;
    img.alt = card.name;
    img.onclick = () => removeFromDeck(card.id);
    deckDiv.appendChild(img);
  });

  for (let i = deck.length; i < 50; i += 1) {
    const placeholder = document.createElement("div");
    placeholder.style.width = "110px";
    placeholder.style.height = "152px";
    deckDiv.appendChild(placeholder);
  }

  territoryDiv.innerHTML = "";
  if (territoryCardId) {
    const card = findCardById(territoryCardId);
    if (card) {
      const img = document.createElement("img");
      img.src = card.img;
      img.alt = card.name;
      img.onclick = () => {
        territoryCardId = null;
        updateDeckImages();
        updateDeckStatus();
      };
      territoryDiv.appendChild(img);
    }
  }
}

function updateDeckStatus() {
  const deckStatus = document.getElementById("deckStatus");
  if (!deckStatus) return;

  let unitCount = 0;
  let commandCount = 0;
  let busterCount = 0;
  let shotCount = 0;

  deck.forEach((id) => {
    const card = findCardById(id);
    if (!card) return;
    if (card.type && String(card.type).includes("unit")) unitCount += 1;
    if (card.type === "command") commandCount += 1;
    if (getCardSubTypes(card).includes("バスター")) busterCount += 1;
    if (getCardSubTypes(card).includes("ショット")) shotCount += 1;
  });

  deckStatus.innerHTML = `
    ユニット：${unitCount}枚<br>
    コマンド：${commandCount}枚<br>
    バスター：${busterCount}枚<br>
    ショット：${shotCount}枚<br>
    テリトリー：${territoryCardId ? "あり" : "なし"}
  `;
}

function checkDeckRules() {
  const totalCards = deck.length;
  const territoryCount = territoryCardId ? 1 : 0;
  let busterCount = 0;
  let shotCount = 0;

  deck.forEach((id) => {
    const card = findCardById(id);
    if (!card) return;
    if (getCardSubTypes(card).includes("バスター")) busterCount += 1;
    if (getCardSubTypes(card).includes("ショット")) shotCount += 1;
  });

  let msg = "";
  if (totalCards < 40 || totalCards > 50) msg += `デッキ枚数は40～50枚である必要があります（現在${totalCards}枚）<br>`;
  if (territoryCount !== 1) msg += `テリトリーカードは1枚必要です（現在${territoryCount}枚）<br>`;
  if (busterCount !== 12) msg += `バスターカードは12枚必要です（現在${busterCount}枚）<br>`;
  if (shotCount > 12) msg += `ショットカードは最大12枚です（現在${shotCount}枚）<br>`;

  const result = document.getElementById("deckCheckResult");
  if (result) result.innerHTML = msg || "咲け、咲け、櫻坂46";
}

function generateDeckCode() {
  if (deck.length === 0) {
    alert("デッキが空です");
    return;
  }

  const territoryId = territoryCardId || "0";
  const idList = deck.join(",");
  const deckCodeBox = document.getElementById("deckCodeBox");
  const deckCodeResult = document.getElementById("deckCodeResult");
  if (deckCodeBox) deckCodeBox.value = `${territoryId}|${idList}`;
  if (deckCodeResult) deckCodeResult.textContent = "デッキコード生成完了！";
}

function loadDeckFromCode() {
  const deckCodeBox = document.getElementById("deckCodeBox");
  if (!deckCodeBox) return;

  const code = deckCodeBox.value.trim();
  if (!code) {
    alert("コードを入力してください");
    return;
  }

  try {
    const [territoryId, rawDeckIds] = code.split("|");
    const deckIds = rawDeckIds ? rawDeckIds.split(",") : [];
    territoryCardId = territoryId !== "0" ? territoryId : null;
    deck = deckIds.filter((id) => cards.some((card) => String(card.id) === String(id)));
    updateDeckImages();
    updateDeckStatus();
    const deckCodeResult = document.getElementById("deckCodeResult");
    if (deckCodeResult) deckCodeResult.textContent = "デッキ復元完了！";
  } catch (error) {
    alert("無効なコードです");
  }
}

function copyDeckCode() {
  const deckCodeBox = document.getElementById("deckCodeBox");
  if (!deckCodeBox || !deckCodeBox.value) {
    alert("コピーするコードがありません");
    return;
  }

  navigator.clipboard
    .writeText(deckCodeBox.value)
    .then(() => {
      const deckCodeResult = document.getElementById("deckCodeResult");
      if (deckCodeResult) deckCodeResult.textContent = "コピーしました！";
    })
    .catch(() => {
      alert("コピーに失敗しました");
    });
}

function toggleBackground() {
  const deckContainer = document.getElementById("deckContainer");
  if (!deckContainer) return;

  if (deckContainer.classList.contains("white-mode")) deckContainer.classList.replace("white-mode", "mat-mode");
  else deckContainer.classList.replace("mat-mode", "white-mode");
}

function buildTradeText() {
  const giveRaw = document.getElementById("tradeGive")?.value || "";
  const wantRaw = document.getElementById("tradeWant")?.value || "";
  const give = convertIdsToCompactList(giveRaw) || "なし";
  const want = convertIdsToCompactList(wantRaw) || "なし";
  const method = getCheckedValues("tradeMethod").join("、") || "未入力";
  const place = getCheckedValues("tradePlace").join("、") || "未入力";
  const oshi = getCheckedValues("tradeOshi").join("、") || "未入力";

  return `【櫻坂TCGトレード】
譲：${give}
求：${want}
方法：${method}
場所：${place}
推し：${oshi}

#櫻坂TCGトレード #櫻坂TCG掲示板`;
}

function previewTradeText() {
  const tradePreview = document.getElementById("tradePreview");
  if (tradePreview) tradePreview.value = buildTradeText();
}

function copyTradeText() {
  const text = buildTradeText();
  const tradePreview = document.getElementById("tradePreview");
  if (tradePreview) tradePreview.value = text;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("投稿文をコピーしました");
    })
    .catch(() => {
      alert("コピーに失敗しました");
    });
}

function postTrade() {
  const text = buildTradeText();
  const tradePreview = document.getElementById("tradePreview");
  if (tradePreview) tradePreview.value = text;

  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

window.addEventListener("load", () => {
  updateReleaseCountdown();
  showDailyCard();
  setupSearchSuggestions();
  showCollection();
  updateDeckStatus();

  const deckImages = document.getElementById("deckImages");
  if (deckImages && typeof Sortable !== "undefined") {
    Sortable.create(deckImages, {
      animation: 150,
      onEnd(evt) {
        const moved = deck.splice(evt.oldIndex, 1)[0];
        deck.splice(evt.newIndex, 0, moved);
      },
    });
  }

  const params = new URLSearchParams(window.location.search);
  const deckParam = params.get("deck");
  if (deckParam) {
    const deckCodeBox = document.getElementById("deckCodeBox");
    if (deckCodeBox) deckCodeBox.value = deckParam;
    loadDeckFromCode();
  }
});
