const { db2 } = require("../../../models");

const CollectionInvites = db2.collections.invite;

module.exports.acceptRejectInvite = async(payload) => {
    const reference_number = payload.reference_number;
    const is_accepted = payload.is_accepted;	
    const collection_reference_number = payload.collection_reference_number;
    try{
       const [isUpdated] = await CollectionInvites.update({ status: is_accepted === 1 ? 'accepted' : 'rejected' },{ where:{ collection_reference_number, reference_number } });
       if(isUpdated === 0){
          return false;
       }
       return true;
    }catch(error){
       console.log('ERROR: ', error?.message);
       return false;
    }
};

module.exports.getCollectionInviteStatus = async(payload) => {
   const reference_number = payload.reference_number;
   const collection_reference_number = payload.collection_reference_number;	
   try{
      const data = await CollectionInvites.findOne({
	                    where:{ collection_reference_number, reference_number },     
                            attributes: ['status'],
                            raw: true			 
                         });
      return [true,data.status];
   }catch(error){
      console.log('ERROR: ', error?.message);	   
      return [false,`Error: `];
   }
};
