const path = require('path');
const { body, query, check, param } = require("express-validator");

const multiUploadValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('description', 'Missing: description must be checked').not().isEmpty(),
    (req, res, next) => {
        if(!req.files || req.files.length === 0){
            //throw new Error('No file uploaded');
            return res.status(400).json({ success: false, error: true, message: 'No files uploaded' });
        }
        const validFormats = ['.jpeg', '.webp'];
        for(const file of req.files){
            const ext = path.extname(file.originalname).toLowerCase();
            if(!validFormats.includes(ext)){
                //throw new Error('Invalid file format. Only .jpeg,.webp are allowed.');
                return res.status(400).json({ success: false, error: true, message: 'Invalid file format. Only .jpeg, and .webp are allowed.' });
            }
        }
        next();
    }
];

const singleSocialWallUploadValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('caption')
        .optional()
        .isLength({ max: 250 })
        .withMessage('Caption must not exceed 250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),
    body('is_buy_enabled')
	.isInt({ min: 0, max: 1 })
        .withMessage('is_buy_enabled must be checked, has a value of 0 or 1.'),
    body('is_comment_allowed')
	.isInt({ min: 0, max: 1 })
        .withMessage('is_comment_allowed must be checked, has a value of 0 or 1.'),
    body('is_minted_automatically')
        .isInt({ min: 0, max: 1 })
        .withMessage('is_minted_automatically must be checked, has a value of 0 or 1.'),	
    (req, res, next) => {
        if(!req.file){
            //throw new Error('No file uploaded');
            return res.status(400).json({ success: false, error: true, message: 'No files uploaded' });
        }
        const validFormats = ['.mp4','.jpeg','.jpg','.png','.webp'];
        const ext = path.extname(req.file.originalname).toLowerCase();
        if(!validFormats.includes(ext)){
            //throw new Error('Invalid file format. Only .jpeg,.webp are allowed.');
            return res.status(400).json({ success: false, error: true, message: 'Invalid file format. Only MP4,JPEG,JPG,PNG,and WEBP are allowed.' });
        }
        next();
    }
];

const singleSocialUploadValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),	
    body('caption')
        .optional()
        .isLength({ max: 250 })
        .withMessage('Caption must not exceed 250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),	
    (req, res, next) => {
        if(!req.file){
            //throw new Error('No file uploaded');
            return res.status(400).json({ success: false, error: true, message: 'No files uploaded' });
        }
        const validFormats = ['.mp4','.jpeg','.jpg','.png','.webp'];
        const ext = path.extname(req.file.originalname).toLowerCase();
        if(!validFormats.includes(ext)){
            //throw new Error('Invalid file format. Only .jpeg,.webp are allowed.');
            return res.status(400).json({ success: false, error: true, message: 'Invalid file format. Only MP4,JPEG,JPG,PNG,and WEBP are allowed.' });
        }
        next();
    }
];

const singleGroupChatUploadValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('group_id', 'Missing: group_id must be checked').not().isEmpty(),	
    body('message')
        .optional()
        .isLength({ max: 5250 })
        .withMessage('Caption must not exceed 5250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),
    (req, res, next) => {
        if(!req.file){
            //throw new Error('No file uploaded');
            return res.status(400).json({ success: false, error: true, message: 'No files uploaded' });
        }
        const validFormats = ['.mp4','.jpeg','.jpg','.png','.webp'];
        const ext = path.extname(req.file.originalname).toLowerCase();
        if(!validFormats.includes(ext)){
            //throw new Error('Invalid file format. Only .jpeg,.webp are allowed.');
            return res.status(400).json({ success: false, error: true, message: 'Invalid file format. Only MP4,JPEG,JPG,PNG,and WEBP are allowed.' });
        }
        next();
    }
];

const socialWallURLValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('media_url','Media url must be provided').not().isEmpty(),
    body('caption')
        .optional() // Makes caption optional
        .isLength({ max: 5250 }) // Validates that length does not exceed 250 characters
        .withMessage('Caption must not exceed 5250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),
    body('is_buy_enabled')
        .isInt({ min: 0, max: 1 })
        .withMessage('is_buy_enabled must be checked, has a value of 0 or 1.'),
    body('is_comment_allowed')
        .isInt({ min: 0, max: 1 })
        .withMessage('is_comment_allowed must be checked, has a value of 0 or 1.'),
    body('is_minted_automatically')
        .isInt({ min: 0, max: 1 })
        .withMessage('is_minted_automatically must be checked, has a value of 0 or 1.'),	
];

const singleGroupMgmtUploadValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('group_name', 'Missing: group_name must be checked').not().isEmpty(),
    body('group_caption')
        .optional()
        .isLength({ max: 250 })
        .withMessage('Missing: group_caption must not exceed 250 characters.'),
    (req, res, next) => {
        if(!req.file){
            //throw new Error('No file uploaded');
            return res.status(400).json({ success: false, error: true, message: 'No files uploaded' });
        }
        const validFormats = ['.mp4','.jpeg','.jpg','.png','.webp'];
        const ext = path.extname(req.file.originalname).toLowerCase();
        if(!validFormats.includes(ext)){
            //throw new Error('Invalid file format. Only .jpeg,.webp are allowed.');
            return res.status(400).json({ success: false, error: true, message: 'Invalid file format. Only MP4,JPEG,JPG,PNG,and WEBP are allowed.' });
        }
        next();
    }
];

const singleShowUploadValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('item_amount')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('item_amount must be greater than 0 if provided.'),
    body('caption')
        .optional()
        .isLength({ max: 250 })
        .withMessage('Caption must not exceed 250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),	
    body('share_on_social_wall')
        .optional()
        .isInt({ min: 0, max: 1 })
        .withMessage('share_on_social_wall must be checked, has a value of 0 or 1.'),	
    body('close_time')
        .optional()
        .matches(/^(1?[1-9]|2[0-4])\s?hours$|^(1?[1-9]|[1-2][0-9]|30)\s?days$|^(1?[1-9]|1[0-2])\s?months$/)
        .withMessage('close_time must be defined as "1-24 hours", "1-30 days", or "1-12 months".'),	
    (req, res, next) => {
        if(!req.file){
            //throw new Error('No file uploaded');
            return res.status(400).json({ success: false, error: true, message: 'No files uploaded' });
        }
        const validFormats = ['.mp4','.jpeg','.jpg','.png','.webp'];
        const ext = path.extname(req.file.originalname).toLowerCase();
        if(!validFormats.includes(ext)){
            //throw new Error('Invalid file format. Only .jpeg,.webp are allowed.');
            return res.status(400).json({ success: false, error: true, message: 'Invalid file format. Only MP4,JPEG,JPG,PNG,and WEBP are allowed.' });
        }
        next();
    }
];

const getUserDetailsValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
];

const getFriendDetailsValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
    query('friend_category', 'Friend category must be provided').not().isEmpty(),	
];

const friendOpValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('friend_reference_number', 'Friend reference number must be provided').not().isEmpty(),	
];

const acceptFriendValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('originator_reference_number', 'Originator reference number must be provided').not().isEmpty(),
];

const getWallFeedValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
    query('post_type', 'Post type must be provided').not().isEmpty(),
    query('page', 'Page number must be provided').not().isEmpty().isInt({ gt: 0 }).withMessage('Page must be a number greater than 0'),	
    query('limit', 'Limit must be provided').not().isEmpty().isInt({ gt: 0, lt: 101 }).withMessage('Limit must be a number between 1 and 100'),	
];

const socialMediaURLValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('media_url','Media url must be provided').not().isEmpty(),
    body('caption')
        .optional() // Makes caption optional
        .isLength({ max: 5250 }) // Validates that length does not exceed 250 characters
        .withMessage('Caption must not exceed 5250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),	
];

const socialAIMediaURLValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('media_url','Media url must be provided').not().isEmpty(),
    body('category','Category must be provided').not().isEmpty(),	
    body('caption')
        .optional() // Makes caption optional
        .isLength({ max: 5250 }) // Validates that length does not exceed 250 characters
        .withMessage('Caption must not exceed 5250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),
];

const groupChatMediaURLValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('group_id', 'group_id must be provided').not().isEmpty(),	
    body('media_url','Media url must be provided').not().isEmpty(),
    body('message')
        .optional() // Makes caption optional
        .isLength({ max: 250 }) // Validates that length does not exceed 250 characters
        .withMessage('Caption must not exceed 250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),
];

const showMediaURLValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('media_url', 'Media url must be provided').not().isEmpty(),
    body('caption')
        .optional() // Makes caption optional
        .isLength({ max: 250 }) // Validates that length does not exceed 250 characters
        .withMessage('Caption must not exceed 250 characters.'),
    body('item_amount')
        .optional() // Makes item_amount optional
        .isFloat({ gt: 0 }) // Validates that, if provided, it must be a number greater than 0
        .withMessage('item_amount must be greater than 0 if provided.'),	
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),
    body('share_on_social_wall')
        .optional()
        .isInt({ min: 0, max: 1 })
        .withMessage('share_on_social_wall must be checked, has a value of 0 or 1.'),
    body('close_time')
        .optional()
	.matches(/^(1?[1-9]|2[0-4])\s?hours$|^(1?[1-9]|[1-2][0-9]|30)\s?days$|^(1?[1-9]|1[0-2])\s?months$/)
        .withMessage('close_time must be defined as "1-24 hours", "1-30 days", or "1-12 months'),
];

const deletePostValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    param('post_id', 'Post id must be provided').not().isEmpty(),
];

const addLikeCommentValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('post_id', 'Post id must be provided').not().isEmpty(),	
];

const removeLikeCommentValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    param('post_id', 'Post id must be provided').not().isEmpty(),
];

const addCommentValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('post_id', 'Post id must be provided').not().isEmpty(),
    body('comment', 'Comment id must be provided').not().isEmpty(),	
];

const removeLikeValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    param('like_id', 'Like id must be provided').not().isEmpty(),
];

const editCommentValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('comment_id', 'Comment id must be provided').not().isEmpty(),
    body('comment', 'Comment must be provided').not().isEmpty(),	
];

const removeCommentValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    param('comment_id', 'Comment id must be provided').not().isEmpty(),
];

const editItemValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('post_id', 'Comment id must be provided').not().isEmpty(),
    body('item_amount', 'Amount must be provided').not().isEmpty(),
    body('caption', 'Caption must be provided').not().isEmpty(),	
    body('share_on_social_wall','share_on_social_wall must be checked').not().isEmpty(),	
];

const getLikeCommentValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
    query('post_id', 'Post id must be provided').not().isEmpty(),
];

const userGroupMgmtValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('group_id', 'group_id must be provided').not().isEmpty(),
    body('friend_reference_number', 'friend_reference_number must be provided').not().isEmpty(),
];

const deleteUserFromGroupValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    param('group_id', 'group_id must be provided').not().isEmpty(),
    param('friend_reference_number', 'friend_reference_number must be provided').not().isEmpty(),
];

const getGroupChatsValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),	
    query('group_id', 'group_id must be provided').not().isEmpty(),
];

const removeGroupValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    param('group_id', 'group_id must be provided').not().isEmpty(),
];

const editGroupMessageValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('message_id', 'message_id must be provided').not().isEmpty(),
    body('message', 'message must be provided').not().isEmpty(),	
];

const removeGroupMessageValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    param('message_id', 'message_id must be provided').not().isEmpty(),
];

const changePrivacyStatusValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body("privacy_status", "Invalid privacy status. Must be one of: public, friends_only, anonymous").isIn(["public", "friends_only", "anonymous"]),
];

const targetProfileValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
    query('target_reference_number', 'target_reference_number must be provided').not().isEmpty(),
];

/*
const formDataValidator = [
    check('email', 'Email cannot be Empty').not().isEmpty(),
    check('email', 'Invalid email').isEmail(),
    check('reference_number', 'Reference number must be provided').not().isEmpty(),
];
*/

module.exports = { 
    multiUploadValidator,singleSocialUploadValidator,getUserDetailsValidator,
    friendOpValidator,getWallFeedValidator,socialMediaURLValidator,
    addLikeCommentValidator,removeLikeValidator,removeCommentValidator,
    editItemValidator,addCommentValidator,editCommentValidator,
    showMediaURLValidator,singleShowUploadValidator,getLikeCommentValidator,
    singleGroupChatUploadValidator,groupChatMediaURLValidator,
    userGroupMgmtValidator,editGroupMessageValidator,removeGroupMessageValidator,
    singleGroupMgmtUploadValidator,socialAIMediaURLValidator,
    getFriendDetailsValidator,changePrivacyStatusValidator,	
    targetProfileValidator,acceptFriendValidator,singleSocialWallUploadValidator,
    socialWallURLValidator,deletePostValidator,removeLikeCommentValidator,
    removeGroupValidator,deleteUserFromGroupValidator,getGroupChatsValidator	
};
