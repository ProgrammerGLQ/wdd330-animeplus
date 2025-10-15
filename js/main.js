import { searchAnime, searchManga } from './apiModule.mjs';
import { loadFavorites, saveFavorite, isFavorite } from './localStorage.mjs';


// DOM Elements and Global State
const appTitle = document.getElementById('appTitle'); 
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('animeResults');
const animeDetailContainer = document.getElementById('animeDetail');
const myListLink = document.getElementById('myListLink');
const toggleAnime = document.getElementById('toggleAnime');
const toggleManga = document.getElementById('toggleManga');
const mainContent = document.getElementById('contentContainer'); // Contenedor principal para el scroll


let currentAnimeList = []; 
let currentMediaType = 'anime'; 

// Resets view to the initial state
function resetView() {
    animeDetailContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '<p>Welcome to Animeplus! Select Anime or Manga and start your search.</p>';
    searchInput.value = '';
    currentAnimeList = [];
    if(mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth' });
    }
}

// Renders the list of anime/manga cards
function renderAnimeList(items, mediaType) {
    if (!items || items.length === 0) {
        const msg = mediaType === 'favorito' ? 'Your favorites list is empty.' : `No results found for ${mediaType}.`;
        resultsContainer.innerHTML = `<p class="error-message">${msg}</p>`;

        resultsContainer.style.display = 'block'; 
        return;
    }
    

    resultsContainer.style.display = 'grid'; 

    resultsContainer.innerHTML = items.map(item => {
        // Field mapping for cards
        const id = item._id || item.id; 
        const title = item.title;
        const image = item.image || item.thumb || 'placeholder.jpg';
        const type = item.episodes ? 'Anime' : (item.chapters || item.total_chapter ? 'Manga' : 'Item');
        const rankOrStatus = item.ranking ? `Ranking: #${item.ranking}` : `Status: ${item.status || 'N/A'}`;
        const chaptersOrEpisodes = item.episodes ? `Eps: ${item.episodes}` : (item.chapters || item.total_chapter ? `Caps: ${item.chapters || item.total_chapter}` : '');
        const genres = (item.genres && item.genres.length > 0) ? (item.genres[0].name ? item.genres.map(g => g.name).slice(0, 2).join(', ') : item.genres.slice(0, 2).join(', ')) : 'Various';
        
        return `
            <div class="anime-card" data-id="${id}" data-type="${type.toLowerCase()}">
                <img src="${image}" alt="${title}" class="anime-image" onerror="this.onerror=null;this.src='css/placeholder.jpg';">
                <div class="anime-info">
                    <h2 class="anime-title">${title} (${type})</h2> 
                    <p class="anime-rank-status">${rankOrStatus}</p> 
                    <p class="anime-genres">${genres}</p>
                    <p class="anime-chapters">${chaptersOrEpisodes}</p>
                    <button class="details-button" data-id="${id}" data-type="${type.toLowerCase()}">View Details</button>
                </div>
            </div>
        `;
    }).join('');


    const cards = resultsContainer.querySelectorAll('.anime-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.08}s`; 
    });
}

