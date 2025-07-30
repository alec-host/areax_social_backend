const { db2 } = require("../../../models");

const Wallpaper = db2.wallpapers;

module.exports.getUploadedWallpaper = async(media_id) => {
  try{
    const record = await Wallpaper.findByPk(media_id);
    if (!record) {
      return [false, 'Wallpaper not found'];
    }
    return [true,record];
  } catch (error) {
    console.error('Error getting uploaded wallpaper details:', error.message);
    return [false,error.message];
  }
};
