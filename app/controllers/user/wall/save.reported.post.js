const { db2 } = require("../../../models");

const ReportPost = db2.report_post;

module.exports.saveReportedPost = async (data) => {
  try {

    const newPost = await ReportPost.create({
      user_id: data.user_id,
      email: data.email || null,
      reference_number: data.reference_number || null,
      post_id: data.post_id,
      vote_type: data.vote_type,
      feedback: data.feedback,	    
      created_at: data.created_at || new Date(),
    })

    return [true,newPost];
  } catch (error) {
    console.error('Error saving flagging report:', error.message);
    return [false,error.message];
  }
};
