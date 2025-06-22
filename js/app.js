// app.js - Handles game data fetching, rendering, and interactions for JNR Games Store

// --- Global State and Configuration ---
let allGames = []; // To store all game data from games.json
let currentGameData = null; // To store data of the game being viewed on detail page
const ITEMS_PER_PAGE_AVAILABLE = 12; // Number of games per page on available-games.html
const ITEMS_PER_PAGE_HOME_SECTIONS = 4; // Max items for featured/multiplayer on home
const TRENDING_GAMES_COUNT = 8; // Number of games in the trending carousel
const RELATED_GAMES_COUNT = 4; // Number of related games on detail page

// --- DOMContentLoaded Event Listener ---
// Waits for the HTML document to be fully loaded before running JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");
    fetchGamesData(); // Fetch game data first
    initLiveSearch(); // Initialize live search for all pages
    // Other common UI initializations (like back-to-top, navbar scroll) are in game-store-script.js
});

// --- Data Fetching ---
// Fetches game data from games.json
async function fetchGamesData() {
    console.log("Attempting to fetch games.json...");
    try {
        // IMPORTANT: Ensure '/games.json' is the correct path from your HTML files to the JSON file.
        const response = await fetch('/games.json');
        console.log("Fetch response status:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, trying to fetch /games.json`);
        }
        allGames = await response.json();
        console.log("Games data fetched successfully. Number of games:", allGames.length);

        if (!Array.isArray(allGames)) {
            console.error("Games data is not an array. Check games.json format.", allGames);
            allGames = [];
            throw new Error("Games data is not in the expected array format.");
        }
        // Once games are fetched, initialize page-specific content
        initializePageContent();
    } catch (error) {
        console.error("Could not fetch or process games data:", error);
        const allGamesGrid = document.getElementById('all-games-grid');
        if (allGamesGrid) {
            allGamesGrid.innerHTML = '<p class="text-center text-red-500">Failed to load games. Please check the console for errors and verify games.json path and format.</p>';
        }
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            heroSlider.innerHTML = '<p class="text-center text-red-500">Failed to load hero games. Please check the console.</p>';
        }
        hidePageLoader(); // Attempt to hide loader even if there's an error loading main content
    }
}

// --- Page Initialization Router ---
// Determines which page is currently active and calls its initialization function
function initializePageContent() {
    console.log("Initializing page content. Total games loaded:", allGames.length);
    if (!allGames || allGames.length === 0) {
        console.warn("No game data available to initialize page content.");
        // Display a message on the available games page if no games are loaded
        const gamesGrid = document.getElementById('all-games-grid');
        if (gamesGrid && document.querySelector('body#available-games-page')) {
            gamesGrid.innerHTML = '<p class="no-games-found">No games data loaded. Please check games.json and console.</p>';
        }
        hidePageLoader(); // Hide loader if no game data to show
        return;
    }
    updateTotalGamesCounter();

    // Check for unique elements on each page to determine which page is active
    if (document.querySelector('body#home-page')) { // Check body ID first
        console.log("Detected Home Page.");
        if (document.querySelector('.hero-slider') && document.getElementById('featured-games-grid')) {
            initHomePage();
        } else {
            console.warn("Home page specific elements (.hero-slider or #featured-games-grid) not found, though body ID is 'home-page'.");
        }
    } else if (document.querySelector('body#available-games-page')) {
        console.log("Detected Available Games Page.");
        if (document.getElementById('all-games-grid')) {
            initAvailableGamesPage();
        } else {
            console.warn("#all-games-grid not found on available-games-page.");
        }
    } else if (document.querySelector('body#game-detail-page')) {
        console.log("Detected Game Detail Page.");
        if (document.querySelector('.game-detail-hero')) {
            initGameDetailPage();
        } else {
            console.warn(".game-detail-hero not found on game-detail-page.");
        }
    } else {
        console.log("No specific page type detected by body ID for app.js initialization. Loader will be hidden.");
    }
    hidePageLoader(); // Hide the loader after content for the specific page is initialized
}

// --- Loader Hiding Function ---
/**
 * Hides the main page loader.
 * This function assumes the loader has a class 'loader-wrapper' as per game-store-script.js.
 */
function hidePageLoader() {
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        console.log("Attempting to hide loader from app.js");
        loaderWrapper.style.opacity = '0';
        setTimeout(() => {
            if (loaderWrapper.parentNode) { // Check if it's still in DOM before removing
                loaderWrapper.remove();
                console.log("Loader removed by app.js");
            }
        }, 500); // Match timeout from game-store-script.js for consistency
    } else {
        console.warn("Loader wrapper not found by app.js. It might have been removed by game-store-script.js already, or the selector is incorrect.");
    }
}


// --- Utility Functions ---

/**
 * Creates an HTML string for a game card.
 * @param {object} game - The game object.
 * @param {string} pageType - 'home', 'available', or 'detail' to adjust card style or links if needed.
 * @returns {string} HTML string for the game card.
 */
