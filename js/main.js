import { searchAnime, searchManga } from './apiModule.mjs';
import { loadFavorites, saveFavorite, isFavorite } from './localStorage.mjs';
import { DOM } from './domElements.mjs';
import { renderAnimeList, renderItemDetails, resetView } from './renderModule.mjs';


let currentAnimeList = []; 
let currentMediaType = 'anime'; 

// Wrapper para resetView (necesita actualizar el estado global)
function handleResetView() {
    resetView(currentAnimeList, DOM.searchInput);
    currentAnimeList = []; 
}

// Event Handlers
DOM.searchForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    DOM.animeDetailContainer.style.display = 'none';
    DOM.resultsContainer.style.display = 'block';

    const searchTerm = DOM.searchInput.value.trim();
    if (searchTerm === "") return;

    DOM.resultsContainer.innerHTML = `<p class="loading-message">Loading ${currentMediaType}...</p>`;
    
    let items;
    items = currentMediaType === 'anime' ? await searchAnime(searchTerm) : await searchManga(searchTerm);

    if (items) {
        currentAnimeList = items; 
        renderAnimeList(items, currentMediaType);
    } else {
        DOM.resultsContainer.innerHTML = `<p class="error-message">❌ Connection error with ${currentMediaType.toUpperCase()} API.</p>`;
    }
});

// Toggle button listeners
[DOM.toggleAnime, DOM.toggleManga].forEach(button => {
    button.addEventListener('click', (event) => {
        const newMediaType = event.target.dataset.type;
        currentMediaType = newMediaType;
        DOM.searchInput.placeholder = `Search ${newMediaType.toUpperCase()} by Title...`;

        DOM.toggleAnime.classList.toggle('active', newMediaType === 'anime');
        DOM.toggleManga.classList.toggle('active', newMediaType === 'manga');
        
        currentAnimeList = []; 
        DOM.resultsContainer.innerHTML = `<p>You selected ${newMediaType.toUpperCase()}. Use the search bar.</p>`;
        DOM.animeDetailContainer.style.display = 'none';
        DOM.resultsContainer.style.display = 'block';
    });
});
DOM.toggleAnime.classList.add('active'); 

// View Details handler
DOM.resultsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('details-button')) {
        const itemId = event.target.dataset.id;
        let listToSearch = currentAnimeList.length > 0 ? currentAnimeList : loadFavorites();
        const selectedItem = listToSearch.find(item => (item._id || item.id) == itemId);
        
        if (selectedItem) {
            renderItemDetails(selectedItem, currentMediaType, saveFavorite, DOM.myListLink, currentAnimeList);
        }
    }
});

// Load My List handler
DOM.myListLink.addEventListener('click', (event) => {
    event.preventDefault();
    DOM.animeDetailContainer.style.display = 'none';
    DOM.resultsContainer.style.display = 'block';
    
    const favorites = loadFavorites();
    currentAnimeList = favorites; 
    
    DOM.resultsContainer.innerHTML = '<h2>My Favorites List</h2>';
    renderAnimeList(favorites, 'favorito'); 
});

// App Title/Home button listener
DOM.appTitle.addEventListener('click', handleResetView);

// Initialization
handleResetView();