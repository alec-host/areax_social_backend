const { db2 } = require("../../../models");

const ChatGroups = db2.groups;

module.exports.listGroups = async (page=1,limit=100) => {
  if(page<=0){page=1;}
  const offset = (page - 1) * limit;
  try {
    const records = await ChatGroups.findAndCountAll({
      where: {
         is_deleted: 0,
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    return [true,{
       data: records.rows,
       total: records.count,
       currentPage: page,
       totalPages: Math.ceil(records.count / limit),
    }];
  } catch(error) {
    console.error('Error fetching paginated records:', error);
    return [false,error];
  }
};
