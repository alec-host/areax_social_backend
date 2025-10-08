const redis = require('redis');

const connectToRedis = async () => {
    const client = redis.createClient({
        url: 'redis://localhost:6379'
    });

    client.on('error', (err) => {
        console.error('Redis Client Error', err);
        return null;
    });

    try{
        await client.connect();
        console.log('Connected to Redis');
        return client;
    }catch(err){
        console.error('Error connecting to Redis', err);
        return null;
    }
};

const closeRedisConnection = async (client) => {
    await client.quit();
    console.log('Disconnected from Redis');
};

const setCache = async (client, key, value, ttl = 86400) => {
    try {
        await client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
        console.error("Error setting cache:", error);
    }
};

const getCache = async (client,key) => {
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Error getting cache:", error);
        return null;
    }
};

const deleteCache = async (client,key) => {
    try {
        await client.del(key);
    } catch (error) {
        console.error("Error deleting cache:", error);
    }
};

const scanWildcardKeysPaginated = async(client, pattern = '*', count = 20) => {
  const decodedEntries = [];
  let cursor = '0';

  do {
    const result = await client.scan(cursor, {
      MATCH: pattern,
      COUNT: count
    });

    cursor = result.cursor;
   for (const key of result.keys) {
      const rawValue = await client.get(key);
      try {
        const parsed = JSON.parse(rawValue);
	const parsedValue = Array.isArray(parsed) ? parsed[0] : parsed;      
        decodedEntries.push(parsedValue);
      } catch (err) {
        // fallback for non-JSON values
        decodedEntries.push({ rawValue });
      }
    } 
  } while (cursor !== '0');

  return decodedEntries;
};

// New functions for social wall caching
const generateSocialWallKey = (postType, isPublic, page, limit, email, referenceNumber) => {
    return `social_wall:${postType}:${isPublic}:${page}:${limit}:${email}:${referenceNumber}`;
};

// 
const generateGroupSocialWallKey = (postType, isPublic, group_reference_number, page, limit, email, referenceNumber) => {
    return `group_social_wall:${postType}:${isPublic}:${group_reference_number}:${page}:${limit}:${email}:${referenceNumber}`;
};

const generateUserDataKey = (type, email, referenceNumber) => {
    return `${type}:${email}:${referenceNumber}`;
};

const setSocialWallCache = async (client, postType, isPublic, page, limit, email, referenceNumber, data) => {
    const key = generateSocialWallKey(postType, isPublic, page, limit, email, referenceNumber);
    await setCache(client, key, data, 1800); // 30 minutes TTL
    return key;
};

const getSocialWallCache = async (client, postType, isPublic, page, limit, email, referenceNumber) => {
    const key = generateSocialWallKey(postType, isPublic, page, limit, email, referenceNumber);
    return await getCache(client, key);
};

const setGroupSocialWallCache = async (client, postType, isPublic, group_reference_number, page, limit, email, referenceNumber, data) => {
    const key = generateGroupSocialWallKey(postType, isPublic, group_reference_number, page, limit, email, referenceNumber);
    await setCache(client, key, data, 1800); // 30 minutes TTL
    return key;
};

const getGroupSocialWallCache = async (client, postType, isPublic, group_reference_number, page, limit, email, referenceNumber) => {
    const key = generateGroupSocialWallKey(postType, isPublic, group_reference_number, page, limit, email, referenceNumber);
    return await getCache(client, key);
};

const setUserDataCache = async (client, type, email, referenceNumber, data) => {
    const key = generateUserDataKey(type, email, referenceNumber);
    await setCache(client, key, data, 300); // 5 minutes TTL
    return key;
};

const getUserDataCache = async (client, type, email, referenceNumber) => {
    const key = generateUserDataKey(type, email, referenceNumber);
    return await getCache(client, key);
};

const invalidateUserCache = async (client, email, referenceNumber) => {
    const patterns = [
        `social_wall:*:${email}:${referenceNumber}`,
        `user_likes:${email}:${referenceNumber}`,
        `user_saved:${email}:${referenceNumber}`,
        `user_reported:${email}:${referenceNumber}`
    ];

    for (const pattern of patterns) {
        try {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
                console.log(`Invalidated ${keys.length} cache keys for pattern: ${pattern}`);
            }
        } catch (error) {
            console.error('Cache invalidation error:', error);
        }
    }
};

const invalidateGroupUserCache = async (client, email, referenceNumber) => {
    const patterns = [
        `group_social_wall:*:${email}:${referenceNumber}`,
        `user_group_likes:${email}:${referenceNumber}`,
        `user_group_saved:${email}:${referenceNumber}`,
        `user_group_reported:${email}:${referenceNumber}`
    ];

    for (const pattern of patterns) {
        try {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
                console.log(`Invalidated ${keys.length} cache keys for pattern: ${pattern}`);
            }
        } catch (error) {
            console.error('Cache invalidation error:', error);
        }
    }
};

const invalidatePostCache = async (client, postId) => {
    const patterns = [
        'social_wall:*',
        `post_likes:${postId}:*`,
        `post_comments:${postId}:*`
    ];

    for (const pattern of patterns) {
        try {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
                console.log(`Invalidated ${keys.length} cache keys for pattern: ${pattern}`);
            }
        } catch (error) {
            console.error('Cache invalidation error:', error);
        }
    }
};

const invalidateGroupPostCache = async (client, postId) => {
    const patterns = [
        'group_social_wall:*',
        `post_group_likes:${postId}:*`,
        `post_group_comments:${postId}:*`
    ];

    for (const pattern of patterns) {
        try {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
                console.log(`Invalidated ${keys.length} cache keys for pattern: ${pattern}`);
            }
        } catch (error) {
            console.error('Cache invalidation error:', error);
        }
    }
};

module.exports = { 
    connectToRedis, 
    closeRedisConnection,
    setCache,
    getCache,
    deleteCache,
    scanWildcardKeysPaginated,	
    setSocialWallCache,
    getSocialWallCache,
    setGroupSocialWallCache, 
    getGroupSocialWallCache,
    setUserDataCache,
    getUserDataCache,
    invalidateUserCache,
    invalidatePostCache,
    invalidateGroupUserCache,
    invalidateGroupPostCache	
};
