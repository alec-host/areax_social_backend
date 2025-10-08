const { db2 } = require("../../../models");

const MembersReport = db2.members.report;


module.exports.reportGroupMember = async({ group_id, group_reference_number, reported_user_id, reported_reference_number, reported_username, reported_profile_picture_url, reporter_user_id, reporter_reference_number, reason }) => {
 try{

     const existingReport = await MembersReport.findOne({
        where: {
           group_id,
           reported_user_id,
           reporter_user_id,
           reason
        }
     });
	 
     if(existingReport) {
        return [false, 'You have already reported this member for the same reason.'];
     }
	 
     const payload = { 
	group_id,
	group_reference_number, 
	reported_user_id,
	reported_reference_number,
	reporter_user_id, 
	reporter_reference_number, 
	reported_username,     
	reported_profile_picture_url, 
	reason, 
	status: 'pending', 
	created_at: new Date() 
     };
     const newReport = await MembersReport.create(payload);	 
      
     return [true, newReport];
 }catch(e){
     console.log(`Error: ${e?.message}`);
     return [false, `Error: saving the report.`];	 
 }
};