function createGameCard(game, pageType = 'available') {
    const placeholderImage = '/Games/images/placeholder_game.png';
    const imageSrc = game.cardImage || placeholderImage;
    const gameLink = `/game-detail-template.html?id=${game.id}`;

    let badgeHtml = '';
    if (game.cardBadge) {
        badgeHtml = `<div class="game-badge">${game.cardBadge}</div>`;
    }

    // Determine download size
    let downloadSize = 'N/A';
    if (game.downloadLinks) {
        if (game.downloadLinks.direct && game.downloadLinks.direct.size) {
            downloadSize = game.downloadLinks.direct.size;
        } else if (game.downloadLinks.parts && game.downloadLinks.parts.length > 0 && game.downloadLinks.parts[0].size) {
            downloadSize = game.downloadLinks.parts[0].size; // Fallback to first part size
        } else if (game.downloadLinks.torrent && game.downloadLinks.torrent.size) {
            downloadSize = game.downloadLinks.torrent.size;
        }
    }

    // MODIFIED: Removed conditional AOS attribute
    const aosAttribute = ''; // No AOS attribute will be added

    // Modified card structure
    return `
        <div class="game-card" ${aosAttribute}> 
            <a href="${gameLink}" class="game-image-link">
                <div class="game-image">
                    <img src="${imageSrc}" alt="${game.title || 'Game Title'}" onerror="this.onerror=null;this.src='${placeholderImage}';">
                    ${badgeHtml}
                </div>
            </a>
            <div class="game-content">
                <h3 class="game-title"><a href="${gameLink}">${game.title || 'Unknown Game'}</a></h3>
                <p class="game-meta">${game.cardMeta || game.genreText || 'N/A'}</p>
                ${pageType === 'available' ? `<p class="game-download-size">Size: ${downloadSize}</p>` : ''}
                ${pageType !== 'available' ? `
                <p class="game-download-size">Size: ${downloadSize}</p>
                ` : ''}
                <a href="${gameLink}" class="btn btn-primary btn-sm">View Game</a>
            </div>
        </div>
    `;
}


/**
 * Renders a list of games into a specified container.
 * @param {HTMLElement} container - The HTML element to render games into.
 * @param {Array<object>} gamesToRender - Array of game objects to render.
 * @param {string} pageType - Type of page for card styling.
 */
function renderGames(container, gamesToRender, pageType = 'available') {
    if (!container) {
        console.warn(`Render container not found for pageType: ${pageType}`);
        return;
    }
    if (!gamesToRender || gamesToRender.length === 0) {
        console.log(`No games to render for container:`, container.id || container.className);
        container.innerHTML = '<p class="no-games-found">No games found matching your criteria.</p>';
        return;
    }
    console.log(`Rendering ${gamesToRender.length} games into`, container.id || container.className);
    container.innerHTML = gamesToRender.map(game => createGameCard(game, pageType)).join('');

    // MODIFIED: Removed conditional AOS refresh
    // if (pageType !== 'available' && typeof AOS !== 'undefined') {
    //     if (AOS.refresh) {
    //         AOS.refresh();
    //     } else {
    //         console.warn("AOS object found, but AOS.refresh is not a function. AOS might not be fully initialized or is an unexpected version.");
    //     }
    // }
}


/**
 * Parses a rating string (e.g., "4.5/5") and returns HTML for star icons.
 * @param {string} ratingString - The rating string.
 * @returns {string} HTML string for star rating.
 */
function getRatingHtml(ratingString) {
    if (!ratingString || typeof ratingString !== 'string' || !ratingString.includes('/')) return '<span>N/A</span>';
    const parts = ratingString.split('/');
    if (parts.length !== 2) return '<span>N/A</span>';

    const ratingValue = parseFloat(parts[0]);
    const maxRating = parseInt(parts[1], 10);

    if (isNaN(ratingValue) || isNaN(maxRating) || maxRating <= 0) return '<span>N/A</span>';

    let starsHtml = '';
    for (let i = 1; i <= maxRating; i++) {
        if (i <= ratingValue) {
            starsHtml += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= ratingValue) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        } else {
            starsHtml += '<i class="far fa-star"></i>';
        }
    }
    return `<span class="game-rating">${starsHtml} (${ratingValue.toFixed(1)})</span>`;
}

/**
 * Parses game size string (e.g., "10 GB", "500 MB") into megabytes.
 * @param {string} sizeStr - The size string.
 * @returns {number} Size in MB, or a very large/small number for sorting if unparsable.
 */
function parseSizeToMB(sizeStr) {
    if (!sizeStr || typeof sizeStr !== 'string') return Infinity;

    const sizeLower = sizeStr.toLowerCase();
    const numberPart = parseFloat(sizeStr.replace(/[^0-9.]/g, ''));

    if (isNaN(numberPart)) return Infinity;

    if (sizeLower.includes('gb')) {
        return numberPart * 1024;
    } else if (sizeLower.includes('mb')) {
        return numberPart;
    } else if (sizeLower.includes('kb')) {
        return numberPart / 1024;
    }
    return Infinity;
}

