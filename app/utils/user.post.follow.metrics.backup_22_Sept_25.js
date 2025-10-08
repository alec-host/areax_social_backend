const { Sequelize,Op } = require('sequelize');
const { db2 } = require("../models");
const { getCache, setCache, deleteCache, connectToRedis, closeRedisConnection } = require('../cache/redis');

const Wall = db2.wall;
const Friends = db2.friends;
const FriendConnectionRequest = db2.queued_friends_requests;

const CACHE_TTL_SECONDS = 300;

async function getInitiatorReferenceNumber(targetReferenceNumber) {
  try{
      const data = await Friends.findOne({
        where: { friend_reference_number: targetReferenceNumber }
      });

      if(!data){
        return null;
      }

      return data.reference_number;	  
  }catch(e){
      console.error('Error fetching initiator reference number:', e.message);	  
      return null;
  }
}

async function getUserActivityMetrics(initiatorReferenceNumber,targetReferenceNumber,username=null,profile_status=null){	
  const cacheKey = `social-profile:metrics:${initiatorReferenceNumber}:${targetReferenceNumber}`;	
  const client = await connectToRedis();	
  try {
    const cached = await getCache(client, cacheKey);
    if(cached) return cached;
     
    if(!initiatorReferenceNumber){
       return [false,'Initiator/Recipient reference number is missing.'];
    }
	  
    const [postCount, followCount, innerCircleCount, pendingRequestCount, activeConnectionCount, initiatorConnectionCount, recipientConnectionCount] = await Promise.all([
      // Users posts	    
      Wall.count({
        where: {
          post_type: 'social-board',
          reference_number: targetReferenceNumber,
          is_deleted: 0
        }
      }),
      // Users this user follows
      Friends.count({
        where: {
           [Op.and]: [
               { reference_number: initiatorReferenceNumber },
               { friend_reference_number: targetReferenceNumber }
           ],
          friend_category: 'follow',
          status: 'accepted'
        }
      }),
      // Users who are in the inner-circle
      Friends.count({
        where: {
          friend_reference_number: targetReferenceNumber,
          friend_category: 'inner-circle',
          status: 'accepted'
        }
      }),
      // Users pending request.
      Friends.count({
        where: {
           [Op.and]: [
               { reference_number: initiatorReferenceNumber },
               { friend_reference_number: targetReferenceNumber }
           ],
           status: 'pending'		
	}
      }),
      Friends.count({
        where: {
           [Op.and]: [
               { reference_number: initiatorReferenceNumber },
               { friend_reference_number: targetReferenceNumber }
           ],
           status: 'accepted'		
        }
      }),	    
      FriendConnectionRequest.count({
        where: {
           [Op.and]: [
               { reference_number: targetReferenceNumber },
               { originator_reference_number: initiatorReferenceNumber }
           ],
        }
      }),
      Friends.count({
        where: {
           [Op.and]: [
               { reference_number: targetReferenceNumber },
               { friend_reference_number: initiatorReferenceNumber }
           ],
           status: 'accepted'
        }
      }),	    
    ]);

    let follow = 0; 
    console.log('PENDIN REQUEST ', pendingRequestCount);
    console.log('ACTIVE CONNECTION ',activeConnectionCount);  
    console.log('DDDDDDDDDDDDDDDDDD ',initiatorConnectionCount);
	  
    if(pendingRequestCount === 0){    
       if(initiatorConnectionCount === 0){     
          //-.recipient
	  if(recipientConnectionCount === 0){
	     follow = 2;
	     console.log('VAALLLLLLLLLLLLL,  ',11111111);	  
	  }else{
             follow = 0;
	     console.log('SMALLLLLLLLLLLLL,  ',55555555, '  ', follow); 
	  } 
       }else{
          //-.initiator
	  follow = 2;
	  //console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxwwwwwwsssss,  ',recipientConnectionCount);     
       }
       if(activeConnectionCount === 1){
	  //-.initiator     
          follow = 1;
       }	    
    }else{
       if(activeConnectionCount === 0){
          if(initiatorConnectionCount === 0){	    
             follow = 2;
          }else{
	     follow = 0;     
             console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxx');
          }
       }	  
    }
   
    console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA ',!followCount);	  
    const metrics = {
       name: username,	    
       recipient_reference_number: initiatorConnectionCount === 1 ? targetReferenceNumber : (initiatorConnectionCount === 0 && activeConnectionCount === 1 ? targetReferenceNumber : initiatorReferenceNumber),
       initiator_reference_number: initiatorConnectionCount === 1 ? initiatorReferenceNumber : (initiatorConnectionCount === 0 && activeConnectionCount === 1 ? initiatorReferenceNumber : targetReferenceNumber),
       posts_by_user: postCount,
       connection_status: follow,	  
       profile_status: profile_status,	    
       friend_category_counts: {
          follow: followCount,
          following: recipientConnectionCount,
          inner_circle: innerCircleCount
       } 	    
    };
    await setCache(client,cacheKey,metrics,CACHE_TTL_SECONDS);	  
    return metrics;
  }catch(error){
    console.error('Error fetching user connection activity:', error);
    return [false,'Failed to retrieve user activity'];
  }finally{
    if(client){
       await deleteCache(client,cacheKey);      
    }
  }
}

module.exports = { getUserActivityMetrics };
