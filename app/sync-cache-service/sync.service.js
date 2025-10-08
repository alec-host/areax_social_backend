const { db2 } = require("../models");

const Friends = db2.friends;

const { getFriendListByReferenceNumber } = require("../controllers/user/friend/get.friends.js");

const { connectToRedis, closeRedisConnection, setCache, deleteCache } = require("../cache/redis");

const updateSingleFriendDetailsCache = async(email) => {
    try{
       const client = await connectToRedis();
       await getFriendListByReferenceNumber(email,async user => {
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

Friends.afterUpdate(async (user) => {
   await updateSingleFriendDetailsCache(user?.email)
});
Friends.afterCreate(async (user) => {
   await updateSingleFriendDetailsCache(user?.email);
});
Friends.afterDestroy(async (user) => {
    const client = await connectToRedis();
    await deleteCache(client,`myfriend:${user[0].email}`);
    await closeRedisConnection(client);
});

module.exports = { updateSingleFriendDetailsCache };
