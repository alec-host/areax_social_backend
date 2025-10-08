const { db2 } = require("../../../models");

const Wallpaper = db2.wallpapers;

module.exports.deleteUserUploadedWallpaper = async (reference_number,source) => {
  try{
     const count = Wallpaper.count();
     if(count === 0){
        return [false, 'No wallpaper to delete'];
     }	  
     const deletedRows = await Wallpaper.destroy(
      {
        where: {
          reference_number,
	  source	
        },
      }
    );

    if(deletedRows > 0) {
      console.log(`Wallpaper has been successfully deleted.`);
      return [true,'Wallpaper has been removed successfully.'];
    }else{
      console.log(`No wallpaper found.`);
      return [false,'No wallpaper found to delete.'];
    }	  
  }catch(error){
    console.error('Error failed to delete:', error.message);
    return [false,error.message];
  }
};
