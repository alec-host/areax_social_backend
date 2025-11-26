const { db2 } = require("../../../models");

const Collections = db2.collections;
const CollectionInvites = db2.collections.invite;

module.exports.getCollectionAccessStatus = async (email,reference_number,collection_reference_number) => {
  try{	
     const countOwner = await Collections.count({where:{ creator_reference_number: reference_number,collection_reference_number }});
     if(countOwner === 1){
        return [true,{ collection_name: 'COLLECTION_NAME', status: 'accepted', created_at: new Date() }];
     }     	  
     const count = await CollectionInvites.count({where:{ email,reference_number,collection_reference_number }});
     if(count > 0){
        const countOwner = await Collections.count({where:{ creator_reference_number: reference_number,collection_reference_number }})	    
        const record = await CollectionInvites.findOne({
           attributes:['collection_name', 'status', 'created_at'],
           where:{
               email: email,
               reference_number: reference_number,
	       collection_reference_number: collection_reference_number,
           },
	   raw: true    
        });
        return [true,record];
    }else{
        return [false,'You’re not allowed to perform this action — you don’t have an invite to this collection.'];
    }

  }catch(error){
     console.error(`Unable to determine whether you have accepted the collection invite`, error);
     return [false,`Unable to determine whether you have accepted the collection invite.`];
  }
};
