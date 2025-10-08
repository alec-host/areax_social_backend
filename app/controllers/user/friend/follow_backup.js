const { Sequelize } = require('sequelize');
const { db2 } = require("../../../models");
const { getCache, setCache, deleteCache, connectToRedis, closeRedisConnection } = require('../../../cache/redis');

const Friends = db2.friends;

const CACHE_TTL_SECONDS = 300;

function isEmptyConnectionList(userCategories = {}) {
  const followers = Array.isArray(userCategories.followers) ? userCategories.followers : [];
  const following = Array.isArray(userCategories.following) ? userCategories.following : [];
  const innerCircle = Array.isArray(userCategories.inner_circle) ? userCategories.inner_circle : [];

  return followers.length === 0 && following.length === 0 && innerCircle.length === 0;
}

async function getConnectionFollowList(userReferenceNumber, page = 1, limit = 10) {
  const cacheKey = `user:connections:${userReferenceNumber}:page:${page}:limit:${limit}`;
  const client = await connectToRedis();
  const offset = (page - 1) * limit;
  try {
      const cached = await getCache(client, cacheKey);
      if(cached) return [true, cached];
      const [followUserList,followingUserList,innerCircleUserList] = await Promise.all([
      // Users this user follows
      Friends.findAll({
        where: {
          reference_number: userReferenceNumber,
          friend_category: 'follow',
          status: 'accepted',
        },
        attributes: ['friend_reference_number','friend_name','friend_profile_picture_url'],
        offset,
        limit,
        raw: true
      }),
      // Users who follow this user
      Friends.findAll({
        where: {
          friend_reference_number: userReferenceNumber,
          friend_category: 'follow',
          status: 'accepted',
        },
        attributes: ['friend_reference_number','friend_name','friend_profile_picture_url'],
        offset,
        limit,
        raw: true
      }),
      // Users who are in the inner-circle
      Friends.findAll({
        where: {
          friend_reference_number: userReferenceNumber,
          friend_category: 'inner-circle',
          status: 'accepted',
        },
        attributes: ['friend_reference_number','friend_name','friend_profile_picture_url'],
        offset,
        limit,
        raw: true
      })
    ]);

    const connectionList = {
      user_reference_number: userReferenceNumber,
      user_categories: {
         followers: followUserList,
         //following: followingUserList,
         //inner_circle: innerCircleUserList
      },
      pagination: { page, limit },
    };

    if(isEmptyConnectionList(connectionList.user_categories)) {
       return [false, 'not_found'];
    }

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
