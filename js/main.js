// ==================== タブ切り替え ====================
function openTab(e, tabId){
  document.querySelectorAll('button.tab')
    .forEach(b => b.classList.remove('active'));

  e.currentTarget.classList.add('active');

  document.querySelectorAll('.tab-content')
    .forEach(c => c.classList.remove('active'));

  document.getElementById(tabId)
    .classList.add('active');
}


// ==================== ページ初期化 ====================
document.addEventListener("DOMContentLoaded", () => {

  updateReleaseCountdown();
  showDailyCard();
  showAllCards();

  // Sortable 安全初期化
  const deckImages = document.getElementById("deckImages");
  if (deckImages && typeof Sortable !== "undefined") {
    Sortable.create(deckImages, {
      animation: 150,
      onEnd: function(evt){
        const moved = deck.splice(evt.oldIndex,1)[0];
        deck.splice(evt.newIndex,0,moved);
      }
    });
  }

  // URLからデッキ復元
  const params = new URLSearchParams(window.location.search);
  const deckParam = params.get("deck");
  if(deckParam){
    document.getElementById("deckCodeBox").value = deckParam;
    loadDeckFromCode();
  }

});


// ==================== 全カード一覧 ====================
function showAllCards(){
  const container = document.getElementById("cardListAll");
  if(!cards || cards.length===0){
    container.textContent = "カードデータがありません";
    return;
  }

  container.innerHTML = cards.map(c=>`
    <div class="cardAll">
      <img src="${c.img}" alt="${c.name}"><br>
      ${c.name}<br>
      ID:${c.id}
    </div>
  `).join('');
}


/* ==================== デッキ作成 ==================== */

let deck = [];
let territoryCardId = null;

function updateReleaseCountdown(){
  const releaseDate = new Date("2026-03-20");
  const today = new Date();
  const diff = Math.ceil((releaseDate - today)/(1000*60*60*24));
  document.getElementById("releaseCountdown").textContent =
    diff>0 ? `発売まであと${diff}日` : "発売日です！";
}

function showDailyCard(){
  if(!cards || cards.length===0) return;

  const randomCard = cards[Math.floor(Math.random()*cards.length)];

  document.getElementById("dailyCard").innerHTML = `
    <img src="${randomCard.img}" style="width:240px; display:block; margin:auto;">
    <div style="text-align:center; margin-top:10px;">${randomCard.name}</div>
  `;
}

function rerollDailyCard(){ showDailyCard(); }

function showManualCard(){
  const id = document.getElementById("manualCardId").value.trim();
  const card = cards.find(c => c.id === id);

  if(!card){
    alert("カードIDが見つかりません");
    return;
  }

  document.getElementById("dailyCard").innerHTML = `
    <img src="${card.img}" style="width:240px; display:block; margin:auto;">
    <div style="text-align:center; margin-top:10px;">${card.name}</div>
  `;
}
