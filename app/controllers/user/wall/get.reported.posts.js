const { Sequelize } = require('sequelize');
const { db2 } = require("../../../models");

const ReportPosts = db2.report_post;

module.exports.getReportedPosts = async(group_reference_number=null,page=1,limit=100) => {
  //if(page<=0){page=1;}
  page = Math.max(parseInt(page), 1);
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (group_reference_number) {
    whereClause.group_reference_number = group_reference_number;
  }
	
  try{ 
     const records = await ReportPosts.findAndCountAll({
        attributes:['creator_email','creator_reference_number',[Sequelize.col('email'),'reporter_email'],[Sequelize.col('reference_number'),'reporter_reference_number'],'media_url','description','vote_type','feedback','created_at'],
	where: whereClause,     
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
