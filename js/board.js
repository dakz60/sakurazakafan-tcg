// ==================== 共通：チェック取得 ====================
function getCheckedList(name){
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
    .map(el => el.value);
}

// ==================== ローカルデータ ====================
function getBoardData(){
  return JSON.parse(localStorage.getItem("boardPosts") || "[]");
}

function saveBoardData(list){
  localStorage.setItem("boardPosts", JSON.stringify(list));
}

// ==================== 投稿追加 ====================
function addBoardPost(){
  const input = document.getElementById("boardInput");
  if(!input) return;

  const text = input.value.trim();

  if(!text){
    alert("コピペを貼ってください");
    return;
  }

  const list = getBoardData();

  list.unshift({
    id: Date.now(),
    text: text,
    time: Date.now()
  });

  saveBoardData(list);

  input.value = "";
  showBoard();
}

// ==================== 表示＋フィルタ ====================
function showBoard(){

  const container = document.getElementById("boardList");
  if(!container) return;

  let list = getBoardData();

  const giveSearch = document.getElementById("boardGiveSearch")?.value || "";
  const wantSearch = document.getElementById("boardWantSearch")?.value || "";

  const places = getCheckedList("boardPlace");
  const methods = getCheckedList("boardMethod");

  // フィルタ（安全順）
  if(giveSearch){
    list = list.filter(p => p.text.includes(giveSearch));
  }

  if(wantSearch){
    list = list.filter(p => p.text.includes(wantSearch));
  }

  if(places.length){
    list = list.filter(p =>
      places.some(v => p.text.includes(v))
    );
  }

  if(methods.length){
    list = list.filter(p =>
      methods.some(v => p.text.includes(v))
    );
  }

  // 表示
  if(list.length === 0){
    container.innerHTML = "<div>投稿がありません</div>";
    return;
  }

  container.innerHTML = list.map(p => `
    <div style="
      border:1px solid #ccc;
      padding:10px;
      margin:10px;
      border-radius:10px;
      white-space:pre-wrap;
      background:#fff;
    ">
      ${escapeHtml(p.text)}
    </div>
  `).join('');
}

// ==================== HTMLエスケープ（地味に重要） ====================
function escapeHtml(str){
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ==================== リアルタイム反映（任意） ====================
document.addEventListener("input", (e) => {
  if(
    e.target.id === "boardGiveSearch" ||
    e.target.id === "boardWantSearch" ||
    e.target.name === "boardPlace" ||
    e.target.name === "boardMethod"
  ){
    showBoard();
  }
});

// ==================== 初期表示 ====================
window.addEventListener("load", () => {
  showBoard();
});
