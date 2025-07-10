const { db2 } = require("../../../models");

const Comments = db2.comments;

module.exports.getPostByCommentId = async (email,reference_number,comment_id) => {
  try {
    const record = await Likes.findOne({
      attributes:['post_id'],
      where:{
         email: email,
         reference_number: reference_number,
         comment_id: comment_id
      },
    });
    if(record){
       return [true,record?.post_id];
    }else{
       return [false,0];
    }

  } catch(error) {
    console.error('Error fetching post id:', error);
    return [false,error?.message];
  }
};
