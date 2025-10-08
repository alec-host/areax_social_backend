const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');
const { db,db2 } = require("../../../models");
const { getCache, setCache, deleteCache, connectToRedis, closeRedisConnection } = require('../../../cache/redis');

const Friends = db2.friends;
const Users = db.users;

const CACHE_TTL_SECONDS = 300;

function isEmptyConnectionList(userCategories = {}) {
  const followers = Array.isArray(userCategories.followers) ? userCategories.followers : [];
  const following = Array.isArray(userCategories.following) ? userCategories.following : [];
  const innerCircle = Array.isArray(userCategories.inner_circle) ? userCategories.inner_circle : [];

  return followers.length === 0 && following.length === 0 && innerCircle.length === 0;
}

async function getConnectionFollowingList(userReferenceNumber, page = 1, limit = 10) {
  const cacheKey = `user:following:connections:${userReferenceNumber}:page:${page}:limit:${limit}`;
  const client = await connectToRedis();
  const offset = (page - 1) * limit;
  try {
      const cached = await getCache(client, cacheKey);
      if(cached) return [true, cached];

     // Step 1: Get reference_numbers of followed users	  
      const followed = await Friends.findAll({
         where: {
            friend_reference_number: userReferenceNumber,
            friend_category: 'follow',
            status: 'accepted',
         },
         attributes: ['email','reference_number'],
         offset,
         limit,
         raw: true
      });

      if(!followed.length) return [false, 'not_found'];
       
      const followedRefs = followed.map(f => f.reference_number);

      // Step 2: Fetch enriched user data
      const users = await Users.findAll({
         where: {
            reference_number: { [Op.in]: followedRefs },
         },
         attributes: ['reference_number','username' ,'display_name', 'profile_picture_url'],
         raw: true,
      });

      // Step 3: Map enriched data
      const userMap = Object.fromEntries(users.map(u => [u.reference_number, u]));
      const enrichedFollowing = followedRefs.map(ref => ({
         reference_number: ref,
         name: userMap[ref]?.username || userMap[ref]?.display_name || null,
         profile_picture_url: userMap[ref]?.profile_picture_url || null,
      }));

      // Step 4: Build response
      const connectionList = {
         user_reference_number: userReferenceNumber,
         user_categories: {
            following: enrichedFollowing,
         },
         pagination: { page, limit },
      };

      ///if(isEmptyConnectionList(connectionList.user_categories)){
      ///   return [false, 'not_found'];
      //}

      await setCache(client, cacheKey, connectionList, CACHE_TTL_SECONDS); // 5 min TTL

      return [true, connectionList];
  }catch(error){
    return [false,`Error: ${error.message}`];
  }finally{
    if(client){
       await closeRedisConnection(client);
    }
  }
};

module.exports = { getConnectionFollowingList };
