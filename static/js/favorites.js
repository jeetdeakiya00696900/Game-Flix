// ============================================================
// GameFlix - Favorites Page Logic
// ============================================================

let currentSort = "date";

function renderFavorites() {
  let favs = Favorites.getAll();
  const count = favs.length;
  document.getElementById("fav-count").textContent = count;
  document.getElementById("clear-all-btn").classList.toggle("hidden", count === 0);

  if (!count) {
    document.getElementById("fav-grid").innerHTML = "";
    document.getElementById("empty-state").classList.remove("hidden");
    document.getElementById("empty-state").classList.add("flex");
    return;
  }

  document.getElementById("empty-state").classList.add("hidden");
  document.getElementById("empty-state").classList.remove("flex");

  // Sort
  switch (currentSort) {
    case "name":
      favs.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      break;
    case "rating":
      favs.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "release":
      favs.sort((a, b) => (b.first_release_date || 0) - (a.first_release_date || 0));
      break;
    default: // date
      favs.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  }

  document.getElementById("fav-grid").innerHTML = favs.map(game => {
    const title = escapeHtml(game.title || "Unknown");
    const cover = game.cover || "/static/images/placeholder.png";
    const genres = (game.genres || []).slice(0, 2).join(", ");
    const rating = game.rating ? parseFloat(game.rating).toFixed(1) : null;
    const encodedTitle = encodeURIComponent(game.title || "");

    return `
      <div class="game-card group relative" data-title="${escapeHtml(game.title || "")}">
        <a href="/game?name=${encodedTitle}" class="block w-full h-full">
          <img src="${escapeHtml(cover)}" alt="${title}" loading="lazy"
               onerror="this.src='/static/images/placeholder.png'"/>
          <div class="card-overlay"></div>
          ${rating ? `
            <div class="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-bold text-yellow-400 backdrop-blur-sm">
              <span class="material-symbols-outlined" style="font-size:12px">star</span>
              ${rating}
            </div>` : ""}
          <div class="card-info">
            <h4 class="font-bold text-white text-sm truncate leading-tight">${title}</h4>
            ${genres ? `<p class="text-xs text-gray-400 truncate mt-0.5">${escapeHtml(genres)}</p>` : ""}
          </div>
        </a>
        <!-- Remove button -->
        <button class="remove-fav-btn absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-gray-400 hover:text-red-400 hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100"
                data-title="${escapeHtml(game.title || "")}" title="Remove from favorites">
          <span class="material-symbols-outlined" style="font-size:16px">close</span>
        </button>
      </div>
    `;
  }).join("");

  // Attach remove listeners
  document.querySelectorAll(".remove-fav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const title = btn.dataset.title;
      Favorites.remove(title);
      showToast(`Removed "${title}" from Favorites`, "info");
      renderFavorites();
    });
  });
}

// Sort toggle
document.getElementById("sort-btn").addEventListener("click", () => {
  document.getElementById("sort-menu").classList.toggle("hidden");
});

document.querySelectorAll(".sort-opt").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sort-opt").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentSort = btn.dataset.sort;
    renderFavorites();
  });
});

// Clear all
document.getElementById("clear-all-btn").addEventListener("click", () => {
  if (confirm("Remove all games from your favorites?")) {
    Favorites.save([]);
    showToast("Favorites cleared", "info");
    renderFavorites();
  }
});

// Initial render
renderFavorites();
