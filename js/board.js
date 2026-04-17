function getCheckedList(name){
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
    .map(el => el.value);
}

function showBoard(){

  const giveSearch = document.getElementById("boardGiveSearch")?.value || "";
  const wantSearch = document.getElementById("boardWantSearch")?.value || "";

  const places = getCheckedList("boardPlace");
  const methods = getCheckedList("boardMethod");
  const oshis = getCheckedList("boardOshi");

  const container = document.getElementById("boardList");
  if(!container) return;

  let list = JSON.parse(localStorage.getItem("boardPosts") || "[]");

  // テキスト検索
  if(giveSearch){
    list = list.filter(p => p.text.includes(giveSearch));
  }

  if(wantSearch){
    list = list.filter(p => p.text.includes(wantSearch));
  }

  // チェック系（全部 or 部分一致）
  if(places.length > 0){
    list = list.filter(p =>
      places.some(v => p.text.includes(v))
    );
  }

  if(methods.length > 0){
    list = list.filter(p =>
      methods.some(v => p.text.includes(v))
    );
  }

  if(oshis.length > 0){
    list = list.filter(p =>
      oshis.some(v => p.text.includes(v))
    );
  }

  // 出力
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
    ">
      ${p.text}
    </div>
  `).join('');
}
