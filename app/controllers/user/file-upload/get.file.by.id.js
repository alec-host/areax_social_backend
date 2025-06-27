const { db2 } = require("../../../models");

const File = db2.files;

module.exports.getUploadedFile = async(id) => {
  try{  
    const record = await File.findByPk(id);
    if (!record) {
      return [false, 'File not found'];
    }
    return [true,record];
  } catch (error) {
    console.error('Error getting uploaded file details:', error.message);
    return [false,error.message];
  }
};
