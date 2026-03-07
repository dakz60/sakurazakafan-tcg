// タブ切り替え
function openTab(tabId){
  document.querySelectorAll('button.tab').forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');

  if(tabId === 'collectionTab') showCollection();
}

// 初期ロード
window.addEventListener("load", function(){
  updateReleaseCountdown();
  showDailyCard();
  showAllCards();
  showCollection();
});

// --------------------- カード表示 ---------------------
function showAllCards(){
  const container = document.getElementById("cardListAll");
  if(!cards || cards.length === 0){
    container.textContent = "カードデータがありません";
    return;
  }
  container.innerHTML = cards.map(c => `
    <div class="cardAll">
      <img src="${c.img}" alt="${c.name}"><br>
      ${c.name}<br>
      ID:${c.id}
    </div>
  `).join('');
}

function showCollection(){
  const container = document.getElementById("collectionList");
  if(!cards || cards.length===0){
    container.textContent = "カードデータがありません";
    return;
  }

  const ownership = document.getElementById("ownershipFilter")?.value || "all";

  container.innerHTML = cards
    .filter(card => {
      const count = parseInt(localStorage.getItem("cardCount_" + card.id) || 0);
      if(ownership === "owned") return count > 0;
      if(ownership === "unowned") return count === 0;
      return true; // all
    })
    .map(card => {
      const count = localStorage.getItem("cardCount_" + card.id) || 0;

      let bgStyle = '#eee';
      let nameColor = '#000';
      
      if(memberColors[card.name]){
        const colors = memberColors[card.name];
        bgStyle = colors[0];
        nameColor = (colors[0] === colors[1]) ? '#fff' : colors[1];
      } else {
        for(const member in memberColors){
          if(card.name.includes(member)){
            const colors = memberColors[member];
            bgStyle = colors[0];
            nameColor = (colors[0] === colors[1]) ? '#fff' : colors[1];
            break;
          }
        }
      }

      return `
<div class="cardAll" style="
  display:flex; 
  flex-direction:column; 
  align-items:center; 
  margin:2px; 
  background:${bgStyle}; 
  padding:18px; 
  border-radius:10px;
">
  <img src="${card.img}" alt="${card.name}" style="width:110px; height:152px; border-radius:5px;">
  <div style="
    text-align:center; 
    font-size:20px; 
    margin-top:3px; 
    color:${nameColor};
  ">
    ${card.name}
  </div>
  <input type="number" min="0" value="${count}" style="width:20px; text-align:center;"
    onchange="updateCardCount('${card.id}', this.value)">
</div>
      `;
    }).join('');
}

function updateCardCount(cardId, value){
  const num = Math.max(0, parseInt(value) || 0);
  localStorage.setItem("cardCount_" + cardId, num);
}

// --------------------- デイリーカード ---------------------
function showDailyCard(){
  if(!cards || cards.length===0) return;
  const randomCard = cards[Math.floor(Math.random()*cards.length)];
  const container = document.getElementById("dailyCard");
  container.innerHTML = `<img src="${randomCard.img}" style="width:240px; display:block; margin:auto;">
                         <div style="text-align:center; margin-top:10px;">${randomCard.name}</div>`;
}
function rerollDailyCard(){ showDailyCard(); }
function showManualCard(){
  const id = document.getElementById("manualCardId").value.trim();
  const card = cards.find(c => c.id === id);
  if(card){
    const container = document.getElementById("dailyCard");
    container.innerHTML = `<img src="${card.img}" style="width:240px; display:block; margin:auto;">
                           <div style="text-align:center; margin-top:10px;">${card.name}</div>`;
  } else { alert("カードIDが見つかりません"); }
}

// --------------------- 発売カウントダウン ---------------------
function updateReleaseCountdown(){
  const releaseDate = new Date("2026-03-20");
  const today = new Date();
  const diff = Math.ceil((releaseDate - today)/(1000*60*60*24));
  document.getElementById("releaseCountdown").textContent = diff > 0 ? `発売まであと${diff}日` : "発売日です！";
}

