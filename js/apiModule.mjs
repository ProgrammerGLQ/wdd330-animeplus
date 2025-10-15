// RapidAPI Master Key (used for both APIs)
const YOUR_RAPIDAPI_KEY = 'd9f35101d4msh5a79062c5690f52p1b8622jsnc58377989eff'; 

// --- API 1: ANIME (Anime DB) Config ---
const API_KEY_1 = YOUR_RAPIDAPI_KEY; 
const API_HOST_1 = 'anime-db.p.rapidapi.com';
const BASE_URL_1 = 'https://anime-db.p.rapidapi.com/anime';

// --- API 2: MANGA (MangaVerse API) Config ---
const API_KEY_2 = YOUR_RAPIDAPI_KEY; 
const API_HOST_2 = 'mangaverse-api.p.rapidapi.com';
const BASE_URL_2 = 'https://mangaverse-api.p.rapidapi.com/manga/fetch'; 

/** Generic fetch function for RapidAPI calls. */
async function rapidApiFetch(url, apiKey, apiHost) {
    try {
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost
            }
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data || []; 

    } catch (error) {
        console.error(`Error requesting ${apiHost}:`, error);
        return null; 
    }
}

/** Search function for ANIME (API 1). */
export async function searchAnime(searchQuery) {
    const encodedQuery = encodeURIComponent(searchQuery.trim());
    const url = `${BASE_URL_1}?page=1&size=20&search=${encodedQuery}`;
    return rapidApiFetch(url, API_KEY_1, API_HOST_1);
}

/** Search function for MANGA (API 2) */
export async function searchManga(searchQuery) {
    const url = `${BASE_URL_2}?page=1&limit=20&type=all`; 
    
    const data = await rapidApiFetch(url, API_KEY_2, API_HOST_2);

    if (data && data.length > 0) {
        if (searchQuery) {
            const results = data.filter(manga => 
                manga.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return results.length > 0 ? results : data;
        }
    }
    
    return data;
}