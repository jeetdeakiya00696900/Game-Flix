// ============================================================
// GameFlix - Game Details Page Logic
// ============================================================

(async function () {
  const params = new URLSearchParams(location.search);
  const gameName = params.get("name");

  if (!gameName) { showError(); return; }

  try {
    const res = await fetch(`/api/game-by-name?name=${encodeURIComponent(gameName)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const game = await res.json();
    if (game.error) throw new Error(game.error);
    renderGame(game);
  } catch (err) {
    console.error("Game details error:", err);
    showError();
  }
})();

function showError() {
  document.getElementById("page-loading").classList.add("hidden");
  document.getElementById("page-error").classList.remove("hidden");
  document.getElementById("page-error").classList.add("flex");
}

function showContent() {
  document.getElementById("page-loading").classList.add("hidden");
  document.getElementById("page-content").classList.remove("hidden");
}

function renderGame(game) {
  // Hero backdrop
  if (game.cover?.image_id) {
    const hero = document.getElementById("hero-section");
    hero.style.backgroundImage = `url(https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover.image_id}.jpg)`;
  }

  // Cover art
  if (game.cover?.image_id) {
    document.getElementById("cover-art").src =
      `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${game.cover.image_id}.jpg`;
  }

  // Title
  const title = game.name || "Unknown Game";
  document.getElementById("game-title").textContent = title;
  document.getElementById("breadcrumb-title").textContent = title;
  document.title = `${title} — GameFlix`;

  // Rating
  if (game.total_rating) {
    const ratingBadge = document.getElementById("rating-badge");
    document.getElementById("rating-val").textContent = `${parseFloat(game.total_rating).toFixed(1)} / 100`;
    ratingBadge.classList.remove("hidden");
    ratingBadge.classList.add("flex");
  }

  // Release date
  if (game.first_release_date) {
    const badge = document.getElementById("release-badge");
    badge.textContent = `Released ${formatDate(game.first_release_date)}`;
    badge.classList.remove("hidden");
  }

  // Genres
  const genresWrap = document.getElementById("genres-wrap");
  const genres = game.genres || [];
  genresWrap.innerHTML = genres.map(g => {
    const label = typeof g === "string" ? g : g.name;
    return `<span class="badge badge-genre">${escapeHtml(label)}</span>`;
  }).join("");

  // Platforms
  if (game.platforms?.length) {
    document.getElementById("platforms-text").textContent =
      "Available on: " + game.platforms.map(p => p.name).join(" · ");
  }

  // Summary
  document.getElementById("summary-text").textContent =
    game.summary || "No summary available for this game.";

  // Favorites button
  const favBtn = document.getElementById("fav-btn");
  const gameObj = {
    title: game.name,
    cover: game.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : null,
    genres: genres.map(g => typeof g === "string" ? g : g.name),
    rating: game.total_rating,
    first_release_date: game.first_release_date
  };
  if (Favorites.has(game.name)) favBtn.classList.add("active");
  favBtn.addEventListener("click", () => {
    const added = Favorites.toggle(gameObj);
    favBtn.classList.toggle("active", added);
    showToast(added ? `Added "${game.name}" to Favorites` : `Removed from Favorites`, added ? "success" : "info");
  });

  // Screenshots
  if (game.screenshots?.length) {
    const section = document.getElementById("screenshots-section");
    const row = document.getElementById("screenshots-row");
    section.classList.remove("hidden");
    row.innerHTML = game.screenshots.slice(0, 8).map(sc => `
      <img src="https://images.igdb.com/igdb/image/upload/t_screenshot_big/${sc.image_id}.jpg"
           class="h-40 sm:h-52 rounded-xl object-cover shrink-0 cursor-zoom-in hover:opacity-90 transition-opacity"
           loading="lazy"
           onerror="this.remove()"
           alt="Screenshot"/>
    `).join("");
  }

  // Videos
  if (game.videos?.length) {
    const section = document.getElementById("videos-section");
    const grid = document.getElementById("videos-grid");
    section.classList.remove("hidden");
    grid.innerHTML = game.videos.slice(0, 4).map(v => `
      <div class="rounded-xl overflow-hidden aspect-video">
        <iframe class="w-full h-full"
          src="https://www.youtube.com/embed/${escapeHtml(v.video_id)}"
          title="Trailer" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen loading="lazy">
        </iframe>
      </div>
    `).join("");
  }

  // Similar games
  if (game.similar_games?.length) {
    const section = document.getElementById("similar-section");
    const row = document.getElementById("similar-row");
    section.classList.remove("hidden");
    row.innerHTML = game.similar_games
      .filter(s => s.cover)
      .slice(0, 10)
      .map(s => buildGameCard({
        title: s.name,
        cover: `https://images.igdb.com/igdb/image/upload/t_cover_big/${s.cover.image_id}.jpg`,
        genres: [],
        rating: null
      }))
      .join("");
  }

  showContent();
}
