const { Op } = require('sequelize');
const { validationResult } = require("express-validator");
const s3 = require('../services/S3-BUCKET');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const { saveUploadedWallpaper } = require("./user/file-upload/create.wallpaper");
const { deleteUserUploadedWallpaper } = require("./user/file-upload/delete.wallpaper");
const { getUploadedWallpaper } = require("./user/file-upload/get.wallpaper.by.id");
const { getPaginatedWallpaper } = require("./user/file-upload/get.wallpapers");
const { modifyUploadedWallpaper } = require("./user/file-upload/modify.wallpaper");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getNearbyPlacePhoto } = require("../services/GOOGLE-PLACES");
const { getNearbyPlacePhotos } = require("../services/GOOGLE-PLACES-MULTI-IMAGE");
const { getImageMetadata } = require("../utils/image.url.meta.data");
const axiosInstance = require("../utils/axios.instance");

class WallpaperController {

  async saveMedia(req,res){
    try{
       const errors = validationResult(req);
       const { name, description, category } = req.body;

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
	  category,
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

  async saveUserMedia(req,res){
    try{
       const errors = validationResult(req);
       const { email, reference_number } = req.body;

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

       const email_found = await findUserCountByEmail(email);
       if(email_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Email not found."
          });
          return;
       }
       const reference_number_found = await findUserCountByReferenceNumber(reference_number);
       if(reference_number_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Reference number not found."
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
          category: 'custom',
	  reference_number,    
          source: 'self'
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

  async saveGoogleNearbyMedia(req,res){
    try{
       const errors = validationResult(req);
       const { email, reference_number, lat, lng } = req.body;
       const source = 'google';

       if(!errors.isEmpty()){
          res.status(422).json({ success: false, error: true, message: errors.array() });
          return;
       }

       const email_found = await findUserCountByEmail(email);
       if(email_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Email not found."
          });
          return;
       }

       const reference_number_found = await findUserCountByReferenceNumber(reference_number);
       if(reference_number_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Reference number not found."
          });
          return;
       }

       await deleteUserUploadedWallpaper(reference_number,source);	    

       const types = ['tourist_attraction', 'park', 'museum', 'natural_feature', 'zoo', 'aquarium' ,'campground', 'beach', 'art_gallery', 'restaurant', 'cafe', 'shopping_mall', 'amusement_park' ,'night_club', 'casino'];

       const photoInfo = await getNearbyPlacePhotos(reference_number,lat,lng,1000,types);

       /*	    
       if(!photoInfo){
          res.status(404).json({
              success: true,
              error: false,
              message: 'No image found near your location.'
          });         
	  return;     
       }
	 
       const metaData = await getImageMetadata(photoInfo.imageUrl);
   
       const title = 'Google Image'; 
       const message = 'We have got a new background image for you.';	    
       const action = 'general';	    
       const payload = { 
	  email, 
	  reference_number,
	  title,
	  message,
	  image_url: metaData?.file_url,
	  action     
       };

       //-.Save wallpaper info to database
       const fileRecord = await saveUploadedWallpaper({
          original_name: metaData?.originalname,
          file_name: metaData?.file_name,
          file_url: metaData?.file_url,
          file_size: metaData?.file_size,
          mime_type: metaData?.mime_type,
          file_type: metaData?.file_type,
          s3_key: '0',
          category: 'custom',
          source,
	  reference_number     
       });
       if(!fileRecord[0]){
          res.status(400).json({
              success: false,
              error: true,
              message: fileRecord[1]
          });
          return;
       }
       //-.Send notification
       const response = axiosInstance.post("https://api.projectw.ai/fbase/api/v1/send-direct-message",payload);
       console.log(response);
	    
       res.status(201).json({
           success: true,
           error: false,
           data: fileRecord[1],
           message: 'Google image has been saved successfully.'
       });
       */

       // Handle null or empty array
       if(!photoInfo || (Array.isArray(photoInfo) && photoInfo.length === 0)) {
          res.status(404).json({
              success: true,
              error: false,
              message: 'No image found near your location.'
          });
          return;
       }

       // Normalize to an array (cap at 5 just in case)
       const photos = Array.isArray(photoInfo) ? photoInfo.slice(0, 5) : [photoInfo];

       const title = 'Google Image';
       const message = 'We have got a new background image[s] for you.';
       const action = 'general';

       const savedFileRecords = [];	    

       for(const p of photos) {
           const metaData = await getImageMetadata(p.imageUrl);

           //-.Save wallpaper info to database
           const fileRecord = await saveUploadedWallpaper({
              original_name: metaData?.originalname,
              file_name: metaData?.file_name,
              file_url: metaData?.file_url,
              file_size: metaData?.file_size,
              mime_type: metaData?.mime_type,
              file_type: metaData?.file_type,
              s3_key: '0',
              category: 'custom',
              source,
              reference_number
           });

           if(!fileRecord[0]) {
              res.status(400).json({
                  success: false,
                  error: true,
                  message: fileRecord[1]
              });
              return;
           }

	   savedFileRecords.push(fileRecord[1]); 
       }

       const payload = {
          email,
          reference_number,
          title,
          message,
          image_url: savedFileRecords,
          action
       };	  	    
       //-.Send notification
       const response = await axiosInstance.post("https://api.projectw.ai/fbase/api/v1/send-direct-message",payload);
       //console.log(response);

       //Keep response shape unchanged: return the first saved record
       res.status(201).json({
           success: true,
           error: false,
           data: savedFileRecords,
           message: 'Google image[s] has been saved.'
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
       const { email, reference_number, page = 1, limit = 500 } = req.query;

       if(!errors.isEmpty()){
          res.status(422).json({ success: false, error: true, message: errors.array() });
          return;
       }

       const email_found = await findUserCountByEmail(email);
       if(email_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Email not found."
          });
          return;
       }
       const reference_number_found = await findUserCountByReferenceNumber(reference_number);
       if(reference_number_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Reference number not found."
          });
          return;
       }
	    
       const offset = (page - 1) * limit;
       const whereClause = { 
         [Op.or]: [
           { category: { [Op.ne]: 'custom' } },
           { 
              [Op.and]: [
                 { category: 'custom'},
		 { reference_number: reference_number }     
	      ]
	   }
         ]
       };
	    
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

  async fetchMediaAdmin(req,res){
    try{
       const errors = validationResult(req);
       const { page = 1, limit = 10, category = null } = req.query;

       if(!errors.isEmpty()){
          res.status(422).json({ success: false, error: true, message: errors.array() });
          return;
       }

       const offset = (page - 1) * limit;
	    
       const whereClause = category ? { category: {[Op.ne]: 'custom',[Op.eq]: category} } : { category: {[Op.ne]: 'custom'} };
      
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
