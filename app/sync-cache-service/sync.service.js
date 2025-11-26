const { db2 } = require("../models");

const Friends = db2.friends;

const { getFriendListByReferenceNumber } = require("../controllers/user/friend/get.friends.js");
const { getMyInnerCircleByReferenceNumber } = require("../controllers/user/friend/my.friend.js");

const { connectToRedis, closeRedisConnection, setCache, deleteCache } = require("../cache/redis");

const updateSingleFriendDetailsCache = async(reference_number) => {
    try{
       const client = await connectToRedis();
       await getFriendListByReferenceNumber(reference_number,async user => {
          if(user.length > 0){	  
              await setCache(client,`myfriend:${user[0].email}`, user);
          }else{
              console.log('No record found.');
          }
       await closeRedisConnection(client);
       });
    }catch(err){
        console.error(err.message);
    }
};

const updateSingleFriendInnerCircleDetailsCache = async(reference_number,friend_category) => {
    try{
       const client = await connectToRedis();
       await getMyInnerCircleByReferenceNumber(reference_number,friend_category,async user => {
          if(user.length > 0){
              await setCache(client,`myfriendInnerCircle:${user[0].email}`, user);
          }else{
              console.log('No record found.');
          }
       await closeRedisConnection(client);
       });
    }catch(err){
        console.error(err.message);
    }
};

Friends.afterUpdate(async (user) => {
   await updateSingleFriendDetailsCache(user?.reference_number);
   await updateSingleFriendInnerCircleDetailsCache(user?.reference_number,null);	
});
Friends.afterCreate(async (user) => {
   await updateSingleFriendDetailsCache(user?.reference_number);
   await updateSingleFriendInnerCircleDetailsCache(user?.reference_number,null);	
});
Friends.afterDestroy(async (user) => {
    const client = await connectToRedis();
    await deleteCache(client,`myfriend:${user[0].email}`);
    await deleteCache(client,`myfriendInnerCircle:${user[0].email}`);	
    await closeRedisConnection(client);
});

module.exports = { updateSingleFriendDetailsCache,updateSingleFriendInnerCircleDetailsCache };
