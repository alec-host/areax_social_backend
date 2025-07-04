const { db2 } = require("../../../models");

const SavedPosts = db2.saved_posts;

module.exports.getUserSavedPosts = async (email,reference_number) => {
  try {
    const count = await SavedPosts.count({where:{email: email,reference_number: reference_number}});
    if(count > 0){
       const record = await SavedPosts.findAll({
           attributes:['post_id','like_id','user_id','email','reference_number'],
           where:{
               email: email,
               reference_number: reference_number,
           },
       });
       return [true,record,`List of Saved Post[s]`];
    }else{
       return [false,[],`No Saved Post[s]`];
    }

  } catch(error) {
    console.error('Error fetching user saved post[s]:', error);
    return [false,error?.message];
  }
};
