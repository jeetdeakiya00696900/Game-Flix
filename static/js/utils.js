// ============================================================
// GameFlix Shared Utilities
// ============================================================

/**
 * Safely escape HTML special characters.
 */
function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[&<>"'`=/]/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;", "/": "&#x2F;",
    "`": "&#x60;", "=": "&#x3D;"
  }[c]));
}

/**
 * Format a Unix timestamp (seconds) to a human-readable date string.
 */
function formatDate(unixTs) {
  if (!unixTs) return "Unknown";
  return new Date(unixTs * 1000).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  });
}

/**
 * Format a rating (0-100) to display string with star.
 */
function formatRating(rating) {
  if (!rating) return null;
  return parseFloat(rating).toFixed(1);
}

/**
 * Build an IGDB cover image URL.
 */
function igdbCoverUrl(imageId, size = "t_cover_big") {
  if (!imageId) return "/static/images/placeholder.png";
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
}

/**
 * Build a game card HTML string for the horizontal scroll rows.
 * @param {Object} game - normalized game object {id, title, cover, genres, rating}
 * @param {string} [targetUrl] - URL to navigate to on click
 */
function buildGameCard(game, targetUrl) {
  const title = escapeHtml(game.title || game.name || "Untitled");
  const cover = game.cover || "/static/images/placeholder.png";
  const genre = (game.genres || []).slice(0, 2).join(", ");
  const rating = formatRating(game.rating);
  const encodedTitle = encodeURIComponent(game.title || game.name || "");
  const url = targetUrl || `/game?name=${encodedTitle}`;

  return `
    <a href="${url}" class="game-card group" title="${title}">
      <img src="${escapeHtml(cover)}" alt="${title}"
           loading="lazy"
           onerror="this.src='/static/images/placeholder.png'"/>
      <div class="card-overlay"></div>
      ${rating ? `
        <div class="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-bold text-yellow-400 backdrop-blur-sm">
          <span class="material-symbols-outlined text-xs" style="font-size:12px">star</span>
          ${rating}
        </div>` : ""}
      <div class="card-info">
        <h4 class="font-bold text-white text-sm truncate leading-tight">${title}</h4>
        ${genre ? `<p class="text-xs text-gray-400 truncate mt-0.5">${escapeHtml(genre)}</p>` : ""}
      </div>
    </a>
  `;
}

/**
 * Build a row of skeleton loading placeholders.
 */
function buildSkeletons(count = 6) {
  return Array(count).fill(
    `<div class="skeleton aspect-[3/4] w-44 sm:w-48 shrink-0 rounded-xl"></div>`
  ).join("");
}

/**
 * LocalStorage-based favorites management.
 */
const Favorites = {
  KEY: "gameflix_favorites",
  getAll() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },
  save(list) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },
  has(title) {
    return this.getAll().some(g => g.title === title);
  },
  add(game) {
    const list = this.getAll();
    if (!this.has(game.title)) {
      list.unshift({ ...game, addedAt: Date.now() });
      this.save(list);
      return true;
    }
    return false;
  },
  remove(title) {
    const list = this.getAll().filter(g => g.title !== title);
    this.save(list);
  },
  toggle(game) {
    if (this.has(game.title)) { this.remove(game.title); return false; }
    else { this.add(game); return true; }
  }
};

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const icons = { success: "check_circle", error: "error", info: "info" };
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-lg" style="font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24">${icons[type] || "info"}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3100);
}

/**
 * Debounce a function.
 */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
