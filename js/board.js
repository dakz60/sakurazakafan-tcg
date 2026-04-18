function getBoardSearchTerms(prefix) {
  return [1, 2, 3]
    .map((index) => document.getElementById(`${prefix}${index}`)?.value || "")
    .map((term) => term.trim())
    .filter(Boolean);
}

function formatBoardEntryList(entries) {
  return entries.map((entry) => formatCardEntry(entry));
}

function boardEntryMatches(entries, terms) {
  if (terms.length === 0) return true;

  const normalizedEntries = formatBoardEntryList(entries).map((entry) => normalizeSearchText(entry));
  return terms.some((term) => {
    const normalizedTerm = normalizeSearchText(term);
    return normalizedEntries.some((entry) => entry.includes(normalizedTerm));
  });
}

function boardListMatchesSelection(values, selectedValues) {
  if (selectedValues.length === 0) return true;
  return selectedValues.some((value) => values.includes(value));
}

function renderBoardPost(post) {
  const give = formatBoardEntryList(post.give || []).join("、") || "なし";
  const want = formatBoardEntryList(post.want || []).join("、") || "なし";
  const method = (post.method || []).join("、") || "なし";
  const place = (post.place || []).join("、") || "なし";
  const oshi = (post.oshi || []).join("、") || "なし";

  return `
    <div class="board-post">
      <div><b>譲：</b>${give}</div>
      <div><b>求：</b>${want}</div>
      <div><b>方法：</b>${method}</div>
      <div><b>場所：</b>${place}</div>
      <div><b>推し：</b>${oshi}</div>
    </div>
  `;
}

function showBoard() {
  const container = document.getElementById("boardList");
  if (!container) return;

  const giveTerms = getBoardSearchTerms("boardGiveSearch");
  const wantTerms = getBoardSearchTerms("boardWantSearch");
  const selectedPlaces = getCheckedValues("boardPlace");
  const selectedMethods = getCheckedValues("boardMethod");

  const filtered = (boardPosts || []).filter((post) => {
    if (!boardEntryMatches(post.give || [], giveTerms)) return false;
    if (!boardEntryMatches(post.want || [], wantTerms)) return false;
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
