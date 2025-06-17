const { db2 } = require("../../../models");

const Materialized = db2.materialized;

module.exports.getCommentCount = async (post_id) => {
  try {
    const record = await Materialized.findOne({
      attributes:['total_comments'],
      where:{
         post_id: post_id,
      },
    });
    if(record){
       return [true,record.total_comments,`Comment[s] count.`];
    }else{
       return [false,0,`No record found for post_id ${post_id}.` ];
    }

  } catch(error) {
    console.error('Error fetching comment count:', error);
    return [false,0,error.message];
  }
};
