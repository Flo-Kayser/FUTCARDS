// fetch-coredata.js
import axios from 'axios';
import fs from 'fs/promises';

const FUT_URL = 'https://www.fut.gg/api/fut/25/fut-core-data/';

async function fetchAndStoreCoreData() {
	try {
		console.log('<< Fetching core data from fut.gg... >>');
		const res = await axios.get(FUT_URL);

		if (!res?.data) {
			throw new Error('❌ Keine Daten von fut.gg empfangen');
		}

		const fullData = res.data;


		// Speichern
		await fs.writeFile('coreData.json', JSON.stringify(fullData, null, 2));
		console.log(`✅ Saved ${coreData.nations.length} nations and ${coreData.rarities.length} rarities to coredata.json`);
	} catch (error) {
		console.error('❌ Fehler beim Abrufen oder Schreiben:', error.message);
	}
}

fetchAndStoreCoreData();
