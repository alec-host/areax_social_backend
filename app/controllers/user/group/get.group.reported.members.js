const { db2 } = require("../../../models");

const MembersReport = db2.members.report;

module.exports.getReportedGroupMembers = async(group_reference_number,page=1,limit=100) => {
  if(page<=0){page=1;}
  const offset = (page - 1) * limit;	
  try{
      const reportedMembers = await MembersReport.findAndCountAll({
	 attributes: ['report_id','reported_username','reported_profile_picture_url','reported_reference_number','reporter_reference_number','reviewed_by','reason',['status','review_status'],'created_at'],
	 where: { group_reference_number },
	 offset,
         limit: Number(limit),     
	 raw: true 
      });

      if(reportedMembers.count === 0) return [false,'No record found'];	  

      return [true,{
         data: reportedMembers.rows,
         total: parseInt(reportedMembers.count),
         currentPage: parseInt(page),
         totalPages: Math.ceil(reportedMembers.count / limit),
      }];	  
  }catch(error){
      console.error("Error: getting reported members", error.message);
      return [false,`Error retrieving reported members[s] ${error.message}`];	  
  }
};