// Renders the detailed view of an item
function renderItemDetails(selectedItem) {
    const id = selectedItem._id || selectedItem.id;
    const mediaType = selectedItem.episodes ? 'anime' : (selectedItem.chapters || selectedItem.total_chapter ? 'manga' : currentMediaType);
    const isFav = isFavorite(id);
    const favoriteButtonText = isFav ? '❤️ Remove from My List' : '🤍 Add to My List';

    // Detailed field mapping
    const title = selectedItem.title;
    const image = selectedItem.image || selectedItem.thumb || 'placeholder.jpg';
    const authors = selectedItem.authors ? (Array.isArray(selectedItem.authors) ? selectedItem.authors.map(a => a.name || a).join(', ') : selectedItem.authors) : 'N/A';
    const genres = (selectedItem.genres && selectedItem.genres.length > 0) ? (selectedItem.genres[0].name ? selectedItem.genres.map(g => g.name).join(', ') : selectedItem.genres.join(', ')) : 'N/A';
    const summaryOrSynopsis = selectedItem.synopsis || selectedItem.summary || 'No synopsis available.';
    const type = selectedItem.type || 'N/A'; 
    const link = selectedItem.link; 
    const subTitle = selectedItem.sub_title || 'N/A';
    const nsfw = selectedItem.nsfw ? 'Yes' : 'No';

    resultsContainer.style.display = 'none'; // 
    animeDetailContainer.style.display = 'block'; // 

    if(mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth' });
    }

    animeDetailContainer.innerHTML = `
        <button id="backToList">← Back to Results</button>
        <div class="anime-detail-content">
            <img src="${image}" alt="${title}" class="detail-image" onerror="this.onerror=null;this.src='css/placeholder.jpg';">
            <div class="detail-info">
                <h2 class="anime-title">${title} (${mediaType.toUpperCase()})</h2>
                ${subTitle !== 'N/A' ? `<p><strong>Subtitle:</strong> ${subTitle}</p>` : ''}
                <p><strong>Author(s):</strong> ${authors}</p>
                <p><strong>Type/Format:</strong> ${type}</p>
                <p><strong>Genres:</strong> ${genres}</p>
                <p><strong>Status:</strong> ${selectedItem.status || 'N/A'}</p>
                <p><strong>Ranking/Score:</strong> ${selectedItem.ranking || selectedItem.score || 'N/A'}</p>
                <p><strong>NSFW/Mature:</strong> ${nsfw}</p>

                ${link ? `<a href="${link}" target="_blank" class="streaming-button">Go to Source/More Info →</a>` : ''}

                <button id="favoriteButton" class="favorite-button" data-id="${id}">${favoriteButtonText}</button>
                
                <h3>Synopsis/Summary</h3>
                <p class="detail-synopsis">${summaryOrSynopsis}</p> 
            </div>
        </div>
    `;
    
    // Listeners for detail view
    document.getElementById('backToList').addEventListener('click', () => {
        animeDetailContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        if(mainContent) {
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Handle Favorites
    document.getElementById('favoriteButton').addEventListener('click', (event) => {
        saveFavorite(selectedItem);
        const updatedFavText = isFavorite(id) ? '❤️ Remove from My List' : '🤍 Add to My List';
        event.target.textContent = updatedFavText;
        
        if (resultsContainer.querySelector('h2') && resultsContainer.querySelector('h2').textContent.includes('My Favorites List')) {

            myListLink.click(); 
        }
    });
}


// Event Handlers
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    animeDetailContainer.style.display = 'none';
    resultsContainer.style.display = 'block';

    const searchTerm = searchInput.value.trim();
    if (searchTerm === "") return;

    resultsContainer.innerHTML = `<p class="loading-message">Loading ${currentMediaType}...</p>`;
    
    let items;
    items = currentMediaType === 'anime' ? await searchAnime(searchTerm) : await searchManga(searchTerm);

    if (items) {
        currentAnimeList = items; 
        renderAnimeList(items, currentMediaType);
    } else {
        resultsContainer.innerHTML = `<p class="error-message">❌ Connection error with ${currentMediaType.toUpperCase()} API.</p>`;
    }
});

// Toggle button listeners
[toggleAnime, toggleManga].forEach(button => {
    button.addEventListener('click', (event) => {
        const newMediaType = event.target.dataset.type;
        currentMediaType = newMediaType;
        searchInput.placeholder = `Search ${newMediaType.toUpperCase()} by Title...`;

        toggleAnime.classList.toggle('active', newMediaType === 'anime');
        toggleManga.classList.toggle('active', newMediaType === 'manga');
        
        currentAnimeList = []; 
        resultsContainer.innerHTML = `<p>You selected ${newMediaType.toUpperCase()}. Use the search bar.</p>`;
        animeDetailContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
    });
});
toggleAnime.classList.add('active'); 

// View Details handler
resultsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('details-button')) {
        const itemId = event.target.dataset.id;
        let listToSearch = currentAnimeList.length > 0 ? currentAnimeList : loadFavorites();
        const selectedItem = listToSearch.find(item => (item._id || item.id) == itemId);
        
        if (selectedItem) {
            renderItemDetails(selectedItem);
        }
    }
});

// Load My List handler
myListLink.addEventListener('click', (event) => {
    event.preventDefault();
    animeDetailContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    const favorites = loadFavorites();
    currentAnimeList = favorites; 
    
    resultsContainer.innerHTML = '<h2>My Favorites List</h2>';
    renderAnimeList(favorites, 'favorito'); 
});

// App Title/Home button listener
appTitle.addEventListener('click', resetView);

// Initialization
resetView();