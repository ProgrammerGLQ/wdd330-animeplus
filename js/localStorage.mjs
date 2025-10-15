const FAVORITES_KEY = 'animeplus-favorites';

export function loadFavorites() {
    const json = localStorage.getItem(FAVORITES_KEY);
    return json ? JSON.parse(json) : [];
}

export function saveFavorite(item) {
    let favorites = loadFavorites();
    const id = item._id || item.id; 
    const index = favorites.findIndex(fav => (fav._id || fav.id) === id);

    if (index === -1) {
        favorites.push(item);
    } else {
        favorites.splice(index, 1);
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(itemId) {
    const favorites = loadFavorites();
    return favorites.some(fav => (fav._id || fav.id) === itemId);
}