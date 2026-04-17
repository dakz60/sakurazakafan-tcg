// ==================== 安全ユーティリティ ====================
function el(id){
  return document.getElementById(id);
}

// ==================== タブ切り替え ====================
function openTab(tabId){
  document.querySelectorAll('button.tab')
    .forEach(b => b.classList.remove('active'));

  if(event?.currentTarget){
    event.currentTarget.classList.add('active');
  }

  document.querySelectorAll('.tab-content')
    .forEach(c => c.classList.remove('active'));

  const target = el(tabId);
  if(target) target.classList.add('active');

  if(tabId === 'collection') showCollection();
  if(tabId === 'allcards') showAllCards();
  if(tabId === 'board') showBoard?.();
}

// ==================== 初期化 ====================
window.addEventListener("load", () => {
  updateReleaseCountdown();
  showDailyCard();
  setupSearchSuggestions?.();
  showCollection();
  showAllCards?.();

  const params = new URLSearchParams(window.location.search);
  const deckParam = params.get("deck");

  if(deckParam){
    const box = el("deckCodeBox");
    if(box) box.value = deckParam;
    loadDeckFromCode();
  }

  // Sortable（存在する場合のみ）
  const deckImages = el("deckImages");
  if(deckImages && typeof Sortable !== "undefined"){
    Sortable.create(deckImages,{
      animation:150,
      onEnd:function(evt){
        const moved = deck.splice(evt.oldIndex,1)[0];
        deck.splice(evt.newIndex,0,moved);
      }
    });
  }
});

// ==================== 全カード ====================
function showAllCards(){
  const container = el("cardListAll");
  if(!container) return;

  if(!window.cards || cards.length===0){
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
  if(!container || !window.cards) return;

  const ownership = el("ownershipFilter")?.value || "all";

  container.innerHTML = cards
    .filter(card => {
      const count = parseInt(localStorage.getItem("cardCount_" + card.id) || 0);
      if(ownership === "owned") return count > 0;
      if(ownership === "unowned") return count === 0;
      return true;
    })
    .map(card => {
      const count = parseInt(localStorage.getItem("cardCount_" + card.id) || 0);

      return `
      <div class="cardAll" style="
        display:flex;
        flex-direction:column;
        align-items:center;
        margin:4px;
        background:#F3F3F3;
        padding:12px;
        border-radius:10px;
        width:120px;
      ">
        <img src="${card.img}" loading="lazy" style="width:110px;height:152px;">
        <div style="text-align:center;font-weight:bold;">
          ${card.name}
        </div>
        <input type="number" min="0" value="${count}"
          style="width:40px;text-align:center;"
          onchange="updateCardCount('${card.id}', this.value)">
      </div>
      `;
    }).join('');
}

// ==================== カード枚数更新 ====================
function updateCardCount(cardId, value){
  const num = Math.max(0, parseInt(value) || 0);
  localStorage.setItem("cardCount_" + cardId, num);
}

// ==================== デッキ ====================
let deck = [];
let territoryCardId = null;

// ==================== カウントダウン ====================
function updateReleaseCountdown(){
  const releaseDate = new Date(2026, 2, 20);
  const today = new Date();

  releaseDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  const diff = Math.floor((today - releaseDate)/(1000*60*60*24));

  let text = diff < 0
    ? `発売まであと${Math.abs(diff)}日`
    : diff === 0
      ? "本日発売！"
      : `発売から${diff}日!!`;

  el("releaseCountdown") && (el("releaseCountdown").textContent = text);
}

// ==================== デイリーカード ====================
function showDailyCard(){
  if(!cards || !el("dailyCard")) return;

  const c = cards[Math.floor(Math.random()*cards.length)];

  el("dailyCard").innerHTML = `
    <img src="${c.img}" style="width:240px;display:block;margin:auto;">
    <div style="text-align:center;margin-top:10px;">${c.name}</div>
  `;
}

function rerollDailyCard(){
  showDailyCard();
}

// ==================== 検索 ====================
function search(){
  if(!cards) return;

  let filtered = cards;

  const name = el("searchBox")?.value || "";
  const effect = el("effectSearchBox")?.value || "";
  const cardId = el("cardIdSearchBox")?.value || "";

  filtered = filtered.filter(c =>
    (!name || c.name.includes(name)) &&
    (!effect || (c.effect && c.effect.includes(effect))) &&
    (!cardId || c.id.includes(cardId))
  );

  const result = el("result");
  if(!result) return;

  if(filtered.length === 0){
    result.textContent = "見つかりませんでした";
    return;
  }

  result.innerHTML = filtered.map(card => `
    <div style="display:flex;align-items:center;">
      <img src="${card.img}" style="width:85px;margin-right:5px;">
      <div>
        ${card.name} | コスト:${card.cost ?? "-"} | ID:${card.id}
        <br>
        <button onclick="addToDeck('${card.id}')">＋</button>
        <button onclick="removeFromDeck('${card.id}')">－</button>
      </div>
    </div>
  `).join('');
}

// ==================== デッキ操作 ====================
function addToDeck(id){
  const card = cards.find(c=>c.id===id);
  if(!card) return;

  if(card.type === 'territory'){
    territoryCardId = id;
    updateDeckImages();
    updateDeckStatus();
    return;
  }

  if(deck.length >= 50){
    alert("デッキは50枚まで");
    return;
  }

  deck.push(id);
  updateDeckImages();
  updateDeckStatus();
}

function removeFromDeck(id){
  const i = deck.indexOf(id);
  if(i !== -1) deck.splice(i,1);

  if(territoryCardId === id) territoryCardId = null;

  updateDeckImages();
  updateDeckStatus();
}

// ==================== デッキ表示 ====================
function updateDeckImages(){
  const deckDiv = el("deckImages");
  if(!deckDiv) return;

  deckDiv.innerHTML = "";

  deck.slice(0,50).forEach(id=>{
    const c = cards.find(x=>x.id===id);
    if(!c) return;

    const img = document.createElement("img");
    img.src = c.img;
    img.onclick = () => removeFromDeck(id);
    deckDiv.appendChild(img);
  });

  const terr = el("territoryImage");
  if(terr){
    terr.innerHTML = "";
    const c = cards.find(x=>x.id===territoryCardId);
    if(c){
      const img = document.createElement("img");
      img.src = c.img;
      img.onclick = () => { territoryCardId=null; updateDeckImages(); };
      terr.appendChild(img);
    }
  }
}

function updateDeckStatus(){
  el("deckStatus") && (el("deckStatus").textContent =
    `デッキ:${deck.length}枚 / テリトリー:${territoryCardId ? "あり" : "なし"}`
  );
}

// ==================== デッキコード ====================
function generateDeckCode(){
  if(deck.length===0) return alert("空です");

  el("deckCodeBox").value =
    (territoryCardId || "0") + "|" + deck.join(",");

  el("deckCodeResult").textContent = "生成完了";
}

function loadDeckFromCode(){
  const code = el("deckCodeBox")?.value;
  if(!code) return;

  const [t, d] = code.split("|");

  territoryCardId = (t !== "0") ? t : null;
  deck = (d ? d.split(",") : []).filter(id =>
    cards.some(c => c.id === id)
  );

  updateDeckImages();
  updateDeckStatus();
}

// ==================== 互換ダミー ====================
function showBoard(){}
function showAllCards(){}