// --- Home Page Specific Logic (index.html) ---
function initHomePage() {
    console.log("Initializing Home Page content...");
    populateHeroSlider();
    populateFeaturedGames();
    populateRecentMultiplayerGames();
    populateTrendingGames();
}

function populateHeroSlider() {
    const heroSlider = document.querySelector('.hero-slider');
    const heroDotsContainer = document.querySelector('.hero-dots');
    if (!heroSlider || !heroDotsContainer) {
        console.warn("Hero slider or dots container not found for home page.");
        return;
    }

    const heroGames = allGames.filter(game => game.isHero).slice(0, 5);
    if (heroGames.length === 0) {
        heroSlider.innerHTML = `<div class="hero-slide active" style="background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/Games/images/default-hero-bg.jpg');">
                                    <div class="container hero-content"><h1 class="hero-title">Welcome to JNR Games</h1><p class="hero-subtitle">Explore our collection!</p></div>
                                </div>`;
        heroDotsContainer.innerHTML = '';
        return;
    }

    heroSlider.innerHTML = heroGames.map((game, index) => `
        <div class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${game.heroBackgroundImage || game.cardImage || '/Games/images/placeholder_game.png'}');">
            <div class="hero-content-overlay"></div>
            <div class="container hero-content">
                ${game.heroBadge ? `<span class="hero-badge-dynamic">${game.heroBadge}</span>` : ''}
                <h1 class="hero-title-dynamic">${game.title}</h1>
                <p class="hero-subtitle-dynamic">${game.shortDescription}</p>
                <div class="hero-meta">
                    ${game.genreText ? `<span><i class="fas fa-tag"></i> ${game.genreText}</span>` : ''}
                    ${game.year ? `<span><i class="fas fa-calendar-alt"></i> ${game.year}</span>` : ''}
                    ${game.rating ? getRatingHtml(game.rating) : ''}
                </div>
                <a href="/game-detail-template.html?id=${game.id}" class="btn btn-primary btn-lg"><i class="fas fa-play-circle"></i> View Game</a>
            </div>
        </div>
    `).join('');

    heroDotsContainer.innerHTML = heroGames.map((_, index) => `<div class="hero-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></div>`).join('');

    if (typeof window.setupHeroSlider === 'function') { // Check if function from game-store-script.js is available
        console.log("Calling setupHeroSlider from game-store-script.js");
        window.setupHeroSlider();
    } else {
        console.warn("setupHeroSlider function not found. Using basic fallback for hero slider.");
        let currentSlide = 0;
        const slides = heroSlider.querySelectorAll('.hero-slide');
        const dots = heroDotsContainer.querySelectorAll('.hero-dot');

        function goToSlide(index) {
            if (!slides || slides.length === 0) return;
            if (slides[currentSlide]) slides[currentSlide].classList.remove('active');
            if(dots && dots.length > currentSlide && dots[currentSlide]) dots[currentSlide].classList.remove('active');
            currentSlide = (index + slides.length) % slides.length;
            if (slides[currentSlide]) slides[currentSlide].classList.add('active');
            if(dots && dots.length > currentSlide && dots[currentSlide]) dots[currentSlide].classList.add('active');
        }

        if (slides.length > 1) {
           const nextBtn = document.querySelector('.hero-next');
           const prevBtn = document.querySelector('.hero-prev');
           if(nextBtn) nextBtn.onclick = () => goToSlide(currentSlide + 1);
           if(prevBtn) prevBtn.onclick = () => goToSlide(currentSlide - 1);
           dots.forEach(dot => {
               dot.onclick = () => goToSlide(parseInt(dot.dataset.slide));
           });
           if (window.heroSlideInterval) clearInterval(window.heroSlideInterval);
           window.heroSlideInterval = setInterval(() => goToSlide(currentSlide + 1), 7000);
        }
    }
}


function populateFeaturedGames() {
    const featuredContainer = document.getElementById('featured-games-grid');
    if (!featuredContainer) { console.warn("Featured games container (#featured-games-grid) not found."); return; }
    const featuredGames = allGames.filter(game => game.isFeatured).slice(0, ITEMS_PER_PAGE_HOME_SECTIONS);
    renderGames(featuredContainer, featuredGames, 'home');
}

function populateRecentMultiplayerGames() {
    const multiplayerContainer = document.getElementById('multiplayer-games-grid');
    if (!multiplayerContainer) { console.warn("Multiplayer/Recent games container (#multiplayer-games-grid) not found."); return; }

    const recentMultiplayerGames = allGames
        .filter(game => game.isMultiplayer || (game.tags && game.tags.some(tag => ['multiplayer', 'co-op'].includes(tag.toLowerCase()))))
        .sort((a, b) => (b.releaseDate && a.releaseDate) ? new Date(b.releaseDate) - new Date(a.releaseDate) : 0)
        .slice(0, ITEMS_PER_PAGE_HOME_SECTIONS);
    renderGames(multiplayerContainer, recentMultiplayerGames, 'home');
}

