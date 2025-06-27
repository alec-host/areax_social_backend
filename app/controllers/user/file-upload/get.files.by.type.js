module.exports.getPaginatedFiles = async (whereClause, limit, offset) => {
  try {
    const files = await File.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    if(files.count === 0) {
       return [false,'No matching files found'];	    
    }
    return [true, files];
  } catch (error) {
    console.error('Error fetching paginated files:', error);
    return [false, 'Failed to retrieve files'];
  }
};
