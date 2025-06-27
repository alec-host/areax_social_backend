const { validationResult } = require("express-validator");
const s3 = require('../services/S3-BUCKET');
const { saveUploadedFile } = require('./user/file-upload/create.file');
const { getUploadedFile } = require('./user/file-upload/get.file.by.id');
const { getPaginatedFiles } = require('./user/file-upload/get.files.by.type');
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");


class FileController {
    // Upload file
    async uploadFile(req, res) {
        const errors = validationResult(req);
        const { email, reference_number } = req.body;	    
        try {
            console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx ', req?.file);		
            if (!req.file) {
                return res.status(400).json({
                    success: false,
	            error: true,		
                    message: 'No file uploaded'
                });
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
            if(reference_number_found > 0){
               res.status(404).json({
                   success: false,
                   error: true,
                   message: "Reference number not found."
               });
               return;
	    }

            const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
            console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx ');		

            // Save file info to database	    
            const fileRecord = await saveUploadedFile({
		email,
		reference_number,    
                original_name: req.file.originalname,
                file_name: req.file.key,
                file_url: req.file.location,
                file_size: req.file.size,
                mime_type: req.file.mimetype,
                file_type: fileType,
                s3_key: req.file.key
            });

            res.status(201).json({
                success: true,
		error: false,
		data: fileRecord,    
                message: 'File uploaded successfully'
            });
        } catch(error){
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
		error: true,    
                message: `Error uploading file: ${error.message}`
            });
        }
    }

    // Get all files
    async getFiles(req, res) {
        try {
            const { page = 1, limit = 10, fileType } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = {};
            if (fileType) {
                whereClause.fileType = fileType;
            }

            const files = await getPaginatedFiles(whereClause,parseInt(limit),parseInt(offset));
            if(!files[0]){
	        res.status(404).json({
                    success: false,
                    error: true,
                    message: files[1]
                });
		return;    
            }
            	
            res.json({
                success: true,
		error: false,    
                data: files[1].rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(files[1].count / limit),
                    totalItems: files[1].count,
                    itemsPerPage: parseInt(limit)
                },
		message:'List of files'     
            });
        } catch (error) {
            console.error('Get files error:', error);
            res.status(500).json({
                success: false,
		error: true,    
                message: `Error fetching files: ${error.message}`
            });
        }
    }

    // Get single file
    async getFile(req, res) {
        try {
            const { email, reference_number } = req.body;		
            const { id } = req.params;
          
            const file = await getUploadedFile(id);

            if (!file[0]) {
                return res.status(404).json({
                    success: false,
	            error: true,		
                    message: file[1]
                });
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
            if(reference_number_found > 0){
               res.status(404).json({
                   success: false,
                   error: true,
                   message: "Reference number not found."
               });
               return;
            }

            res.json({
                success: true,
	        error: false,	    
                data: file,
		messaage: 'File'    
            });
        } catch (error) {
            console.error('Get file error:', error);
            res.status(500).json({
                success: false,
		error: true,    
                message: `Error fetching file: ${error.message}`,
            });
        }
    }

    // Delete file
    async deleteFile(req, res) {
        try {
	    const { email, reference_number } = req.body;
            const { id } = req.params;
           
            const file = await getUploadedFile(id);

            if (!file[0]) {
               res.status(404).json({
                   success: false,
		   error: true,	
                   message: file[1]
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
            if(reference_number_found > 0){
               res.status(404).json({
                   success: false,
                   error: true,
                   message: "Reference number not found."
               });
               return;
            }
		
            // Delete from S3
            await s3.deleteObject({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: file[1].s3Key
            }).promise();

            // Delete from database
            await file[1].destroy();

            res.json({
                success: true,
		error: false,    
                message: 'File deleted successfully'
            });
        } catch (error) {
            console.error('Delete file error:', error);
            res.status(500).json({
                success: false,
		error: true,    
                message: `Error deleting file: ${error.message}`
            });
        }
    }
}

module.exports = new FileController();
