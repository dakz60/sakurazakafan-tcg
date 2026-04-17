// ==================== ユーティリティ ====================
function el(id){
  return document.getElementById(id);
}

// cards安全参照
function getCards(){
  return window.cards || [];
}

// ==================== タブ切り替え ====================
function openTab(tabId, btn){

  document.querySelectorAll('button.tab')
    .forEach(b => b.classList.remove('active'));

  if(btn){
    btn.classList.add('active');
  }

  document.querySelectorAll('.tab-content')
    .forEach(c => c.classList.remove('active'));

  const target = el(tabId);
  if(target) target.classList.add('active');

  // タブごとの再描画
  if(tabId === 'collection') showCollection();
  if(tabId === 'allcards') showAllCards();
  if(tabId === 'board' && typeof showBoard === "function") showBoard();
}

// ==================== 初期化 ====================
window.addEventListener("load", () => {

  updateReleaseCountdown();
  showDailyCard();
  showCollection();
  showAllCards();

  // URLデッキ復元
  const params = new URLSearchParams(location.search);
  const deckParam = params.get("deck");

  if(deckParam){
    const box = el("deckCodeBox");
    if(box) box.value = deckParam;
    loadDeckFromCode();
  }

  // ドラッグ並び替え
  const deckImages = el("deckImages");
  if(deckImages && typeof Sortable !== "undefined"){
    Sortable.create(deckImages,{
      animation:150,
      onEnd(evt){
        const moved = deck.splice(evt.oldIndex,1)[0];
        deck.splice(evt.newIndex,0,moved);
        updateDeckStatus();
      }
    });
  }
});

// ==================== 全カード ====================
function showAllCards(){
  const container = el("cardListAll");
  if(!container) return;

  const cards = getCards();

  if(cards.length === 0){
    container.textContent = "カードデータがありません";
    return;
  }

  container.innerHTML = cards.map(c => `
    <div class="cardAll">
      <img src="${c.img}" alt="${c.name}" loading="lazy"><br>
      ${c.name}<br>
      ID:${c.id}
    </div>
  `).join('');
}

// ==================== コレクション ====================
function showCollection(){
  const container = el("collectionList");
  if(!container) return;

  const cards = getCards();
  const mode = el("ownershipFilter")?.value || "all";

  container.innerHTML = cards
    .filter(card => {
      const count = Number(localStorage.getItem("cardCount_" + card.id) || 0);

      if(mode === "owned") return count > 0;
      if(mode === "unowned") return count === 0;
      return true;
    })
    .map(card => {
      const count = Number(localStorage.getItem("cardCount_" + card.id) || 0);

      return `
      <div class="cardAll" style="display:flex;flex-direction:column;align-items:center;margin:4px;padding:12px;width:120px;">
        <img src="${card.img}" style="width:110px;height:152px;">
        <div style="text-align:center;font-weight:bold;">${card.name}</div>
        <input type="number" min="0" value="${count}"
          style="width:40px;text-align:center;"
          onchange="updateCardCount('${card.id}', this.value)">
      </div>
      `;
    }).join('');
}

// ==================== カード枚数 ====================
function updateCardCount(cardId, value){
  const num = Math.max(0, parseInt(value) || 0);
  localStorage.setItem("cardCount_" + cardId, num);
}

// ==================== デッキ ====================
let deck = [];
let territoryCardId = null;

// ==================== 発売カウントダウン ====================
function updateReleaseCountdown(){
  const release = new Date(2026, 2, 20);
  const now = new Date();

  release.setHours(0,0,0,0);
  now.setHours(0,0,0,0);

  const diff = Math.floor((now - release) / (1000*60*60*24));

  const text =
    diff < 0 ? `発売まであと${Math.abs(diff)}日`
    : diff === 0 ? "本日発売！"
    : `発売から${diff}日`;

  const elc = el("releaseCountdown");
  if(elc) elc.textContent = text;
}

// ==================== デイリーカード ====================
function showDailyCard(){
  const container = el("dailyCard");
  const cards = getCards();
  if(!container || cards.length === 0) return;

  const c = cards[Math.floor(Math.random() * cards.length)];

  container.innerHTML = `
    <img src="${c.img}" style="width:240px;display:block;margin:auto;">
    <div style="text-align:center;margin-top:10px;">${c.name}</div>
  `;
}

function rerollDailyCard(){
  showDailyCard();
}

// ==================== 検索 ====================
function search(){
  const cards = getCards();

  const name = el("searchBox")?.value || "";
  const effect = el("effectSearchBox")?.value || "";
  const id = el("cardIdSearchBox")?.value || "";

  const result = el("result");
  if(!result) return;

  const filtered = cards.filter(c =>
    (!name || c.name.includes(name)) &&
    (!effect || (c.effect || "").includes(effect)) &&
    (!id || c.id.includes(id))
  );

  if(filtered.length === 0){
    result.textContent = "見つかりませんでした";
    return;
  }

  result.innerHTML = filtered.map(card => `
    <div style="display:flex;align-items:center;">
      <img src="${card.img}" style="width:80px;margin-right:8px;">
      <div>
        ${card.name} | ID:${card.id}
        <br>
        <button onclick="addToDeck('${card.id}')">＋</button>
        <button onclick="removeFromDeck('${card.id}')">－</button>
      </div>
    </div>
  `).join('');
}

// ==================== デッキ操作 ====================
function addToDeck(id){
  const cards = getCards();
  const card = cards.find(c => c.id === id);
  if(!card) return;

  if(card.type === "territory"){
    territoryCardId = id;
    updateDeck();
    return;
  }

  if(deck.length >= 50){
    alert("デッキは50枚まで");
    return;
  }

  deck.push(id);
  updateDeck();
}

function removeFromDeck(id){
  deck = deck.filter(x => x !== id);

  if(territoryCardId === id){
    territoryCardId = null;
  }

  updateDeck();
}

// ==================== デッキ描画 ====================
function updateDeck(){
  const cards = getCards();

  const deckDiv = el("deckImages");
  if(deckDiv){
    deckDiv.innerHTML = "";

    deck.slice(0,50).forEach(id => {
      const c = cards.find(x => x.id === id);
      if(!c) return;

      const img = document.createElement("img");
      img.src = c.img;
      img.onclick = () => removeFromDeck(id);
      deckDiv.appendChild(img);
    });
  }

  const terr = el("territoryImage");
  if(terr){
    terr.innerHTML = "";

    const c = cards.find(x => x.id === territoryCardId);
    if(c){
      const img = document.createElement("img");
      img.src = c.img;
      img.onclick = () => {
        territoryCardId = null;
        updateDeck();
      };
      terr.appendChild(img);
    }
  }

  updateDeckStatus();
}

// ==================== デッキ状態 ====================
function updateDeckStatus(){
  const elc = el("deckStatus");
  if(!elc) return;

  elc.textContent =
    `デッキ:${deck.length}枚 / テリトリー:${territoryCardId ? "あり" : "なし"}`;
}

// ==================== デッキコード ====================
function generateDeckCode(){
  if(deck.length === 0) return alert("空です");

  const code = (territoryCardId || "0") + "|" + deck.join(",");
  el("deckCodeBox").value = code;

  const out = el("deckCodeResult");
  if(out) out.textContent = "生成完了";
}

function loadDeckFromCode(){
  const code = el("deckCodeBox")?.value;
  if(!code) return;

  const [t, d] = code.split("|");

  territoryCardId = (t !== "0") ? t : null;

  const cards = getCards();
  deck = (d ? d.split(",") : []).filter(id =>
    cards.some(c => c.id === id)
  );

  updateDeck();
}
