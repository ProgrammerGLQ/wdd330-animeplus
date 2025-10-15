// js/renderModule.mjs

import { DOM } from './domElements.mjs';
import { isFavorite } from './localStorage.mjs'; 

// Exporta estas funciones para que main.js las pueda usar
export function resetView(currentAnimeList, searchInput) {
    DOM.animeDetailContainer.style.display = 'none';
    DOM.resultsContainer.style.display = 'block';
    DOM.resultsContainer.innerHTML = '<p>Welcome to Animeplus! Select Anime or Manga and start your search.</p>';
    searchInput.value = '';
    
    // Necesitamos que main.js actualice currentAnimeList a [] después de llamar a esta función
    
    if(DOM.mainContent) {
        DOM.mainContent.scrollIntoView({ behavior: 'smooth' });
    }
}

export function renderAnimeList(items, mediaType) {
    if (!items || items.length === 0) {
        const msg = mediaType === 'favorito' ? 'Your favorites list is empty.' : `No results found for ${mediaType}.`;
        DOM.resultsContainer.innerHTML = `<p class="error-message">${msg}</p>`;
        DOM.resultsContainer.style.display = 'block'; 
        return;
    }
    
    DOM.resultsContainer.style.display = 'grid'; 

    DOM.resultsContainer.innerHTML = items.map(item => {
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

    // CÓDIGO DE ANIMACIÓN ESCALONADA
    const cards = DOM.resultsContainer.querySelectorAll('.anime-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.08}s`; 
    });
}

export function renderItemDetails(selectedItem, currentMediaType, saveFavorite, myListLink, currentAnimeList) {
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

    DOM.resultsContainer.style.display = 'none';
    DOM.animeDetailContainer.style.display = 'block';

    if(DOM.mainContent) {
        DOM.mainContent.scrollIntoView({ behavior: 'smooth' });
    }

    DOM.animeDetailContainer.innerHTML = `
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
    
    // Listeners for detail view (Se quedan aquí porque dependen del HTML que se acaba de crear)
    document.getElementById('backToList').addEventListener('click', () => {
        DOM.animeDetailContainer.style.display = 'none';
        DOM.resultsContainer.style.display = 'block';
        if(DOM.mainContent) {
            DOM.mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Handle Favorites (Necesita saveFavorite y myListLink, que ahora se pasan como argumentos)
    document.getElementById('favoriteButton').addEventListener('click', (event) => {
        saveFavorite(selectedItem);
        const updatedFavText = isFavorite(id) ? '❤️ Remove from My List' : '🤍 Add to My List';
        event.target.textContent = updatedFavText;
        
        // Simular clic en My List si estamos en la vista de favoritos
        if (DOM.resultsContainer.querySelector('h2') && DOM.resultsContainer.querySelector('h2').textContent.includes('My Favorites List')) {
            myListLink.click(); 
        }
    });
}