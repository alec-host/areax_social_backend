const { AWS_BUCKET_ACCESS_KEY_ID, AWS_BUCKET_SECRET_ACCESS_KEY, AWS_BUCKET_REGION } = require("../constants/app_constants");

const AWS = require('aws-sdk');
//require('dotenv').config();
AWS.config.logger = console;
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

module.exports = s3;