function populateTrendingGames() {
    const trendingCarousel = document.querySelector('.trending-carousel');
    if (!trendingCarousel) { console.warn("Trending games carousel (.trending-carousel) not found."); return; }

    const trendingGames = [...allGames]
        .sort((a, b) => ((b.views || 0) + (b.downloads || 0)) - ((a.views || 0) + (a.downloads || 0)))
        .slice(0, TRENDING_GAMES_COUNT);

    if (trendingGames.length === 0) {
        trendingCarousel.innerHTML = '<p>No trending games available right now.</p>';
        return;
    }

    trendingCarousel.innerHTML = trendingGames.map(game => {
        const placeholderImage = '/Games/images/placeholder_game.png';
        const imageSrc = game.cardImage || placeholderImage;
        const gameLink = `/game-detail-template.html?id=${game.id}`;
        return `
            <div class="trending-game game-card">
                <a href="${gameLink}">
                    <img src="${imageSrc}" alt="${game.title || 'Game Title'}" onerror="this.onerror=null;this.src='${placeholderImage}';">
                    <div class="game-content">
                         <h4 class="game-title">${game.title || 'Unknown Game'}</h4>
                         <p class="game-meta">${game.cardMeta || game.genreText || 'N/A'}</p>
                    </div>
                </a>
            </div>`;
    }).join('');

    if (typeof window.setupTrendingCarousel === 'function') { // Check if function from game-store-script.js is available
        console.log("Calling setupTrendingCarousel from game-store-script.js");
        window.setupTrendingCarousel();
    } else {
        console.warn("setupTrendingCarousel function not found. Trending carousel might not be interactive.");
    }
}


function updateTotalGamesCounter() {
    const totalGamesCountEl = document.getElementById('total-games-count');
    if (totalGamesCountEl) {
        totalGamesCountEl.textContent = allGames.length;
    }
}


// --- Available Games Page Specific Logic (available-games.html) ---
let currentFilteredAndSortedGames = []; // Moved to global scope of this file, but primarily for this page.
let currentFilter = '';
let currentSort = 'popular';
let currentPage = 1;

function initAvailableGamesPage() {
    console.log("Initializing Available Games Page content...");
    const filterInput = document.getElementById('filterGameTitle');
    const sortSelect = document.getElementById('sortGames');
    const gamesGrid = document.getElementById('all-games-grid'); // Get grid here for early check

    if (!gamesGrid) {
        console.error("#all-games-grid element not found on the Available Games page. Cannot display games.");
        return; // Stop if the main container is missing
    }
    // Ensure gamesGrid starts with its placeholder if it's empty or not yet processed
    if (gamesGrid.innerHTML.trim() === '' || gamesGrid.innerHTML.includes("Loading games...")) {
         gamesGrid.innerHTML = '<p>Loading games...</p>'; // Reset to initial state if needed
    }


    currentFilter = '';
    currentSort = sortSelect ? sortSelect.value : 'popular';
    currentPage = 1;

    currentFilteredAndSortedGames = [...allGames]; // Initialize with all available games

    if (filterInput) {
        filterInput.value = '';
        filterInput.addEventListener('input', (e) => {
            currentFilter = e.target.value.toLowerCase();
            applyFiltersAndSortAndRender();
        });
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFiltersAndSortAndRender();
        });
    }

    console.log("Initial call to applyFiltersAndSortAndRender for Available Games page.");
    applyFiltersAndSortAndRender(1);
}

