const { db2 } = require("../../../models");

const Likes = db2.likes;

module.exports.getUserLikes = async (email,reference_number) => {
  try {
    const count = await Likes.count({where:{email: email,reference_number: reference_number}});
    if(count > 0){
       const record = await Likes.findAll({
           attributes:['post_id','like_id','user_id','email','reference_number'],
           where:{
               email: email,
               reference_number: reference_number,
           },
       });
       return [true,record,`List of Like[s]`];
    }else{
       return [false,count,`No Likes`];
    }

  } catch(error) {
    console.error('Error fetching user likes:', error);
    return [false,error?.message];
  }
};
