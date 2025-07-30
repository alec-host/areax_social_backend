const { validationResult } = require("express-validator");
const s3 = require('../services/S3-BUCKET');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const { saveUploadedWallpaper } = require("./user/file-upload/create.wallpaper");
const { getUploadedWallpaper } = require("./user/file-upload/get.wallpaper.by.id");
const { getPaginatedWallpaper } = require("./user/file-upload/get.wallpapers");
const { modifyUploadedWallpaper } = require("./user/file-upload/modify.wallpaper");

class WallpaperController {

  async saveMedia(req,res){
    try{
       const errors = validationResult(req);
       const { name, description } = req.body;

       if(!errors.isEmpty()){
          res.status(422).json({ success: false, error: true, message: errors.array() });
          return;
       }

       if(!req.file){
          res.status(400).json({
              success: false,
              error: true,
              message: 'No file uploaded'
          });
	  return;     
       }

       const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';	    
       // Save wallpaper info to database
       const fileRecord = await saveUploadedWallpaper({
          original_name: req?.file?.originalname,
          file_name: req?.file?.key,
          file_url: req?.file?.location,
          file_size: req?.file?.size,
          mime_type: req?.file?.mimetype,
          file_type: fileType,
          s3_key: req?.file?.key,
	  source: 'projectw'     
       });
       if(!fileRecord[0]){
          res.status(400).json({
              success: false,
              error: true,
              message: fileRecord[1]
          });
	  return;     
       }
       res.status(201).json({
           success: true,
           error: false,
           data: fileRecord[1],
           message: 'Wallpaper has been uploaded successfully.'
       });
    }catch(error){
       console.error('Get file error:', error);
       res.status(500).json({
           success: false,
           error: true,
           message: `Error fetching file: ${error.message}`,
       });
    }
  };

  async modifyMedia(req,res){
    try{
       const errors = validationResult(req);
       const { media_id } = req.params;

       if(!errors.isEmpty()){
          res.status(422).json({ success: false, error: true, message: errors.array() });
          return;
       }

       if(!req.file){
          res.status(400).json({
              success: false,
              error: true,
              message: 'No file uploaded'
          });
          return;
       }
	    
       const wallpaper = await getUploadedWallpaper(media_id);  
       if(!wallpaper[0]) {
          res.status(404).json({
              success: false,
              error: true,
              message: wallpaper[1]
          });
          return;
       }

       const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
       // Modify wallpaper info
       const fileRecord = await modifyUploadedWallpaper({
	  media_id,     
          original_name: req?.file?.originalname,
          file_name: req?.file?.key,
          file_url: req?.file?.location,
          file_size: req?.file?.size,
          mime_type: req?.file?.mimetype,
          file_type: fileType,
          s3_key: req?.file?.key,
          source: 'projectw'
       });
       if(!fileRecord[0]){
          res.status(400).json({
              success: false,
              error: true,
              message: fileRecord[1]
          });
          return;
       }

       // Delete from S3
       const command = new DeleteObjectCommand({
          Bucket: 'weaiu',
          Key: wallpaper[1].s3_key,
       });

       const response = await s3.send(command);
	    
       res.status(200).json({
           success: true,
           error: false,
           message: fileRecord[1]
       });	    
    }catch(error){
       console.error('Get file error:', error);
       res.status(500).json({
           success: false,
           error: true,
           message: `Error fetching file: ${error.message}`,
       });
    }
  };

  async deleteMedia(req,res){	  
    try{
       const errors = validationResult(req);
       const { media_id } = req.params;

       if(!errors.isEmpty()){
          res.status(422).json({ success: false, error: true, message: errors.array() });
          return;
       }
       const wallpaper = await getUploadedWallpaper(media_id);
       if(!wallpaper[0]) {
          res.status(404).json({
              success: false,
              error: true,
              message: wallpaper[1]
          });
          return;
       }

       // Delete from S3
       const command = new DeleteObjectCommand({
          Bucket: 'weaiu',
          Key: wallpaper[1].s3_key,
       });

       const response = await s3.send(command);

       // Delete from database
       await wallpaper[1].destroy();

       res.json({
           success: true,
           error: false,
           message: 'Wallpaper deleted successfully'
       });	    
       	    
    }catch(error){
       console.error('Get file error:', error);
       res.status(500).json({
           success: false,
           error: true,
           message: `Error fetching file: ${error.message}`,
       });	    
    }  
  };

  async fetchMedia(req,res){
    try{
       const errors = validationResult(req);
       const { page = 1, limit = 10 } = req.body;

       if(!errors.isEmpty()){
          res.status(422).json({ success: false, error: true, message: errors.array() });
          return;
       }
	 
       const offset = (page - 1) * limit;
       const whereClause = {};
	    
       const wallpapers = await getPaginatedWallpaper(whereClause,parseInt(limit),parseInt(offset));
       if(!wallpapers[0]){
          res.status(404).json({
              success: false,
              error: true,
              message: wallpapers[1]
          });
          return;
       }
       res.json({
           success: true,
           error: false,
           data: wallpapers[1].rows,
           pagination: {
              current_page: parseInt(page),
              total_pages: Math.ceil(wallpapers[1].count / limit),
              total_items: wallpapers[1].count,
              items_per_page: parseInt(limit)
           },
           message:'List of wallpapers'
       });	    
    }catch(error){
       console.error('Get file error:', error);
       res.status(500).json({
           success: false,
           error: true,
           message: `Error fetching file: ${error.message}`,
       });
    }	  
  };
};

module.exports = new WallpaperController();
