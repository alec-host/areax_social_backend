const { Op } = require('sequelize');
const { db2 } = require("../../../models");

const Groups = db2.groups;
const GroupMembers = db2.members;

module.exports.listGroups = async (page=1,limit=100) => {
  if(page<=0){page=1;}
  const offset = (page - 1) * limit;
  try {
    const records = await Groups.findAndCountAll({
      where: {
         is_deleted: 0,
	 //is_secret_group: 0     
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    const groups = records.rows;

    // Extract all group_reference_numbers
    const referenceNumbers = groups.map(g => g.group_reference_number);

    // Fetch all profile pictures for these groups (limit 4 per group)
    const allMemberships = await GroupMembers.findAll({
      attributes: ['group_reference_number', 'profile_picture_url'],
      where: {
        group_reference_number: { [Op.in]: referenceNumbers },
        is_deleted: 0,
	is_muted: 0, 
	is_active: 1,      
        profile_picture_url: { [Op.ne]: null },
      },
      order: [['joined_at', 'DESC']],
    });

    // Group profile pictures by group_reference_number
    const pictureMap = {};
    for (const m of allMemberships) {
      const ref = m.group_reference_number;
      if(!pictureMap[ref]) pictureMap[ref] = [];
      if(pictureMap[ref].length < 4) {
        pictureMap[ref].push(m.profile_picture_url);
      }
    }

    // Inject profile_picture_urls into each group
    const enrichedGroups = groups.map(group => {
      const ref = group.group_reference_number;
      return {
        ...group.toJSON(),
        profile_picture_urls: pictureMap[ref] || [],
      };
    });	  

    return [true,{
       data: enrichedGroups,
       total: parseInt(records.count),
       currentPage: parseInt(page),
       totalPages: Math.ceil(records.count / limit),
    }];
  } catch(error) {
    console.error('Error fetching paginated records:', error);
    return [false,error];
  }
};