function applyFiltersAndSortAndRender(page = 1) {
    console.log(`Applying filters and sort. Page: ${page}, Filter: "${currentFilter}", Sort: "${currentSort}"`);
    currentPage = page;
    let gamesToShow = [...allGames]; // Start with a fresh copy of all games

    if (currentFilter) {
        gamesToShow = gamesToShow.filter(game =>
            (game.title && game.title.toLowerCase().includes(currentFilter)) ||
            (game.tags && game.tags.some(tag => tag.toLowerCase().includes(currentFilter))) ||
            (game.genreText && game.genreText.toLowerCase().includes(currentFilter))
        );
    }
    console.log(`Games after filtering: ${gamesToShow.length}`);


    switch (currentSort) {
        case 'popular':
            gamesToShow.sort((a, b) => ((b.views || 0) + (b.downloads || 0)) - ((a.views || 0) + (a.downloads || 0)));
            break;
        case 'newest':
            gamesToShow.sort((a, b) => (b.releaseDate && a.releaseDate) ? new Date(b.releaseDate) - new Date(a.releaseDate) : 0);
            break;
        case 'oldest':
            gamesToShow.sort((a, b) => (b.releaseDate && a.releaseDate) ? new Date(a.releaseDate) - new Date(b.releaseDate) : 0);
            break;
        case 'title-asc':
            gamesToShow.sort((a, b) => (a.title && b.title) ? a.title.localeCompare(b.title) : 0);
            break;
        case 'title-desc':
            gamesToShow.sort((a, b) => (a.title && b.title) ? b.title.localeCompare(a.title) : 0);
            break;
        case 'size-asc':
            gamesToShow.sort((a, b) => parseSizeToMB(a.downloadLinks?.direct?.size || a.downloadLinks?.parts?.[0]?.size || a.downloadLinks?.torrent?.size) - parseSizeToMB(b.downloadLinks?.direct?.size || b.downloadLinks?.parts?.[0]?.size || b.downloadLinks?.torrent?.size));
            break;
        case 'size-desc':
            gamesToShow.sort((a, b) => parseSizeToMB(b.downloadLinks?.direct?.size || b.downloadLinks?.parts?.[0]?.size || b.downloadLinks?.torrent?.size) - parseSizeToMB(a.downloadLinks?.direct?.size || a.downloadLinks?.parts?.[0]?.size || a.downloadLinks?.torrent?.size));
            break;
        default:
            console.warn(`Unknown sort option: ${currentSort}`);
    }
    console.log(`Games after sorting: ${gamesToShow.length}`);

    currentFilteredAndSortedGames = gamesToShow;

    const gamesGrid = document.getElementById('all-games-grid');
    const paginationControls = document.querySelector('.pagination-controls');

    if (!gamesGrid) {
        console.error("#all-games-grid element not found when trying to render. Aborting render.");
        return;
    }
     if (!paginationControls) {
        console.warn("Pagination controls (.pagination-controls) not found. Pagination will not be rendered.");
    }


    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_AVAILABLE;
    const endIndex = startIndex + ITEMS_PER_PAGE_AVAILABLE;
    const paginatedGames = currentFilteredAndSortedGames.slice(startIndex, endIndex);
    console.log(`Paginating: StartIndex ${startIndex}, EndIndex ${endIndex}, Games on this page: ${paginatedGames.length}`);


    renderGames(gamesGrid, paginatedGames, 'available'); // Pass 'available' as pageType
    if (paginationControls) {
        renderPagination(paginationControls, currentFilteredAndSortedGames.length, ITEMS_PER_PAGE_AVAILABLE, currentPage);
    }
}

function renderPagination(container, totalItems, itemsPerPage, currentPage) {
    if (!container) return;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    container.innerHTML = '';

    if (totalPages <= 1) return;

    function createPageItem(text, pageNumber, isActive = false, isDisabled = false, isEllipsis = false) {
        const item = document.createElement(isEllipsis ? 'span' : 'a');
        item.classList.add('page-item');
        if (isActive) item.classList.add('active');
        if (isDisabled) item.classList.add('disabled');
        if (isEllipsis) item.classList.add('ellipsis');

        item.innerHTML = text;
        if (!isEllipsis && !isDisabled && pageNumber > 0) {
            item.href = '#';
            item.addEventListener('click', (e) => {
                e.preventDefault();
                applyFiltersAndSortAndRender(pageNumber);
            });
        } else if (isDisabled || isEllipsis) {
            item.style.cursor = 'default';
        }
        return item;
    }

    container.appendChild(createPageItem('&laquo; Prev', currentPage - 1, false, currentPage === 1));

    const MAX_VISIBLE_PAGES = 5;
    if (totalPages <= MAX_VISIBLE_PAGES) {
        for (let i = 1; i <= totalPages; i++) {
            container.appendChild(createPageItem(i.toString(), i, i === currentPage));
        }
    } else {
        container.appendChild(createPageItem('1', 1, currentPage === 1));

        let startEllipsisNeeded = false;
        let endEllipsisNeeded = false;
        let pageStart, pageEnd;

        // Determine the range of pages to display around the current page
        const wingSize = Math.floor((MAX_VISIBLE_PAGES - 3) / 2); // -3 for first, last, and current/ellipsis

        if (currentPage <= wingSize + 2) { // Near the beginning
            pageStart = 2;
            pageEnd = MAX_VISIBLE_PAGES - 1;
            endEllipsisNeeded = (pageEnd < totalPages -1);
        } else if (currentPage >= totalPages - (wingSize + 1)) { // Near the end
            pageStart = totalPages - (MAX_VISIBLE_PAGES - 2);
            pageEnd = totalPages - 1;
            startEllipsisNeeded = (pageStart > 2);
        } else { // In the middle
            pageStart = currentPage - wingSize;
            pageEnd = currentPage + wingSize;
            startEllipsisNeeded = true;
            endEllipsisNeeded = true;
        }

        if (startEllipsisNeeded) {
            container.appendChild(createPageItem('...', 0, false, true, true));
        }

        for (let i = pageStart; i <= pageEnd; i++) {
            if (i > 1 && i < totalPages) {
                 container.appendChild(createPageItem(i.toString(), i, i === currentPage));
            }
        }

        if (endEllipsisNeeded) {
             container.appendChild(createPageItem('...', 0, false, true, true));
        }
        container.appendChild(createPageItem(totalPages.toString(), totalPages, currentPage === totalPages));
    }

    container.appendChild(createPageItem('Next &raquo;', currentPage + 1, false, currentPage === totalPages));
}


