// ============================================================
// GameFlix - Home Page Logic
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  loadTrending();
  loadNewReleases();
  loadRecommended();
});

async function loadSection(url, containerId, skeletonCount = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = buildSkeletons(skeletonCount);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    const games = data.results || [];
    if (!games.length) {
      container.innerHTML = `<p class="text-gray-500 py-4 px-2">No games found.</p>`;
      return;
    }
    container.innerHTML = games.map(g => buildGameCard(g)).join("");
  } catch (err) {
    console.error(`Failed to load ${containerId}:`, err);
    container.innerHTML = `
      <div class="flex items-center gap-3 text-gray-500 py-4 px-2">
        <span class="material-symbols-outlined text-2xl">error_outline</span>
        <span class="text-sm">Failed to load. <button onclick="location.reload()" class="underline hover:text-white">Retry</button></span>
      </div>`;
  }
}

function loadTrending() { loadSection("/api/games/trending", "trending-row", 6); }
function loadNewReleases() { loadSection("/api/games/new", "new-row", 6); }
function loadRecommended() { loadSection("/api/recommend", "recommended-row", 5); }
