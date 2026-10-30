// ============================================================
// GameFlix - Search Page Logic
// ============================================================

const searchInput = document.getElementById("search-input");
const clearBtn = document.getElementById("clear-btn");
const resultsTitle = document.getElementById("results-title");
const resultsCount = document.getElementById("results-count");

const stateDefault  = document.getElementById("state-default");
const stateLoading  = document.getElementById("state-loading");
const stateEmpty    = document.getElementById("state-empty");
const stateError    = document.getElementById("state-error");
const resultsGrid   = document.getElementById("results-grid");

let lastQuery = "";

// States
function showState(state) {
  [stateDefault, stateLoading, stateEmpty, stateError, resultsGrid].forEach(el => el.classList.add("hidden"));
  if (state) state.classList.remove("hidden");
}

// Search
async function performSearch(q) {
  q = q.trim();
  if (!q || q.length < 2) { showState(stateDefault); resultsTitle.textContent = ""; resultsCount.textContent = ""; return; }
  lastQuery = q;
  showState(stateLoading);
  stateLoading.innerHTML = buildSkeletons(12);
  resultsTitle.textContent = `Searching for "${q}"…`;
  resultsCount.textContent = "";

  try {
    const res = await fetch(`/api/search_game?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    const games = data.results || [];

    if (!games.length) {
      showState(stateEmpty);
      document.getElementById("no-results-msg").textContent = `No results found for "${q}". Try a different search.`;
      resultsTitle.textContent = "";
      resultsCount.textContent = "";
      return;
    }

    resultsGrid.innerHTML = games.map(g => buildGameCard(g)).join("");
    resultsTitle.textContent = `Results for "${q}"`;
    resultsCount.textContent = `${games.length} games found`;
    showState(resultsGrid);
  } catch (err) {
    console.error("Search error:", err);
    showState(stateError);
    resultsTitle.textContent = "";
  }
}

function retrySearch() { performSearch(lastQuery); }

// Debounced input
const debouncedSearch = debounce(performSearch, 380);

searchInput.addEventListener("input", () => {
  const v = searchInput.value;
  clearBtn.classList.toggle("hidden", !v);
  debouncedSearch(v);
});

searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") performSearch(searchInput.value);
  if (e.key === "Escape") { searchInput.value = ""; clearBtn.classList.add("hidden"); showState(stateDefault); }
});

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearBtn.classList.add("hidden");
  showState(stateDefault);
  resultsTitle.textContent = "";
  resultsCount.textContent = "";
  searchInput.focus();
});

// Quick tags
document.querySelectorAll(".quick-tag").forEach(btn => {
  btn.addEventListener("click", () => {
    const q = btn.dataset.q;
    searchInput.value = q;
    clearBtn.classList.remove("hidden");
    performSearch(q);
  });
});

// URL param (from external links)
const urlQ = new URLSearchParams(location.search).get("q");
if (urlQ) { searchInput.value = urlQ; clearBtn.classList.remove("hidden"); performSearch(urlQ); }
