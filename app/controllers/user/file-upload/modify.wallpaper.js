const { db2 } = require("../../../models");

const Wallpaper = db2.wallpapers;

module.exports.modifyUploadedWallpaper = async (data) => {
  try{
    const wallpaper = await Wallpaper.findByPk(data.media_id);	  
    if(!wallpaper){
       return [false,'No found'];
    }	  
    wallpaper.original_name = data.original_name;
    wallpaper.file_name = data.file_name;
    wallpaper.file_url = data.file_url;
    wallpaper.file_size = data.file_size;	  
    wallpaper.mime_type = data.mime_type;
    wallpaper.file_type = data.file_type;	  
    wallpaper.s3_key = data.s3_key;	  
    wallpaper.source = data.source;
    wallpaper.created_at = data.created_at || new Date();	  
    await wallpaper.save();
    return [true,'Wallpaper modified'];
  } catch (error) {
    console.error('Error saving uploaded wallper details:', error.message);
    return [false,error.message];
  }
};
