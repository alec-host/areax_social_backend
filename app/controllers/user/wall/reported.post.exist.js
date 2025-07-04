const { db2 } = require("../../../models");

const ReportPost = db2.report_post;

module.exports.reportPostExist = async (data) => {
  try{
    const reportPostCount = await ReportPost.count({
      where: {
         reference_number: data.reference_number,
         post_id: data.post_id
      },
    });
    if(reportPostCount === 0){
       return [false, reportPostCount];
    }
    // Return the result
    return [true, reportPostCount];
  }catch(error){
    console.error('Error: check if reported post exists:', error.message);
    return [false, error.message];
  }
};

