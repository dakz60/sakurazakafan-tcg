function showBoard(){

  const giveSearch = document.getElementById("boardGiveSearch")?.value || "";
  const wantSearch = document.getElementById("boardWantSearch")?.value || "";

  const place = document.getElementById("boardPlace")?.value || "";
  const oshi = document.getElementById("boardOshi")?.value || "";
  const method = document.getElementById("boardMethod")?.value || "";

  const container = document.getElementById("boardList");
  if(!container) return;

  let list = boardPosts;

  // フィルタ（通常）
  if(place) list = list.filter(p => p.place.includes(place));
  if(oshi) list = list.filter(p => p.oshi.includes(oshi));
  if(method) list = list.filter(p => p.method.includes(method));

  // 🔥譲・求 分離検索
  if(giveSearch){
    list = list.filter(p => p.give.includes(giveSearch));
  }

  if(wantSearch){
    list = list.filter(p => p.want.includes(wantSearch));
  }

  // 結果
  if(list.length === 0){
    container.innerHTML = "投稿がありません";
    return;
  }

  container.innerHTML = list.map(p => `
    <div style="border:1px solid #ccc; padding:10px; margin:10px; border-radius:10px;">
      <div><b>譲：</b>${p.give}</div>
      <div><b>求：</b>${p.want}</div>
      <div><b>方法：</b>${p.method}</div>
      <div><b>場所：</b>${p.place}</div>
      <div><b>推し：</b>${p.oshi}</div>
    </div>
  `).join('');
}
