const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.deleteBuyItem = async(post_id) => {
  try {
      const deletedRows = await Wall.destroy(
          {
              where: {
                 post_id: post_id
              },
          }
      );
      if(deletedRows > 0){
          return [true,'Item deleted successfully.'];
      }else{
          return [false,'No record found'];
      }
  } catch (error) {
      console.error('Error deleting show-wall post:', error.message);
      return [false,error.message];
  }
};
