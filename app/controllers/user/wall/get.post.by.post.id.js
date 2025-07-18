const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.getPostById = async (postId) => {
  try{
     const recordset = await Wall.findOne({
        where: { post_id: postId },
        attributes: ['post_id','email','reference_number','media_url','description']
     });
     if(!recordset){
        return [false,'Post id not found'];
     }	  
     return [true,recordset];
  }catch(error){
     console.error('Error fetching post by ID:', error?.message);
     return [false,'Error: fetching a post'];
  }
};
