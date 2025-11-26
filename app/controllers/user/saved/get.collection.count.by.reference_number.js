const { db2 } = require("../../../models");

const Wall = db2.wall;
const Collections = db2.collections;

module.exports.preSaveToCollectionVerification = async(post_id,referenceNumber) => {
    try{
       const result = await Wall.findOne({ attributes: ['collection_reference_number'], where:{ post_id },raw: true });	   
       if(result.collection_reference_number){
          return [false,`Post is already saved in an existing collection`];
       }    
       const count = await Collections.count({ where:{ collection_reference_number:referenceNumber } });    
       return [true,count];
    }catch(error){	    
       return [false,`Error: `];
    }
};
