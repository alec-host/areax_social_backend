const { AWS_BUCKET_ACCESS_KEY_ID, AWS_BUCKET_SECRET_ACCESS_KEY, AWS_BUCKET_REGION } = require("../constants/app_constants");

const AWS = require('aws-sdk');

const { S3Client } = require('@aws-sdk/client-s3');
//require('dotenv').config();
const s3 = new S3Client({
    region: AWS_BUCKET_REGION,	
    credentials: {
       accessKeyId: AWS_BUCKET_ACCESS_KEY_ID,
       secretAccessKey: AWS_BUCKET_SECRET_ACCESS_KEY,
    }
});

module.exports = s3;
