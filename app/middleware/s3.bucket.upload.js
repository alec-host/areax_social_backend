// middleware/uploadMiddleware.js
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../services/S3-BUCKET');
const path = require('path');

const { AWS_BUCKET_ACCESS_KEY_ID, AWS_BUCKET_SECRET_ACCESS_KEY, AWS_BUCKET_REGION } = require("../constants/app_constants");

// File type validation
const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const allowedVideoTypes = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        if (!allowedImageTypes.includes(ext)) {
            return cb(new Error('Invalid image format. Allowed: jpg, jpeg, png, gif, webp'), false);
        }
        // Check image size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return cb(new Error('Image file too large. Maximum size is 10MB'), false);
        }
        return cb(null, true);
    } else if (file.mimetype.startsWith('video/')) {
        if (!allowedVideoTypes.includes(ext)) {
            return cb(new Error('Invalid video format. Allowed: mp4, avi, mov, wmv, flv, webm'), false);
        }
        // Check video size (50MB)
        if (file.size > 50 * 1024 * 1024) {
            return cb(new Error('Video file too large. Maximum size is 50MB'), false);
        }
        return cb(null, true);
    }

    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
};

// Configure multer for S3
const s3Upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'weaiu',
        acl: 'public-read',
        key:(req, file, cb) => {
           try{		
	      console.log(file);	
              const ext = path.extname(file.originalname);
              //const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
	      const fileName = `test-${Date.now()}.${ext}`;
	      console.log(fileName);	
              cb(null, fileName);
	      console.log('dddddd');	   
	   }catch(error){
              console.error('Key generation error:', error);
              cb(error);		   
	   }
        }
    }),
    //fileFilter: fileFilter,
    //limits: {
      //fileSize: 50 * 1024 * 1024
    //}
});

module.exports = s3Upload;
