import axios from 'axios';
import fs from 'fs/promises';

const BASE_URL = 'https://api.easysbc.io';
const CARDS_ENDPOINT = (page) => `/players?page=${page}`;
const BATCH_SIZE = 100;

async function fetchPage(page) {
	try {
		const res = await axios.get(BASE_URL + CARDS_ENDPOINT(page));
		console.log(`✔️ Page ${page} fetched (${res.data?.players?.length ?? 0} cards)`);
		return res.data?.players ?? [];
	} catch (err) {
		console.error(`❌ Error on page ${page}: ${err.message}`);
		return [];
	}
}

async function fetchInBatches(totalPages) {
	let allCards = [];

	for (let i = 1; i <= totalPages; i += BATCH_SIZE) {
		const end = Math.min(i + BATCH_SIZE - 1, totalPages);
		const batchPages = Array.from({ length: end - i + 1 }, (_, idx) => i + idx);
		console.log(`🔄 Fetching pages ${i} to ${end} in parallel...`);

		const results = await Promise.all(batchPages.map(fetchPage));
		allCards.push(...results.flat());

		// Optional: Kurze Pause nach jeder Runde
		await new Promise((r) => setTimeout(r, 1000)); // 1 Sekunde
	}

	return allCards;
}

async function main() {
	try {
		console.log('🔎 Fetching page 1 to determine totalPages...');
		const first = await axios.get(BASE_URL + CARDS_ENDPOINT(1));
		const totalPages = first.data?.totalPages ?? 1;
		const allCards = first.data?.players ?? [];

		console.log(`📄 totalPages = ${totalPages}, starting batch fetch...`);

		const remainingCards = await fetchInBatches(totalPages);
		allCards.push(...remainingCards);

		await fs.writeFile('cards.json', JSON.stringify(allCards, null, 2));
		console.log(`✅ Saved ${allCards.length} cards to cards.json`);
	} catch (err) {
		console.error('❌ Fatal error:', err.message);
	}
}

main();
