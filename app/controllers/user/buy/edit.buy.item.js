const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.editBuyItem = async (data,post_id) => {
  try {
     const [updatedRow] = await Wall.update(
	 {
             ...data
	 },
	 {
             where: {
		post_id: post_id
	     },
	 }
     );
     if(updatedRow){
	return [true,'Item updated successfully.'];
     }else{
        return [false,'No record found'];
     }
  } catch (error) {
     console.error('Error editing show-wall post:', error.message);
     return [false,error.message];
  }
};
