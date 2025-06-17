const { db2 } = require("../../../models");

const Materialized = db2.materialized;;

module.exports.getLikeCount = async (post_id) => {
  try {
    const record = await Materialized.findOne({
      attributes:['total_likes'],	    
      where:{
         post_id: post_id,
      },
    });
    if(record){
       return [true,record.total_likes,`Like count.`];
    }else{
       return [false,0,`No record found for post_id ${post_id}.` ];
    }
   
  } catch(error) {
    console.error('Error fetching like count:', error);
    return [false,0,error.message];
  }
};
