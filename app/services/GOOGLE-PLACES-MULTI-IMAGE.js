const axios = require('../utils/axios.instance');
const { connectToRedis, closeRedisConnection } = require('../cache/redis');

const { GOOGLE_PLACE_KEY } = require('../constants/app_constants');

const API_KEY = GOOGLE_PLACE_KEY;

function shuffleArray(array) {
  return array
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(({ v }) => v);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * New: get multiple nearby place photos around a user location.
 * Returns up to `count` unique photos (one per place), avoiding places already shown
 * to the same reference_number (tracked via Redis).
 */
async function getNearbyPlacePhotos(
  reference_number,
  lat,
  lng,
  radius = 1000,
  types = [],
  count = 5
) {
  const redisKey = `shown:${reference_number}`;

  // Load already-shown place_ids
  let shownPlaceIds = [];
  try {
    const client = await connectToRedis();
    shownPlaceIds = await client.sMembers(redisKey);
    await closeRedisConnection(client);
  } catch (err) {
    console.error('Redis smembers failed:', err);
  }
  const shownSet = new Set(shownPlaceIds);

  // Favor common photo-heavy place types if none provided (keeps old behavior when types passed)
  const typeList =
    Array.isArray(types) && types.length
      ? types
      : ['tourist_attraction', 'park', 'museum', 'art_gallery', 'cafe', 'restaurant'];

  // Gather unshown places (with photos) across types, with limited pagination to ensure we can hit `count`
  const allResults = [];

  for (const type of typeList) {
    let pageToken = null;
    let pagesFetched = 0;
    do {
      try {
        const params = {
          location: `${lat},${lng}`,
          radius,
          key: API_KEY,
          type,
        };
        if (pageToken) params.pagetoken = pageToken;

        const nearbyRes = await axios.get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
          { params }
        );

        const results = (nearbyRes.data && nearbyRes.data.results) || [];
        for (const p of results) {
          if (p.photos && !shownSet.has(p.place_id)) {
            allResults.push(p);
          }
        }

        pageToken = nearbyRes.data && nearbyRes.data.next_page_token ? nearbyRes.data.next_page_token : null;
        pagesFetched += 1;

        // Google may take a moment to activate next_page_token
        if (pageToken && allResults.length < count) {
          await sleep(2000);
        }
      } catch (err) {
        console.error(`Failed for type ${type}:`, err.message);
        break;
      }
    } while (pageToken && pagesFetched < 3 && allResults.length < count);

    if (allResults.length >= count) break;
  }

  if (allResults.length === 0) return [];

  // Randomize and pick up to `count` distinct places
  const shuffled = shuffleArray(allResults);
  const selectedPlaces = shuffled.slice(0, Math.min(count, shuffled.length));

  const images = selectedPlaces.map((p) => {
    const photoRef = p.photos[0].photo_reference;
    const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photoRef}&key=${API_KEY}`;
    return {
      imageUrl,
      placeName: p.name,
      location: p.vicinity,
      placeId: p.place_id,
    };
  });

  // Record all shown place_ids for this reference_number (30-day TTL)
  try {
    const client = await connectToRedis();
    if (selectedPlaces.length) {
      await client.sAdd(redisKey, ...selectedPlaces.map((p) => p.place_id));
      await client.expire(redisKey, 60 * 60 * 24 * 30);
    }
    await closeRedisConnection(client);
  } catch (err) {
    console.error('Redis sadd/expire failed:', err);
  }

  return images;
}

/**
 * Original API maintained:
 * Still returns a single image object (or null), now implemented via the new plural helper.
 */
async function getNearbyPlacePhoto(reference_number, lat, lng, radius = 1000, types = []) {
  const photos = await getNearbyPlacePhotos(reference_number, lat, lng, radius, types, 1);
  return photos[0] || null;
}

module.exports = { getNearbyPlacePhoto, getNearbyPlacePhotos };

