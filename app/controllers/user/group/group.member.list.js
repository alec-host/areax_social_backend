const { db2 } = require("../../../models");

const GroupMembers = db2.members;

module.exports.getGroupMembers = async(group_reference_number,page=1,limit=100) => {
  if(page<=0){page=1;}
  const offset = (page - 1) * limit;
  try{
    const records = await GroupMembers.findAndCountAll({ 
       attributes: ['name','reference_number','profile_picture_url','role','is_muted'],	    
       where: { group_reference_number, is_muted: 0, is_active: 1 },
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
    console.error("Error: getting group member[s]", error.message);
    return [false,`Error retrieving members ${error.message}`];
  }
};
