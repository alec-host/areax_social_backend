const { db2 } = require("../../../models");

const Likes = db2.likes;

module.exports.getLikeId = async (email,reference_number,post_id) => {
  try {
    const record = await Likes.findOne({
      attributes:['like_id'],
      where:{
         email: email,
         reference_number: reference_number,	      
         post_id: post_id     
      },
    });
    if(record){
       return [true,record?.like_id];
    }else{
       return [false,0];
    }

  } catch(error) {
    console.error('Error fetching like id:', error);
    return [false,error?.message];
  }
};
