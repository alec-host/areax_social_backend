const { db2 } = require("../../../models");

const Wallpaper = db2.wallpapers;

module.exports.getPaginatedWallpaper = async (whereClause, limit, offset) => {
  try {
    const files = await Wallpaper.findAndCountAll({
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
