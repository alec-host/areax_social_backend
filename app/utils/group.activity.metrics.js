const { Sequelize } = require('sequelize');
const { db2 } = require("../models");
const { getCache, setCache, deleteCache, connectToRedis, closeRedisConnection } = require('../cache/redis');

const Wall = db2.wall;
const GroupMembers = db2.members;
const Comments = db2.comments;

const CACHE_TTL_SECONDS = 300; // 5 minutes

async function getGroupActivityMetrics(groupReferenceNumber) {
  const cacheKey = `group:activity:${groupReferenceNumber}`;
  const client = await connectToRedis();
  // Check cache
  const cached = await getCache(client,cacheKey);
  if(cached) {
     return cached;
  }
  try{
     // Compute fresh metrics
     const [memberCount, postCount, commentCount] = await Promise.all([
        GroupMembers.count({
           where: { group_reference_number: groupReferenceNumber, is_deleted: 0 }
        }),
        Wall.count({
           where: { group_reference_number: groupReferenceNumber, is_deleted: 0 }
        }),
        Comments.count({
           where: { group_reference_number: groupReferenceNumber, is_deleted: 0 }
        })
     ]);

     const engagementRate = memberCount > 0
        ? ((postCount + commentCount) / memberCount) * 100
        : 0;

     const metrics = {
        group_reference_number: groupReferenceNumber,
        total_members: memberCount,
        total_posts: postCount,
        total_comments: commentCount,
        engagement_percent: parseFloat(engagementRate.toFixed(2))
     };

     // Store in cache
     await setCache(client,cacheKey,metrics,CACHE_TTL_SECONDS);

     return metrics;
  }catch(error){
     console.error('Error fetching group activity:', error);
     return [false,'Failed to retrieve group activity'];  	  
  }finally{
     if(client){
        await closeRedisConnection(client);
     }
  }
}

module.exports = { getGroupActivityMetrics };
