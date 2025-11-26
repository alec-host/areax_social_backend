const { db2, sequelize2 } = require("../../../models");

const Wall = db2.wall;

module.exports.savePostToCollection = async (data) => {
  //const transaction = await sequelize2.transaction();
  try{
     const [updatedCount] = await Wall.update(
        { collection_reference_number: data.collection_reference_number },
        { where: { post_id: data.post_id, collection_reference_number: null } }
     );

     if(!updatedCount || updatedCount === 0) {
        // nothing was updated
        return [false, 'No rows updated (post_id not found or value unchanged)'];
     }
	  
     return [true,'Post added to a collection.'];
  }catch(error){
     console.error('Error: failed to add post to a collection:', error.message);
     return [false,error.message];
  }
};