// --------------------- 検索 ---------------------
function search(){
  const name = document.getElementById("searchBox").value;
  const effect = document.getElementById("effectSearchBox").value;
  const costMin = document.getElementById("costMin").value;
  const costMax = document.getElementById("costMax").value;
  const powerMin = document.getElementById("powerMin").value;
  const powerMax = document.getElementById("powerMax").value;
  const hitMin = document.getElementById("hitMin").value;
  const hitMax = document.getElementById("hitMax").value;
  const typeFilter = document.getElementById("typeFilter").value;
  const colorFilter = document.getElementById("colorFilter").value;
  const generationFilter = document.getElementById("generationFilter").value;
  const subTypeFilter = document.getElementById("subTypeFilter").value;
  const rarityFilter = document.getElementById("rarityFilter").value;
  const result = document.getElementById("result");

  let filtered = cards.filter(c => 
    (!name || c.name.includes(name)) && 
    (!effect || (c.effect && c.effect.includes(effect)))
  );

  if(costMin !== "") filtered = filtered.filter(c => c.cost >= Number(costMin));
  if(costMax !== "") filtered = filtered.filter(c => c.cost <= Number(costMax));
  if(powerMin !== "") filtered = filtered.filter(c => c.power !== null && c.power >= Number(powerMin));
  if(powerMax !== "") filtered = filtered.filter(c => c.power !== null && c.power <= Number(powerMax));
  if(hitMin !== "") filtered = filtered.filter(c => c.hit !== null && c.hit >= Number(hitMin));
  if(hitMax !== "") filtered = filtered.filter(c => c.hit !== null && c.hit <= Number(hitMax));
  if(typeFilter !== "") filtered = filtered.filter(c => c.type === typeFilter);
  if(colorFilter !== "") filtered = filtered.filter(c => c.color === colorFilter);
  if(generationFilter !== "") filtered = filtered.filter(c => c.generation === generationFilter);
  if(rarityFilter !== "") filtered = filtered.filter(c => c.rarity === rarityFilter);

  if(subTypeFilter === "バスター" || subTypeFilter === "ショット") 
    filtered = filtered.filter(c => c.subType && c.subType.includes(subTypeFilter));
  else if(subTypeFilter === "その他") 
    filtered = filtered.filter(c => (!c.subType || (c.subType.indexOf("バスター")===-1 && c.subType.indexOf("ショット")===-1)) && c.type !== "territory");

  if(filtered.length === 0){ result.textContent = "見つかりませんでした"; return; }

  result.innerHTML = filtered.map(card => {
    let colorClass = '';
    if(card.color==='白') colorClass='card-white';
    else if(card.color==='赤') colorClass='card-red';
    else if(card.color==='青') colorClass='card-blue';
    else if(card.color==='黒') colorClass='card-black';

    const imgTag = `<img src="${card.img}" alt="${card.name}" style="width:85px; height:auto; border-radius:5px; margin-right:5px;">`;
    const info = (card.type==='command' || card.type==='territory') 
      ? `コスト:${card.cost} | 効果:${card.effect||'-'} | レアリティ:${card.rarity||'-'} | 期別:${card.generation||'-'} | トリガー:${card.subType ? card.subType.join(",") : '-'}` 
      : `コスト:${card.cost} | 効果:${card.effect||'-'} | パワー:${card.power||'-'} | ヒット:${card.hit||'-'} | レアリティ:${card.rarity||'-'} | 期別:${card.generation||'-'} | トリガー:${card.subType ? card.subType.join(",") : '-'}`;

    return `<div class="${colorClass}" style="display:flex; align-items:center; margin-bottom:5px;">
      ${imgTag}<div>${card.name} | ${info}<br>
      <button onclick="addToDeck('${card.id}')">＋</button>
      <button onclick="removeFromDeck('${card.id}')">－</button></div></div>`;
  }).join('');
}

// --------------------- デッキ操作 ---------------------
let deck = [], territoryCardId = null;

function addToDeck(id){
  const card = cards.find(c => c.id===id);
  if(!card) return;

  if(card.type==='territory'){ territoryCardId = id; updateDeckImages(); updateDeckStatus(); return; }

  const sameSpecCount = deck.filter(d => {
    const c = cards.find(x => x.id===d);
    if(!c) return false;
    return (c.name===card.name && c.type===card.type && c.cost===card.cost && c.power===card.power && c.hit===card.hit && c.color===card.color && JSON.stringify(c.subType||[])===JSON.stringify(card.subType||[]) && c.generation===card.generation);
  }).length;

  if(sameSpecCount >= 4){ alert("同じカードは4枚までです"); return; }
  if(deck.length >= 50){ alert("デッキは50枚までです"); return; }

  deck.push(id);
  updateDeckImages();
  updateDeckStatus();
}

function removeFromDeck(id){
  const index = deck.indexOf(id);
  if(index !== -1) deck.splice(index,1);
  if(territoryCardId === id) territoryCardId = null;
  updateDeckImages();
  updateDeckStatus();
}

function updateDeckImages(){
  const deckDiv = document.getElementById("deckImages");
  deckDiv.innerHTML = "";
  deck.slice(0,50).forEach(cardId => {
    const card = cards.find(c => c.id===cardId);
    if(!card) return;
    const img = document.createElement("img");
    img.src = card.img; img.alt = card.name;
    img.onclick = () => removeFromDeck(card.id);
    deckDiv.appendChild(img);
  });

  // 空欄
  for(let i=deck.length;i<50;i++){
    const ph = document.createElement("div");
    ph.style.width="110px"; ph.style.height="152px";
    deckDiv.appendChild(ph);
  }

  // テリトリー
  const terrDiv = document.getElementById("territoryImage");
  terrDiv.innerHTML = "";
  if(territoryCardId){
    const card = cards.find(c => c.id===territoryCardId);
    if(card){
      const img = document.createElement("img");
      img.src = card.img; img.alt = card.name;
      img.onclick = () => { territoryCardId=null; updateDeckImages(); updateDeckStatus(); };
      terrDiv.appendChild(img);
    }
  }
}

function updateDeckStatus(){
  let unitCount=0, commandCount=0, busterCount=0, shotCount=0;
  deck.forEach(id => {
    const card = cards.find(c => c.id===id);
    if(!card) return;
    if(card.type?.includes("unit")) unitCount++;
    if(card.type==="command") commandCount++;
    if(card.subType?.includes("バスター")) busterCount++;
    if(card.subType?.includes("ショット")) shotCount++;
  });
  const territory = territoryCardId ? "あり" : "なし";
  document.getElementById("deckStatus").innerHTML = `ユニット：${unitCount}枚<br>
    コマンド：${commandCount}枚<br>
    バスター：${busterCount}枚<br>
    ショット：${shotCount}枚<br>
    テリトリー：${territory}`;
}
