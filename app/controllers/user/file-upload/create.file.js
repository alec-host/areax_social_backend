const { db2 } = require("../../../models");

const File = db2.file;

module.exports.saveUploadedFile = async (data) => {
  try{
    const newFile = await File.create({
      email: data.email,	    
      reference_number: data.reference_number || null,    
      original_name: data.original_name,
      file_name: data.key,
      location: data.location,
      file_size: data.size,
      mime_type: data.mime_type,
      file_type: data.file_type,
      s3_key: data.s3_key,	    
      reference_number: data.reference_number || null,
      created_at: data.created_at || new Date()
    });

    return [true,newFile];
  } catch (error) {
    console.error('Error saving uploaded file details:', error.message);
    return [false,error.message];
  }
};