// --- Game Detail Page Specific Logic (game-detail-template.html) ---
async function initGameDetailPage() {
    console.log("Initializing Game Detail Page content...");
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    if (!gameId) {
        document.body.innerHTML = '<p class="text-center text-red-500 text-2xl mt-10">Game ID not provided in URL (e.g., ?id=gameid).</p>';
        hidePageLoader();
        return;
    }

    if (allGames.length === 0) {
        console.log("Game detail: allGames empty, attempting to fetchGamesData again.");
        const tempResponse = await fetch('/games.json');
        if (!tempResponse.ok) {
            document.body.innerHTML = `<p class="text-center text-red-500 text-2xl mt-10">Error loading game data for detail page.</p>`;
            hidePageLoader();
            return;
        }
        allGames = await tempResponse.json();
        if (!Array.isArray(allGames) || allGames.length === 0) {
            document.body.innerHTML = `<p class="text-center text-red-500 text-2xl mt-10">No game data found after attempting fetch for detail page.</p>`;
            hidePageLoader();
            return;
        }
        console.log("Games data fetched for detail page. Count:", allGames.length);
    }

    currentGameData = allGames.find(game => game.id === gameId);

    if (!currentGameData) {
        document.body.innerHTML = `<p class="text-center text-red-500 text-2xl mt-10">Game with ID '${gameId}' not found. Check games.json.</p>`;
        hidePageLoader();
        return;
    }

    document.title = `${currentGameData.title || 'Game Details'} | JNR Games Store`;

    populateGameDetailHero(currentGameData);
    populateGameAbout(currentGameData);
    populateScreenshots(currentGameData);
    populateSystemRequirements(currentGameData);
    populateDownloadSection(currentGameData);
    populateInstallationInfo(currentGameData);
    populateRelatedGames(currentGameData);
    setupScreenshotLightbox();
}

function populateGameDetailHero(game) {
    const heroSection = document.querySelector('.game-detail-hero');
    if (!heroSection) { console.warn("Game detail hero section not found."); return; }
    const titleEl = heroSection.querySelector('.hero-title');
    const subtitleEl = heroSection.querySelector('.hero-subtitle');
    const metaTagsEl = heroSection.querySelector('.game-meta-tags');

    heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${game.heroBackgroundImage || game.cardImage || '/Games/images/placeholder_game.png'}')`;
    if (titleEl) titleEl.textContent = game.title || "Game Title";
    if (subtitleEl) subtitleEl.textContent = game.shortDescription || "Details loading...";
    if (metaTagsEl) {
        metaTagsEl.innerHTML = '';
        if (game.tags && game.tags.length > 0) {
            game.tags.slice(0, 4).forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.classList.add('hero-game-tag');
                tagSpan.textContent = tag;
                metaTagsEl.appendChild(tagSpan);
            });
        } else if (game.genreText) {
             const tagSpan = document.createElement('span');
             tagSpan.classList.add('hero-game-tag');
             tagSpan.textContent = game.genreText.split(',')[0].trim();
             metaTagsEl.appendChild(tagSpan);
        }
    }
}

function populateGameAbout(game) {
    const aboutTextEl = document.getElementById('game-about-text');
    const aboutImageEl = document.getElementById('game-about-image');
    if (aboutTextEl) aboutTextEl.innerHTML = `<p>${game.aboutGame || 'No detailed description available.'}</p>`;
    if (aboutImageEl) {
        aboutImageEl.src = game.cardImage || game.heroCoverImage || '/Games/images/placeholder_game.png';
        aboutImageEl.alt = game.title || 'Game Image';
    }
}

function populateScreenshots(game) {
    const galleryEl = document.getElementById('screenshots-gallery');
    if (!galleryEl) { console.warn("Screenshots gallery not found."); return; }
    galleryEl.innerHTML = '';

    if (game.screenshots && game.screenshots.length > 0) {
        game.screenshots.forEach(ssUrl => {
            if (ssUrl && typeof ssUrl === 'string') {
                const div = document.createElement('div');
                div.classList.add('screenshot');
                div.innerHTML = `<img src="${ssUrl}" alt="${game.title || 'Game'} Screenshot" onerror="this.onerror=null;this.src='/Games/images/placeholder_game.png';this.alt='Screenshot not available';">`;
                galleryEl.appendChild(div);
            }
        });
    } else {
        galleryEl.innerHTML = '<p>No screenshots available for this game.</p>';
    }
}

