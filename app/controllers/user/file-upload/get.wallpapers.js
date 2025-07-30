const { db2 } = require("../../../models");

const Wallpaper = db2.wallpapers;

module.exports.getPaginatedWallpaper = async (whereClause, limit, offset) => {
  try {
    const files = await Wallpaper.findAndCountAll({
      attributes: ['media_id','original_name','file_name','file_url','file_size','mime_type','file_type','created_at'],	    
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    if(files.count === 0) {
       return [false,'No matching wallpaper found'];
    }
    return [true, files];
  } catch (error) {
    console.error('Error fetching paginated wallpapers:', error);
    return [false, 'Failed to retrieve wallpapers'];
  }
};
