const { Op } = require('sequelize');
const { db2 } = require("../../../models");

const GroupInvites = db2.groups.invites;

module.exports.getGroupInvites = async(recipient_reference_number,page=1,limit=100) => {
  if(page<=0){page=1;}
  const offset = (page - 1) * limit;
  try{
    const records = await GroupInvites.findAndCountAll({
       attributes: ['group_name','group_type','group_reference_number','group_photo_url','recipient_name','recipient_reference_number','recipient_photo_url','status',['token','invite_code'],'invite_link','is_registered','created_at'],
       where: { 
	  recipient_reference_number, 
	  status: 'pending',
	  [Op.or]: [
            { group_type: 'open' },
            {
               [Op.and]:[
                  { group_type: 'private' },
		  { is_admin_accepted: 0 }     
	       ]
	    } 		  
	  ]     
       },
       offset,
       limit: Number(limit),
       raw: true
    });

    if(records.count === 0) return [false,'No record found'];

    return [true,{
       data: records.rows,
       total: parseInt(records.count),
       currentPage: parseInt(page),
       totalPages: Math.ceil(records.count / limit),
    }];
  }catch(error){
    console.error("Error: getting group invites", error.message);
    return [false,`Error retrieving pending group invite[s] ${error.message}`];
  }
};
