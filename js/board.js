// ==================== チェック取得 ====================
function getCheckedList(name){
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
    .map(el => el.value);
}

// ==================== 投稿追加（コピペ保存） ====================
function addBoardPost(){
  const text = document.getElementById("boardInput")?.value.trim();

  if(!text){
    alert("投稿を入力してください");
    return;
  }

  let list = JSON.parse(localStorage.getItem("boardPosts") || "[]");

  list.unshift({
    text: text,
    time: Date.now()
  });

  localStorage.setItem("boardPosts", JSON.stringify(list));

  document.getElementById("boardInput").value = "";

  showBoard();
}

// ==================== 掲示板表示 ====================
function showBoard(){

  const giveSearch = document.getElementById("boardGiveSearch")?.value || "";
  const wantSearch = document.getElementById("boardWantSearch")?.value || "";

  const places = getCheckedList("boardPlace");
  const methods = getCheckedList("boardMethod");
  const oshis = getCheckedList("boardOshi");

  const container = document.getElementById("boardList");
  if(!container) return;

  let list = JSON.parse(localStorage.getItem("boardPosts") || "[]");

  // 譲・求（テキスト検索）
  if(giveSearch){
    list = list.filter(p => p.text.includes(giveSearch));
  }

  if(wantSearch){
    list = list.filter(p => p.text.includes(wantSearch));
  }

  // 場所フィルタ
  if(places.length > 0){
    list = list.filter(p =>
      places.some(v => p.text.includes(v))
    );
  }

  // 方法フィルタ
  if(methods.length > 0){
    list = list.filter(p =>
      methods.some(v => p.text.includes(v))
    );
  }

  // メンバーフィルタ
  if(oshis.length > 0){
    list = list.filter(p =>
      oshis.some(v => p.text.includes(v))
    );
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
window.addEventListener("load", () => {
  showBoard();
});
