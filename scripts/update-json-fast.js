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

		console.log(`Found ${totalPages} total pages. Fetching remaining pages in parallel...`);

		// Alle Seiten ab Seite 2 vorbereiten
		const fetchPromises = [];
		for (let page = 2; page <= totalPages; page++) {
			fetchPromises.push(
				axios.get(BASE_URL + CARDS_ENDPOINT(page)).then(res => res.data?.players ?? [])
			);
		}

		// Parallel ausführen
		const results = await Promise.all(fetchPromises);

		// Alle Karten zusammenführen
		for (const cards of results) {
			allCards.push(...cards);
		}

		await fs.writeFile('cards.json', JSON.stringify(allCards, null, 2));
		console.log(`✅ Done! Saved ${allCards.length} cards to cards.json`);
	} catch (error) {
		console.error('❌ Error during fetch or file write:', error.message);
	}
}

fetchAndStoreData();
