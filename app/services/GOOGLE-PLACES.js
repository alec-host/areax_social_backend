const axios = require('../utils/axios.instance');
const { connectToRedis, closeRedisConnection } = require('../cache/redis');

const { GOOGLE_PLACE_KEY } = require('../constants/app_constants');

const API_KEY = GOOGLE_PLACE_KEY;


function shuffleArray(array) {
  return array.map(v => ({ v, r: Math.random() }))
              .sort((a, b) => a.r - b.r)
              .map(({ v }) => v);
}

async function getNearbyPlacePhoto(reference_number, lat, lng, radius = 1000, types = []) {
  let allResults = [];
  
  const redisKey = `shown:${reference_number}`;	
  
  // Step 1: Find nearby places
  let shownPlaceIds = [];
  try{
     const client = await connectToRedis();
     shownPlaceIds = await client.sMembers(redisKey);
     await closeRedisConnection(client);	  
  }catch(error){
     console.error('Redis smembers failed:', err);
  }

  const shownSet = new Set(shownPlaceIds);	
  
  for(const type of types){
      try{
         const nearbyRes = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
         {
            params: {
              location: `${lat},${lng}`,
              radius,
              key: API_KEY,
              /*rankby: 'prominence',*/
              type,
           },
         });          

	 const unshown = nearbyRes.data.results.filter(
            p => p.photos && !shownSet.has(p.place_id)
	 );     
	    
	 allResults.push(...unshown);     
      }catch(err){
         console.error(`Failed for type ${type}:`, err.message);
      }
  }	

  if(allResults.length === 0) return null;

  const shuffled = shuffleArray(allResults);
  const selected = shuffled[0];

  try{
    const client = await connectToRedis();	  
    await client.sAdd(redisKey, selected.place_id);
    await client.expire(redisKey, 60 * 60 * 24 * 30); // 30 days TTL
    await closeRedisConnection(client);	  
  } catch (err) {
    console.error('Redis sadd/expire failed:', err);
  }  

  // Step 2: Get image URL
  const photoRef = selected.photos[0].photo_reference;
  const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photoRef}&key=${API_KEY}`;

  return {
    imageUrl,
    placeName: selected.name,
    location: selected.vicinity,
  };
}

module.exports = { getNearbyPlacePhoto };
