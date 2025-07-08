import axios from 'axios';
import fs from 'fs/promises';

const BASE_URL = 'https://api.easysbc.io';
const CARDS_ENDPOINT = (page) => `/players?page=${page}`;

async function fetchAndStoreData() {
	try {
		console.log('<< Initial fetch to determine total pages... >>');
		const firstResponse = await axios.get(BASE_URL + CARDS_ENDPOINT(1));
		const totalPages = firstResponse.data?.totalPages ?? 1;
		const allCards = firstResponse.data?.players ?? [];

		console.log(`Found ${totalPages} total pages. Starting full fetch...`);
		
		for (let page = 2; page <= totalPages; page++) {
			console.log(`<< Fetching player cards from page ${page}... >>`);
			const response = await axios.get(BASE_URL + CARDS_ENDPOINT(page));
			const cards = response.data?.players ?? [];
			console.log(`Fetched ${cards.length} cards from page ${page}.`);

			allCards.push(...cards);
		}

		// Speichern direkt ins Projekt-Root
		await fs.writeFile('cards.json', JSON.stringify(allCards, null, 2));
		console.log(`Saved ${allCards.length} cards to cards.json`);
	} catch (error) {
		console.error('Error during fetch or file write:', error.message);
	}
}

fetchAndStoreData();
