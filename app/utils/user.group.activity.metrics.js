const { AreaXWall, AreaXComments } = require('../models');

const { Sequelize } = require('sequelize');
const { db2 } = require("../models");
const { getCache, setCache, deleteCache, connectToRedis, closeRedisConnection } = require('../cache/redis');

const Wall = db2.wall;
const Comments = db2.comments;
const GroupMembers = db2.members;

const CACHE_TTL_SECONDS = 5; // 5 minutes

async function getUserGroupActivity(groupReferenceNumber, userReferenceNumber) {
  const cacheKey = `user:group:activity:${groupReferenceNumber}:${userReferenceNumber}`;
  const client = await connectToRedis();
  // Check cache
  const cached = await getCache(client,cacheKey);
  if(cached) {
     return cached;
  }	
  try {
    const [postCount, commentCount, groupMember] = await Promise.all([
      Wall.count({
        where: {
          group_reference_number: groupReferenceNumber,
          reference_number: userReferenceNumber,
          is_deleted: 0
        }
      }),
      Comments.count({
        where: {
          group_reference_number: groupReferenceNumber,
          commentor_reference_number: userReferenceNumber,
          is_deleted: 0
        }
      }),
      GroupMembers.findOne({
	attributes: ['joined_at'],      
        where: {
          group_reference_number: groupReferenceNumber,
          reference_number: userReferenceNumber,
          is_deleted: 0,
          is_active: 1		
        },
	raw: true       
      })	    
    ]);

    if(!groupMember || !groupMember.joined_at){
       return [false,`User is not a member of this Group`];
    }

    const metrics = {
      group_reference_number: groupReferenceNumber,
      user_reference_number: userReferenceNumber,
      created_at: groupMember?.joined_at,	    
      posts_by_user: postCount,
      comments_by_user: commentCount
    };

    // Store in cache
    await setCache(client,cacheKey,metrics,CACHE_TTL_SECONDS);
	  
    return [true,metrics];	  
  } catch (error) {
    console.error('Error fetching user group activity:', error);
    throw new Error('Failed to retrieve user group activity');
  }finally{
    if(client){
       await closeRedisConnection(client);
    }
  }
}

module.exports = { getUserGroupActivity };
