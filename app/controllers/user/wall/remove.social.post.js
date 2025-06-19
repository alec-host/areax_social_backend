const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.removeSocialPost = async(payload) => {
  try{
    const deletedRows = await Wall.destroy(
      {
        where: {
           post_id: payload.post_id, reference_number: payload.reference_number 
        },
      }
    );

    if(deletedRows > 0){
       console.log(`Post with  ID ${payload.post_id} successfully deleted.`);
       return [true,'Post deleted successfully.'];
    }else{
       console.log(`No matching post found with ID ${payload.post_id}.`);
       return [false,'No matching post found to delete.'];
    }
  }catch(error){
     console.error('Error deleting post:', error.message);
     return [false, error.message];
  }
};