function setupScreenshotLightbox() {
    const lightbox = document.getElementById('screenshot-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const screenshots = document.querySelectorAll('#screenshots-gallery .screenshot img');

    if (!lightbox || !lightboxImage || !closeBtn || screenshots.length === 0) {
        return;
    }

    screenshots.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImage.src = img.src;
            lightbox.style.display = 'flex';
        });
    });

    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });
}


function populateSystemRequirements(game) {
    const minReqTableBody = document.getElementById('req-min-tbody');
    const recReqTableBody = document.getElementById('req-rec-tbody');

    function populateTable(tbody, requirements) {
        if (!tbody) return;
        tbody.innerHTML = '';
        if (requirements && typeof requirements === 'object' && Object.keys(requirements).length > 0) {
            for (const key in requirements) {
                if (requirements[key] !== null && requirements[key] !== undefined) {
                    const row = tbody.insertRow();
                    const cellKey = row.insertCell();
                    const cellValue = row.insertCell();
                    cellKey.innerHTML = `<strong>${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong>`;
                    cellValue.textContent = requirements[key];
                }
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="2">Not specified.</td></tr>';
        }
    }

    populateTable(minReqTableBody, game.systemRequirements?.minimum);
    populateTable(recReqTableBody, game.systemRequirements?.recommended);
}

function populateDownloadSection(game) {
    const setupSizeEl = document.getElementById('game-setup-size');
    const rarPasswordInfoEl = document.getElementById('rar-password-info');
    const linksContainerEl = document.getElementById('download-links-container');
    const partsModalListEl = document.getElementById('modal-parts-list');

    if (!game || !game.downloadLinks) {
        if(linksContainerEl) linksContainerEl.innerHTML = '<p>Download information is currently unavailable.</p>';
        if(setupSizeEl) setupSizeEl.textContent = 'N/A';
        if(rarPasswordInfoEl) rarPasswordInfoEl.innerHTML = '';
        return;
    }

    if (setupSizeEl) {
        setupSizeEl.textContent = game.downloadLinks.direct?.size || game.downloadLinks.parts?.[0]?.size || 'N/A';
    }
    if (rarPasswordInfoEl) {
        let passwordText = '';
        if (game.rarPassword) {
            passwordText += `RAR Password: <span class="password-badge">${game.rarPassword}</span>`;
        }
        if (game.onlineFixRarPassword) {
             passwordText += (passwordText ? '<br>' : '') + `OnlineFix RAR Password: <span class="password-badge">${game.onlineFixRarPassword}</span>`;
        }
        rarPasswordInfoEl.innerHTML = passwordText || 'No password typically required.';
    }

    if (!linksContainerEl) { console.warn("Download links container not found."); return; }
    linksContainerEl.innerHTML = '';

    const dlLinks = game.downloadLinks;
    let hasLinks = false;

    if (dlLinks.direct?.url) {
        hasLinks = true;
        linksContainerEl.appendChild(createDownloadButton(dlLinks.direct.name || 'Direct Download', dlLinks.direct.url, dlLinks.direct.size, 'direct-download', 'fas fa-download'));
    }

    if (dlLinks.additionalDirectLinks?.length > 0) {
        hasLinks = true;
        dlLinks.additionalDirectLinks.forEach(link => {
            if(link.url) linksContainerEl.appendChild(createDownloadButton(link.name || 'Mirror Link', link.url, link.size, 'direct-download-alt', 'fas fa-link'));
        });
    }

    if (dlLinks.parts?.length > 0) {
        hasLinks = true;
        const partsBtn = createDownloadButton('Download Parts', '#', `${dlLinks.parts.length} Parts`, 'parts-download', 'fas fa-puzzle-piece');
        partsBtn.id = 'partsBtn'; // ID used by downloadbtn.js
        linksContainerEl.appendChild(partsBtn);

        if (partsModalListEl) {
            partsModalListEl.innerHTML = '';
            dlLinks.parts.forEach((part, index) => {
                if (part.url) {
                    const listItem = document.createElement('li');
                    listItem.classList.add('part-item');
                    // MODIFIED: Removed openAdAndDownload call, direct link now
                    listItem.innerHTML = `
                        <span>Part ${index + 1} (${part.size || 'N/A'})</span>
                        <a href="${part.url}" target="_blank" rel="noopener noreferrer" class="part-link">
                            <i class="fas fa-download"></i> Download
                        </a>`;
                    partsModalListEl.appendChild(listItem);
                }
            });
        }
    }

    if (dlLinks.torrent?.url) {
        hasLinks = true;
        linksContainerEl.appendChild(createDownloadButton('Torrent Download', dlLinks.torrent.url, dlLinks.torrent.size, 'torrent-download', 'fas fa-magnet'));
    }

    if (!hasLinks) {
        linksContainerEl.innerHTML = '<p>No download links available for this game yet.</p>';
    }
}

// MODIFIED createDownloadButton: Removed the call to openAdAndDownload
function createDownloadButton(text, url, size, className, iconClass) {
    const button = document.createElement('a');
    button.classList.add('download-btn', className);
    button.href = '#';
    button.addEventListener('click', (e) => {
        e.preventDefault();

        // Open ad in a new tab
        window.open('https://otieu.com/4/9407094', '_blank');

        // Then redirect to download link in same window
        setTimeout(() => {
            window.location.href = url;
        }, 100); // Optional slight delay
    });

    button.innerHTML = `
        <span class="download-icon"><i class="${iconClass}"></i></span>
        <span class="btn-content">
            <span class="btn-text">${text}</span>
            ${size ? `<span class="btn-size">${size}</span>` : ''}
        </span>
    `;
    return button;
}



function populateInstallationInfo(game) {
    const videoBtn = document.getElementById('installation-video-btn');
    const stepsList = document.getElementById('installation-steps-list');

    if (videoBtn) {
        if (game.installationVideoUrl && game.installationVideoUrl !== "#") {
            videoBtn.href = game.installationVideoUrl;
            videoBtn.style.display = 'inline-flex';
        } else {
            videoBtn.style.display = 'none';
        }
    }

    if (stepsList) {
        stepsList.innerHTML = '';
        if (game.installationSteps && game.installationSteps.length > 0) {
            game.installationSteps.forEach(step => {
                const li = document.createElement('li');
                li.textContent = step;
                stepsList.appendChild(li);
            });
        } else {
            stepsList.innerHTML = '<li>Installation instructions not available.</li>';
        }
    }
}

function populateRelatedGames(currentGame) {
    const relatedContainer = document.getElementById('related-games-grid');
    if (!relatedContainer) { console.warn("Related games container not found."); return; }

    const currentTags = currentGame.tags || [];
    const currentGenres = (currentGame.genreText || "").toLowerCase().split(',').map(g => g.trim()).filter(g => g);


    let related = allGames.filter(game => {
        if (game.id === currentGame.id) return false;

        const gameTags = game.tags || [];
        if (currentTags.length > 0 && gameTags.some(tag => currentTags.includes(tag))) return true;

        const gameGenres = (game.genreText || "").toLowerCase().split(',').map(g => g.trim()).filter(g => g);
        if (currentGenres.length > 0 && gameGenres.some(genre => currentGenres.includes(genre))) return true;

        return false;
    });

    related.sort(() => 0.5 - Math.random()); // Randomize related games

    if (related.length < RELATED_GAMES_COUNT) {
        const additionalGamesNeeded = RELATED_GAMES_COUNT - related.length;
        const existingRelatedIds = new Set(related.map(g => g.id).concat(currentGame.id));
        const randomGames = allGames
            .filter(g => !existingRelatedIds.has(g.id))
            .sort(() => 0.5 - Math.random())
            .slice(0, additionalGamesNeeded);
        related = [...new Set([...related, ...randomGames])];
    }

    renderGames(relatedContainer, related.slice(0, RELATED_GAMES_COUNT), 'detail');
}


// --- Live Search Functionality (Navbar) ---
function initLiveSearch() {
    const searchInput = document.getElementById('liveSearchInput');
    const searchResultsContainer = document.getElementById('liveSearchResults');

    if (!searchInput || !searchResultsContainer) {
        return;
    }

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResultsContainer.innerHTML = '';
            searchResultsContainer.style.display = 'none';
            return;
        }

        if(allGames.length === 0) { // Check if allGames is populated
            console.warn("Live search: allGames array is empty. Cannot perform search.");
            return;
        }


        const filteredGames = allGames.filter(game =>
            (game.title && game.title.toLowerCase().includes(query)) ||
            (game.tags && game.tags.some(tag => tag.toLowerCase().includes(query)))
        ).slice(0, 5);

        if (filteredGames.length > 0) {
            searchResultsContainer.innerHTML = filteredGames.map(game =>
                `<a href="/game-detail-template.html?id=${game.id}" class="live-search-item">
                    <img src="${game.cardImage || '/Games/images/placeholder_game.png'}" alt="${game.title || 'Game'}" class="search-item-img">
                    <span class="search-item-title">${game.title || 'Unknown Game'}</span>
                </a>`
            ).join('');
            searchResultsContainer.style.display = 'block';
        } else {
            searchResultsContainer.innerHTML = '<div class="live-search-item no-results">No games found.</div>';
            searchResultsContainer.style.display = 'block';
        }
    });

    document.addEventListener('click', function(event) {
        if (searchResultsContainer && searchInput && !searchInput.contains(event.target) && !searchResultsContainer.contains(event.target)) {
            searchResultsContainer.style.display = 'none';
        }
    });
     searchInput.addEventListener('focus', function() {
        if (this.value.length >= 2 && searchResultsContainer && searchResultsContainer.children.length > 0) {
             searchResultsContainer.style.display = 'block';
        }
    });
}