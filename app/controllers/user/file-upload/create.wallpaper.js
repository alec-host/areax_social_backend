const { db2 } = require("../../../models");

const Wallpaper = db2.wallpapers;

module.exports.saveUploadedWallpaper = async (data) => {
  try{
    const newFile = await Wallpaper.create({
      original_name: data.original_name,
      file_name: data.file_name,
      file_url: data.file_url,
      file_size: data.file_size,
      mime_type: data.mime_type,
      file_type: data.file_type,
      s3_key: data.s3_key,
      source: data.source,	    
      created_at: data.created_at || new Date()
    });

    return [true,newFile];
  } catch (error) {
    console.error('Error saving uploaded wallper details:', error.message);
    return [false,error.message];
  }
};
