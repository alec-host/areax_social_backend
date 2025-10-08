const multer = require('multer');

const customStorage = require('../middleware/upload.storage');

const { STORAGE_FILE_PATH } = require("../constants/app_constants");

const upload = multer({
   storage: customStorage({ destination: STORAGE_FILE_PATH }),
   limits: { fileSize: 10 * 1024 * 1024 }, // 20 MB limit
   fileFilter: function (req, file, cb) {
      if(!file.mimetype.startsWith('image/')){
         return cb(null,{ success: false, error: true, message: 'Only image files are allowed!'}, false);
      }
      cb(null, true);
   },
});

module.exports.uploadMiddleware = (req, res, next) => { 
   upload.single('file')(req, res, (err) => { 
      if (err) { 
	 res.status(400).json({ 
	     success: false, 
	     error: true, 
	     message: err.message
	 });
	 return;     
      } 
      next(); 
   }); 
};
