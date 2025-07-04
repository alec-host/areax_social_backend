const { db2 } = require("../../../models");

const Likes = db2.likes;

module.exports.likeIdExist = async (likeData) => {
  try{
    const likeCount = await Likes.count({
      where: {
         reference_number: likeData.reference_number,
         like_id: likeData.like_id
      },
    });
    if(likeCount === 0){
       return [false, likeCount];	    
    }
    // Return the result
    return [true, likeCount];
  }catch(error){
    console.error('Error: check if like exists:', error.message);
    return [false, error.message];
  }
};
