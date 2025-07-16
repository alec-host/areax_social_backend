const { db2 } = require("../../../models");

const ReportPosts = db2.report_post;

module.exports.getReportedPosts = async (page=1,limit=100) => {
  if(page<=0){page=1;}
  const offset = (page - 1) * limit;	
  try{ 
     const records = await ReportPosts.findAndCountAll({
        attributes:['email','reference_number','media_url','description','vote_type','feedback','created_at'],
	limit: parseInt(limit),
	offset: parseInt(offset),
	order: [['created_at', 'DESC']],    
     });
     if(records.count > 0){	    
       const data = {
          data: records.rows,
	  pagination:{     
            total: records.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(records.count / limit) 
	  }
       };
       return [true,data,`List of Reported Posts[s]`];
    }else{
       return [false,[],`No Reported Post[s]`];
    }
  } catch(error) {
    console.error('Error fetching reported post[s]:', error);
    return [false,[],error?.message];
  }
};
