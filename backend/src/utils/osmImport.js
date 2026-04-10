const axios = require('axios');
const db = require('../config/db');
const { env } = require('../config/env');

const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const RADIUS_METERS     = 25000; // 25 km autour de chaque ville
const DELAY_BETWEEN_CITIES_MS = 300;

// Capitales des 48 wilayas algériennes + grandes agglomérations
const ALGERIAN_CITIES = [
  // --- Nord / Tell ---
  { name: 'Alger',              lat: 36.7372, lng:  3.0865 },
  { name: 'Oran',               lat: 35.6969, lng: -0.6331 },
  { name: 'Constantine',        lat: 36.3650, lng:  6.6147 },
  { name: 'Annaba',             lat: 36.9000, lng:  7.7667 },
  { name: 'Blida',              lat: 36.4703, lng:  2.8277 },
  { name: 'Batna',              lat: 35.5553, lng:  6.1742 },
  { name: 'Sétif',              lat: 36.1898, lng:  5.4108 },
  { name: 'Tlemcen',            lat: 34.8828, lng: -1.3159 },
  { name: 'Béjaïa',             lat: 36.7539, lng:  5.0564 },
  { name: 'Tizi Ouzou',         lat: 36.7169, lng:  4.0497 },
  { name: 'Sidi Bel Abbès',     lat: 35.1896, lng: -0.6306 },
  { name: 'Médéa',              lat: 36.2638, lng:  2.7539 },
  { name: 'Chlef',              lat: 36.1647, lng:  1.3315 },
  { name: 'Mostaganem',         lat: 35.9318, lng:  0.0892 },
  { name: 'Skikda',             lat: 36.8762, lng:  6.9063 },
  { name: 'Tiaret',             lat: 35.3706, lng:  1.3217 },
  { name: 'Guelma',             lat: 36.4617, lng:  7.4328 },
  { name: 'Souk Ahras',         lat: 36.2864, lng:  7.9509 },
  { name: 'Jijel',              lat: 36.8222, lng:  5.7667 },
  { name: 'Mascara',            lat: 35.3967, lng:  0.1400 },
  { name: "M'Sila",             lat: 35.7044, lng:  4.5397 },
  { name: 'Relizane',           lat: 35.7361, lng:  0.5558 },
  { name: 'Saïda',              lat: 34.8306, lng:  0.1525 },
  { name: 'El Tarf',            lat: 36.7667, lng:  8.3128 },
  { name: 'Tipaza',             lat: 36.5898, lng:  2.4469 },
  { name: 'Aïn Defla',          lat: 36.2600, lng:  1.9667 },
  { name: 'Aïn Témouchent',     lat: 35.2981, lng: -1.1386 },
  { name: 'Bordj Bou Arreridj', lat: 36.0731, lng:  4.7631 },
  { name: 'Boumerdès',          lat: 36.7625, lng:  3.4775 },
  { name: 'Bouira',             lat: 36.3706, lng:  3.9006 },
  { name: 'Khenchela',          lat: 35.4258, lng:  7.1456 },
  { name: 'Mila',               lat: 36.4500, lng:  6.2653 },
  { name: 'Oum El Bouaghi',     lat: 35.8756, lng:  7.1128 },
  { name: 'Tébessa',            lat: 35.4044, lng:  8.1197 },
  { name: 'Souk El Haad',       lat: 35.9000, lng:  2.9500 },
  // --- Hauts Plateaux / Semi-aride ---
  { name: 'Biskra',             lat: 34.8482, lng:  5.7281 },
  { name: 'Naâma',              lat: 33.2681, lng: -0.3122 },
  { name: 'Laghouat',           lat: 33.8000, lng:  2.8653 },
  { name: 'Djelfa',             lat: 34.6700, lng:  3.2600 },
  { name: 'El Bayadh',          lat: 33.6833, lng:  1.0167 },
  // --- Grand Sud ---
  { name: 'Ghardaïa',           lat: 32.4894, lng:  3.6731 },
  { name: 'Ouargla',            lat: 31.9539, lng:  5.3242 },
  { name: 'El Oued',            lat: 33.3681, lng:  6.8674 },
  { name: 'Béchar',             lat: 31.6238, lng: -2.2168 },
  { name: 'Adrar',              lat: 27.8742, lng: -0.2892 },
  { name: 'In Salah',           lat: 27.1979, lng:  2.4697 },
  { name: 'Tindouf',            lat: 27.6744, lng: -8.1375 },
  { name: 'Tamanrasset',        lat: 22.7851, lng:  5.5228 },
  { name: 'Illizi',             lat: 26.4833, lng:  8.4833 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Types qui indiquent clairement que le lieu n'est PAS un DAB → rejet total
const REJECT_TYPES = new Set([
  'restaurant', 'food', 'cafe', 'bar', 'meal_takeaway', 'meal_delivery',
  'bakery', 'night_club', 'lodging', 'beauty_salon', 'hair_care',
  'school', 'university', 'hospital', 'doctor', 'dentist',
  'movie_theater', 'amusement_park', 'stadium', 'gym', 'spa',
  'mosque', 'church', 'place_of_worship',
]);

// Types qui indiquent un ATM intégré dans un autre établissement → review admin
const AMBIGUOUS_TYPES = new Set([
  'supermarket', 'grocery_or_supermarket', 'store', 'clothing_store',
  'convenience_store', 'department_store', 'shopping_mall',
  'gas_station', 'pharmacy', 'drugstore', 'post_office',
  'airport', 'train_station', 'bus_station', 'transit_station',
]);

/**
 * Classifie un lieu retourné par Google Places pour type=atm.
 * @returns {'accept' | 'review' | 'reject'}
 */
const classifyATM = (types = []) => {
  if (!types.includes('atm')) return 'reject';
  if (types.some(t => REJECT_TYPES.has(t))) return 'reject';
  if (types.some(t => AMBIGUOUS_TYPES.has(t))) return 'review';
  return 'accept';
};

/**
 * Récupère une page de résultats Google Places.
 */
const fetchPage = async (params) => {
  const response = await axios.get(GOOGLE_PLACES_URL, {
    params: { ...params, key: env.GOOGLE_PLACES_API_KEY },
    timeout: 15000,
  });
  return response.data;
};

/**
 * Récupère tous les résultats (pagination automatique via next_page_token).
 */
const fetchAllPlaces = async (lat, lng, type) => {
  const results = [];
  let data = await fetchPage({ location: `${lat},${lng}`, radius: RADIUS_METERS, type });
  results.push(...(data.results || []));

  while (data.next_page_token) {
    await sleep(2000); // Google exige ~2s avant d'utiliser le next_page_token
    data = await fetchPage({ pagetoken: data.next_page_token });
    results.push(...(data.results || []));
  }

  return results;
};

/**
 * Importe ou met à jour les DAB et agences bancaires pour les 48 wilayas algériennes.
 * @returns {{ total, inserted, updated, errors, cities }}
 */
const syncGooglePlaces = async () => {
  const seen   = new Set();
  const places = [];
  let cityErrors = 0;

  for (const city of ALGERIAN_CITIES) {
    try {
      const [atms, banks] = await Promise.all([
        fetchAllPlaces(city.lat, city.lng, 'atm'),
        fetchAllPlaces(city.lat, city.lng, 'bank'),
      ]);
      await sleep(DELAY_BETWEEN_CITIES_MS);

      for (const p of atms.map(x => ({ ...x, _type: 'atm' }))) {
        if (!seen.has(p.place_id)) { seen.add(p.place_id); places.push(p); }
      }
      for (const p of banks.map(x => ({ ...x, _type: 'bank' }))) {
        if (!seen.has(p.place_id)) { seen.add(p.place_id); places.push(p); }
      }

      console.log(`[import] ${city.name} — atm:${atms.length} bank:${banks.length}`);
    } catch (err) {
      console.error(`[import] Erreur pour ${city.name}:`, err.message);
      cityErrors++;
    }
  }

  console.log(`[import] ${places.length} lieux uniques — insertion en cours…`);

  let inserted = 0;
  let updated  = 0;
  let skipped  = 0;
  let errors   = 0;

  for (const place of places) {
    try {
      const typeLieu = place._type === 'bank' ? 'agence' : 'atm';

      // Filtrage qualité : uniquement pour les ATM
      let isVerified = true;
      if (place._type === 'atm') {
        const classification = classifyATM(place.types || []);
        if (classification === 'reject') {
          skipped++;
          continue;
        }
        if (classification === 'review') {
          isVerified = false; // nécessite validation admin
        }
      }

      const result = await db.query(
        `INSERT INTO dabs (osm_id, nom, adresse, latitude, longitude, statut, type_lieu, source, is_verified)
         VALUES ($1, $2, $3, $4, $5, 'actif', $6, 'google_places', $7)
         ON CONFLICT (osm_id) DO UPDATE SET
           nom        = EXCLUDED.nom,
           adresse    = EXCLUDED.adresse,
           latitude   = EXCLUDED.latitude,
           longitude  = EXCLUDED.longitude,
           type_lieu  = EXCLUDED.type_lieu,
           updated_at = NOW()
         RETURNING (xmax = 0) AS is_insert`,
        [
          `google_${place.place_id}`,
          place.name || 'DAB sans nom',
          place.vicinity || null,
          place.geometry.location.lat,
          place.geometry.location.lng,
          typeLieu,
          isVerified,
        ]
      );
      if (result.rows[0]?.is_insert) inserted++;
      else updated++;
    } catch (err) {
      if (errors === 0) console.error('[import] Première erreur SQL :', err.message);
      errors++;
    }
  }

  return {
    total: places.length,
    inserted,
    updated,
    skipped,
    errors,
    cities: ALGERIAN_CITIES.length - cityErrors,
  };
};

module.exports = { syncGooglePlaces };
