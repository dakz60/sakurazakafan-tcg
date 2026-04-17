function showBoard(){

  const giveSearch = document.getElementById("boardGiveSearch")?.value || "";
  const wantSearch = document.getElementById("boardWantSearch")?.value || "";

  const placeChecked = [...document.querySelectorAll('input[name="boardPlace"]:checked')].map(el => el.value);
  const oshiChecked  = [...document.querySelectorAll('input[name="boardOshi"]:checked')].map(el => el.value);
  const methodChecked = [...document.querySelectorAll('input[name="boardMethod"]:checked')].map(el => el.value);

  const container = document.getElementById("boardList");
  if(!container) return;

  let list = boardPosts || [];

  // ---- フィルタ（checkbox対応） ----
  if(placeChecked.length){
    list = list.filter(p =>
      placeChecked.some(v => p.place?.includes(v))
    );
  }

  if(oshiChecked.length){
    list = list.filter(p =>
      oshiChecked.some(v => p.oshi?.includes(v))
    );
  }

  if(methodChecked.length){
    list = list.filter(p =>
      methodChecked.some(v => p.method?.includes(v))
    );
  }

  // ---- 譲・求検索 ----
  if(giveSearch){
    list = list.filter(p => p.give?.includes(giveSearch));
  }

  if(wantSearch){
    list = list.filter(p => p.want?.includes(wantSearch));
  }

  // ---- 表示 ----
  if(list.length === 0){
    container.innerHTML = "投稿がありません";
    return;
  }

  container.innerHTML = list.map(p => `
    <div style="border:1px solid #ccc; padding:10px; margin:10px; border-radius:10px;">
      <div><b>譲：</b>${p.give}</div>
      <div><b>求：</b>${p.want}</div>
      <div><b>方法：</b>${(p.method || []).join("、")}</div>
      <div><b>場所：</b>${(p.place || []).join("、")}</div>
      <div><b>推し：</b>${(p.oshi || []).join("、")}</div>
    </div>
  `).join('');
}
