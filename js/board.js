function showBoard(){

  const container = document.getElementById("boardList");
  if(!container) return;

  let list = JSON.parse(localStorage.getItem("boardPosts") || "[]");

  if(list.length === 0){
    container.innerHTML = "投稿がありません";
    return;
  }

  container.innerHTML = list.map(p => `
    <div style="border:1px solid #ccc; padding:10px; margin:10px; border-radius:10px; white-space:pre-wrap;">
      ${p.text}
    </div>
  `).join('');
}
