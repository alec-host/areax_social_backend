const { Op } = require('sequelize');
const { db2 } = require("../../../models");

const Wall = db2.wall;
const SavedPosts = db2.saved_posts;

module.exports.removeSavedPost = async (data) => {
  try{
    const deletedRows = await SavedPosts.destroy(
      {
        where: {
          post_id: data.post_id,
          email: data.email,
          reference_number: data.reference_number
        },
      }
    );
    const where = { post_id: data.post_id, collection_reference_number: { [Op.ne]: null } };
    if(deletedRows > 0){
       const [updatedCount] = await Wall.update({ collection_reference_number: null },{ where });	    
       console.log(`Post with ID ${data.post_id} successfully deleted.`);
       return [true,'Post has been removed successfully.'];
    }else{
       console.log(`No matching post found with ID ${data.post_id}.`);
       return [false,'No matching post found to delete.'];
    }
  }catch(error){
     console.error('Error deleting post:', error.message);
     return [false, error.message];
  }
};
