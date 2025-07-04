const { db2 } = require("../../../models");

const ReportPosts = db2.report_post;

module.exports.getUserReportedPosts = async (email,reference_number) => {
  try {
    const count = await ReportPosts.count({where:{email: email,reference_number: reference_number}});
    if(count > 0){
       const record = await ReportPosts.findAll({
           attributes:['post_id','like_id','user_id','email','reference_number','vote_type'],
           where:{
               email: email,
               reference_number: reference_number,
           },
       });
       return [true,record,`List of Saved Posts[s]`];
    }else{
       return [false,[],`No Saved Post[s]`];
    }
  } catch(error) {
    console.error('Error fetching user saved post[s]:', error);
    return [false,[],error?.message];
  }
};
