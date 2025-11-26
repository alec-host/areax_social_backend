const { db2 } = require("../../../models");

const CollectionInvites = db2.collections.invite;

module.exports.getCollectionInviteList = async (email,reference_number) => {
  try {
    const count = await CollectionInvites.count({where:{ email: email,reference_number: reference_number }});
    if(count > 0){
       const record = await CollectionInvites.findAll({
           attributes:['name', 'email', 'reference_number', 'profile_picture_url', 'collection_reference_number', 'status', 'created_at'],
           where:{
               email: email,
               reference_number: reference_number,
           },
	   raw: true    
       });
       return [true,record];
    }else{
       return [false,[]];
    }

  } catch(error) {
    console.error('Error: fetching collection invite[s]', error);
    return [false,[],error?.message];
  }
};
