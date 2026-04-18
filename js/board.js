function getBoardSearchTerms(prefix) {
  return [1, 2, 3]
    .map((index) => document.getElementById(`${prefix}${index}`)?.value || "")
    .map((term) => term.trim())
    .filter(Boolean);
}

function formatBoardEntryList(entries) {
  return entries.map((entry) => formatCardEntry(entry));
}

function entryContainsRarity(entryText, rarity) {
  const { id } = parseCardEntry(entryText);
  const card = findCardById(id);
  return card ? card.rarity === rarity : false;
}

function boardEntryMatchesRarity(entries, rarity) {
  if (!rarity) return true;
  return entries.some((entry) => entryContainsRarity(entry, rarity));
}

function boardEntryMatches(entries, terms) {
  if (terms.length === 0) return true;

  const method = (post.method || []).join("、") || "なし";
  const place = (post.place || []).join("、") || "なし";
  const oshi = (post.oshi || []).join("、") || "なし";
  const twitterLink = post.twitterUrl
    ? `<div><b>X：</b><a href="${post.twitterUrl}" target="_blank" rel="noopener noreferrer">投稿を見る</a></div>`
    : "";

  return `
    <div class="board-post">
      <div><b>方法：</b>${method}</div>
      <div><b>場所：</b>${place}</div>
      <div><b>推し：</b>${oshi}</div>
      ${twitterLink}
    </div>
  `;
}
  const container = document.getElementById("boardList");
  if (!container) return;

  const giveTerms = getBoardSearchTerms("boardGiveSearch");
  const wantTerms = getBoardSearchTerms("boardWantSearch");
  const giveTerms = getBoardSearchTerms("boardGiveSearch").slice(0, 2);
  const wantTerms = getBoardSearchTerms("boardWantSearch").slice(0, 2);
  const giveRarity = document.getElementById("boardGiveSearch3")?.value || "";
  const wantRarity = document.getElementById("boardWantSearch3")?.value || "";
  const selectedPlaces = getCheckedValues("boardPlace");
  const selectedMethods = getCheckedValues("boardMethod");

  const filtered = (boardPosts || []).filter((post) => {
    if (!boardEntryMatches(post.give || [], giveTerms)) return false;
    if (!boardEntryMatches(post.want || [], wantTerms)) return false;
    if (!boardEntryMatchesRarity(post.give || [], giveRarity)) return false;
    if (!boardEntryMatchesRarity(post.want || [], wantRarity)) return false;
    if (!boardListMatchesSelection(post.place || [], selectedPlaces)) return false;
    if (!boardListMatchesSelection(post.method || [], selectedMethods)) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = "投稿がありません";
    return;
  }

  container.innerHTML = filtered.map(renderBoardPost).join("");
}

function resetBoardFilters() {
  [1, 2, 3].forEach((index) => {
    const giveInput = document.getElementById(`boardGiveSearch${index}`);
    const wantInput = document.getElementById(`boardWantSearch${index}`);
    if (giveInput) giveInput.value = "";
    if (wantInput) wantInput.value = "";
  });

  document.querySelectorAll('input[name="boardPlace"], input[name="boardMethod"]').forEach((input) => {
    input.checked = false;
  });

  showBoard();
}

window.addEventListener("load", () => {
  showBoard();
});
