const { db2 } = require("../../../models");

const Likes = db2.likes;

module.exports.getPostByLikeId = async (email,reference_number,like_id) => {
  try {
    const record = await Likes.findOne({
      attributes:['post_id'],
      where:{
         email: email,
         reference_number: reference_number,
         like_id: like_id
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
