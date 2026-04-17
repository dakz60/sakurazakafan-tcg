// ==================== チェック取得 ====================
function getCheckedList(name){
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
    .map(el => el.value);
}

// ==================== 投稿追加 ====================
function addBoardPost(){
  const input = document.getElementById("boardInput");
  const text = input.value.trim();

  if(!text){
    alert("コピペを貼ってください");
    return;
  }

  let list = JSON.parse(localStorage.getItem("boardPosts") || "[]");

  list.unshift({
    text: text,
    time: Date.now()
  });

  localStorage.setItem("boardPosts", JSON.stringify(list));

  input.value = "";
  showBoard();
}

// ==================== 表示＋フィルタ ====================
function showBoard(){

  const giveSearch = document.getElementById("boardGiveSearch")?.value || "";
  const wantSearch = document.getElementById("boardWantSearch")?.value || "";

  const places = getCheckedList("boardPlace");
  const methods = getCheckedList("boardMethod");

  const container = document.getElementById("boardList");
  if(!container) return;

  let list = JSON.parse(localStorage.getItem("boardPosts") || "[]");

  // フィルタ
  if(giveSearch) list = list.filter(p => p.text.includes(giveSearch));
  if(wantSearch) list = list.filter(p => p.text.includes(wantSearch));

  if(places.length) {
    list = list.filter(p => places.some(v => p.text.includes(v)));
  }

  if(methods.length) {
    list = list.filter(p => methods.some(v => p.text.includes(v)));
  }

  // 表示
  if(list.length === 0){
    container.innerHTML = "投稿がありません";
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
      ${p.text}
    </div>
  `).join('');
}

// ==================== 初期表示 ====================
window.addEventListener("load", showBoard);
