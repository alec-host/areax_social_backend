const path = require('path');
const { body, query, check, param, oneOf } = require("express-validator");
const { withDefault } = require("../middleware/default.value.handler");

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
        .isLength({ max: 5250 })
        .withMessage('Caption must not exceed 5250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),
    body('location_name')
        .optional()
        .isString()
        .withMessage('location_name must be a string if provided'),
    body('is_public')
        .exists({ checkFalsy: true })
        .withMessage('Missing: is_public must be checked')
        .bail()
        .isIn(['everyone', 'private'])
        .withMessage('is_public must be either "everyone", "private"'),
    body('type')
        .optional({ checkFalsy: true }) // allow missing or empty fields
        .customSanitizer(value => {
            return value ? value : 'other'; // default to 'other' if not provided
        })
        .custom(value => {
            const allowed = ['image', 'video', 'other'];
            if(!allowed.includes(value)) {
               throw new Error('Invalid type: must be "image", "video", or empty (defaults to "other")');
            }
            return true;
        }),
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

const singleSocialWallGroupUploadValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('group_reference_number', 'Missing: Group reference number must be checked').not().isEmpty(),	
    body('caption')
        .optional()
        .isLength({ max: 5250 })
        .withMessage('Caption must not exceed 250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),

    body('is_public')
        .exists({ checkFalsy: true })
        .withMessage('Missing: is_public must be provided')
        .bail()
        .isString()
        .withMessage('Invalid type: is_public must be a string')
        .isIn(['private'])
        .withMessage('Invalid value: is_public must be "private" for group post'),
    body('type')
        .optional({ checkFalsy: true }) // allow missing or empty fields
        .customSanitizer(value => {
            return value ? value : 'other'; // default to 'other' if not provided
        })
        .custom(value => {
            const allowed = ['image', 'video', 'other'];
            if(!allowed.includes(value)) {
               throw new Error('Invalid type: must be "image", "video", or empty (defaults to "other")');
            }
            return true;
        }),
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
        .isLength({ max: 5250 })
        .withMessage('Caption must not exceed 250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),
    body('is_public')
        .exists({ checkFalsy: true })
        .withMessage('Missing: is_public must be checked')
        .bail()
        .isIn(['everyone', 'inner-circle', 'private'])
        .withMessage('is_public must be either "everyone", "inner-circle", "private"'),
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

const singleSocialSharedUploadValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('caption')
        .optional()
        .isLength({ max: 5250 })
        .withMessage('Caption must not exceed 250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),
    body('is_public')
        .exists({ checkFalsy: true })
        .withMessage('Missing: is_public must be checked')
        .bail()
        .isIn(['everyone', 'private'])
        .withMessage('is_public must be either "everyone", "private"'),
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
    body('is_public')
        .exists({ checkFalsy: true })
        .withMessage('Missing: is_public must be checked')
        .bail()
        .isIn(['everyone', 'inner-circle', 'private'])
        .withMessage('is_public must be either "everyone", "inner-circle", "private"'),
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

const groupWallURLValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('group_reference_number', 'Group reference number must be provided').not().isEmpty(),	
    body('media_url','Media url must be provided').not().isEmpty(),
    body('caption')
        .optional() // Makes caption optional
        .isLength({ max: 5250 }) // Validates that length does not exceed 250 characters
        .withMessage('Caption must not exceed 5250 characters.'),
    body('gps_coordinates')
        .optional()
        .matches(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/)
        .withMessage('Invalid GPS coordinates format. Must be in "latitude,longitude", format'),
    body('is_public')
        .exists({ checkFalsy: true })
        .withMessage('Missing: is_public must be checked')
        .bail()
        .isIn(['everyone', 'inner-circle', 'private'])
        .withMessage('is_public must be either "everyone", "inner-circle", "private"'),
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
    withDefault('max_members',450),	
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('group_name', 'Missing: group_name must be checked').not().isEmpty(),
    body('group_caption')
        .optional()
        .isLength({ max: 5250 })
        .withMessage('Missing: group_caption must not exceed 5250 characters.'),
    body('max_members')
	.optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('max_members must be checked, has a value of between 1 to 1000.'),	
    (req, res, next) => {
        if(!req.file){
            //throw new Error('No file uploaded');
            //return res.status(400).json({ success: false, error: true, message: 'No files uploaded' });
            return next();
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

const singlePrivateGroupMgmtUploadValidator = [
    withDefault('max_members',450),
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('group_name', 'Missing: group_name must be checked').not().isEmpty(),
    body('group_caption')
        .optional()
        .isLength({ max: 5250 })
        .withMessage('Missing: group_caption must not exceed 5250 characters.'),
    body('max_members')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('max_members must be checked, has a value of between 1 to 1000.'),
    //body("is_private")
    //    .isIn([1])
    //    .withMessage('is_private  must be checked, has a value of 1.'),	
    body('event_support')
        .isInt({ min: 0, max: 1 })
        .withMessage('event_support must be checked, has a value of 0 or 1.'),
    body('live_stream_support')
        .isInt({ min: 0, max: 1 })
        .withMessage('live_stream_support must be checked, has a value of 0 or 1.'),
    body('buy_sell_support')
        .isInt({ min: 0, max: 1 })
        .withMessage('buy_sell_support must be checked, has a value of 0 or 1.'),
    body('gift_token_support')
        .isInt({ min: 0, max: 1 })
        .withMessage('gift_token_support must be checked, has a value of 0 or 1.'),	
    body('is_secret_group')
        .isInt({ min: 0, max: 1 })
        .withMessage('is_secret_group must be checked, has a value of 0 or 1.'),	
    (req, res, next) => {
        if(!req.file){
            //throw new Error('No file uploaded');
            //return res.status(400).json({ success: false, error: true, message: 'No files uploaded' });
            return next();
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

const singlePaidGroupMgmtUploadValidator = [
    withDefault('max_members',450),
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('group_name', 'Missing: group_name must be checked').not().isEmpty(),
    body('group_caption')
        .optional()
        .isLength({ max: 5250 })
        .withMessage('Missing: group_caption must not exceed 5250 characters.'),
    body('price_amount')
	.optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Price amount must be a decimal number with up to 2 decimal places'),
    body('subscription_interval')
       .optional()	
       .isIn(['monthly', 'yearly', 'weekly'])
       .withMessage('Subscription interval must be one of: monthly, yearly, weekly'),
    body('max_members')
        .optional()	
        .isInt({ min: 1, max: 1000 })
        .withMessage('max_members must be checked, has a value of between 1 to 1000.'),
    body("is_secret_group")
	.isIn([0, 1])
        .withMessage('is_secret_group must be checked, has a value of either 0 or 1.'),	
    body("live_stream_support")
        .isIn([0, 1])
        .withMessage('live_stream_support must be checked, has a value of either 0 or 1.'),
    body("event_support")
        .isIn([0, 1])
        .withMessage('event_support must be checked, has a value of either 0 or 1.'),
    body("buy_sell_support")
        .isIn([0, 1])
        .withMessage('buy_sell_support must be checked, has a value of either 0 or 1.'),
    body("gift_token_support")
        .isIn([0, 1])
        .withMessage('gift_token_support must be checked, has a value of either 0 or 1.'),	
    (req, res, next) => {
        if(!req.file){
            //throw new Error('No file uploaded');
            //return res.status(400).json({ success: false, error: true, message: 'No files uploaded' });
            return next();
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
        .isFloat({ gt: 0 })
        .withMessage('item_amount must be greater than 0 if provided.'),
    body('caption')
        .optional()
        .isLength({ max: 5250 })
        .withMessage('Caption must not exceed 250 characters.'),
    body('location_name', 'Missing: location_name must be checked').not().isEmpty(),
    body('type')
        .optional({ checkFalsy: true })
        .customSanitizer(value => {
            return value ? value : 'other';
        })
        .custom(value => {
            const allowed = ['image', 'video', 'other'];
            if(!allowed.includes(value)) {
               throw new Error('Invalid type: must be "image", "video", or empty (defaults to "other")');
            }
            return true;
        }),
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
    query('collection_reference_number')
      .optional()
      .not().isEmpty().withMessage('collection_reference_number, if provided, must not be empty')
      .custom(value => value !== null).withMessage('collection_reference_number must not be null'),	
    query('hashtag')
      .optional()
      .not().isEmpty().withMessage('Hashtag, if provided, must not be empty')
      .custom(value => value !== null).withMessage('Hashtag must not be null'),
    query('cursor')
      .optional()
      .not().isEmpty().withMessage('Cursor, if provided, must not be empty')
      .custom(value => value !== null).withMessage('Cursor must not be null'),	
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

const socialAiMediaURLValidator = [
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

const socialSharedMediaURLValidator = [
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
    body('is_public')
        .exists({ checkFalsy: true })
        .withMessage('Missing: is_public must be checked')
        .bail()
        .isIn(['everyone', 'private'])
        .withMessage('is_public must be either "everyone", "private"'),
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
    body('group_reference_number', 'group_reference_number must be provided').not().isEmpty(),
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
        .isLength({ max: 5250 }) // Validates that length does not exceed 250 characters
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
    param('post_id')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Post id must be provided and not be empty')
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
    param('comment_id')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Comment id must be provided and not be empty')
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
    body('group_reference_number', 'group_reference_number must be provided').not().isEmpty(),
    body('member_reference_number', 'member_reference_number must be provided').not().isEmpty(),
];

const addMultipleUserserValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('group_reference_number', 'group_reference_number must be provided').not().isEmpty(),
    body('member_reference_numbers', 'member_reference_numbers must be provided').notEmpty(),
    body('member_reference_numbers', 'member_reference_numbers must be a non-empty array').isArray({ min: 1 }),
    body('member_reference_numbers.*', 'Each member_reference_number must be a non-empty string')
        .isString()
        .notEmpty()
        .trim()
        .escape()
];

const deleteUserFromGroupValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    param('group_id', 'group_id must be provided').not().isEmpty(),
    param('member_reference_number', 'member_reference_number must be provided').not().isEmpty(),
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
    body('reference_number', 'Reference number must be provided').not().isEmpty(),	
    body('group_reference_number', 'group_reference_number must be provided').not().isEmpty(),
];

const getGroupsValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
    query('page')
      .exists({ checkFalsy: true }).withMessage('page must be provided')
      .isInt({ min: 1 }).withMessage('page must be an integer >= 1'),
    query('limit')
      .exists({ checkFalsy: true }).withMessage('limit must be provided')
      .isInt({ min: 1, max: 100 }).withMessage('limit must be an integer between 1 and 100'),	
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

const togglFlagValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    param('post_id', 'Post id must be provided').not().isEmpty(),
    body('flag')
    .exists().withMessage('Flag must be provided')
    .bail()
    .customSanitizer(value => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
      }
      return value;
    })
    .isBoolean().withMessage('Flag must be a boolean value: true or false')
];

const reportedPostValidator = [
  body('email', 'Email cannot be Empty').not().isEmpty(),
  body('email', 'Invalid email').isEmail(),
  body('reference_number', 'Reference number must be provided').not().isEmpty(),
  /*body('vote_type')
    .exists({ checkFalsy: true }).withMessage('vote_type is required')
    .isIn(['upvote', 'downvote']).withMessage('vote_type must be either "upvote" or "downvote"'),*/
  body('post_id')
    .exists({ checkFalsy: true }).withMessage('post_id must be provided')
    .isInt().withMessage('post_id must be an integer'),
  body('feedback')
    .optional()
    .isString().withMessage('feedback must be text'),
];

const reportedGroupPostValidator = [
  body('email', 'Email cannot be Empty').not().isEmpty(),
  body('email', 'Invalid email').isEmail(),
  body('reference_number', 'Reference number must be provided').not().isEmpty(),
  body('group_reference_number', 'Group reference number must be provided').not().isEmpty(),	
  /*body('vote_type')
    .exists({ checkFalsy: true }).withMessage('vote_type is required')
    .isIn(['upvote', 'downvote']).withMessage('vote_type must be either "upvote" or "downvote"'),*/
  body('post_id')
    .exists({ checkFalsy: true }).withMessage('post_id must be provided')
    .isInt().withMessage('post_id must be an integer'),
  body('feedback')
    .optional()
    .isString().withMessage('feedback must be text'),
];

const uploadS3Validator = [
   body('email', 'Email cannot be Empty').not().isEmpty(),
   body('email', 'Invalid email').isEmail(),
   body('reference_number', 'Reference number must be provided').not().isEmpty(),
];

const getUploadedFilesValidator = [
   query('email', 'Email cannot be Empty').not().isEmpty(),
   query('email', 'Invalid email').isEmail(),
   query('reference_number', 'Reference number must be provided').not().isEmpty(),
   query('page')
      .exists({ checkFalsy: true }).withMessage('page must be provided')
      .isInt({ min: 1 }).withMessage('page must be an integer >= 1'),
   query('limit')
      .exists({ checkFalsy: true }).withMessage('limit must be provided')
      .isInt({ min: 1, max: 100 }).withMessage('limit must be an integer between 1 and 100'),
];

const getUploadedFileValidator = [
   query('email', 'Email cannot be Empty').not().isEmpty(),
   query('email', 'Invalid email').isEmail(),
   query('reference_number', 'Reference number must be provided').not().isEmpty(),
   param('file_id', 'file_id must be provided').not().isEmpty(),
];

const deleteUploadedFileValidator = [
   body('email', 'Email cannot be Empty').not().isEmpty(),
   body('email', 'Invalid email').isEmail(),
   body('reference_number', 'Reference number must be provided').not().isEmpty(),
   param('file_id', 'file_id must be provided').not().isEmpty(),
];

const commentReplyValidator = [
   body('email', 'Email cannot be Empty').not().isEmpty(),
   body('email', 'Invalid email').isEmail(),
   body('reference_number', 'Reference number must be provided').not().isEmpty(),
   body('reply', 'reply must be provided').not().isEmpty(),
   body('post_id', 'post id must be provided').not().isEmpty(),
   body('comment_id', 'comment id must be provided').not().isEmpty(),
];

const getCommentReplyValidator = [
   query('email', 'Email cannot be Empty').not().isEmpty(),
   query('email', 'Invalid email').isEmail(),
   query('reference_number', 'Reference number must be provided').not().isEmpty(),
   query('comment_id', 'comment_id must be provided').not().isEmpty(),
];

const addSavedPostValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('post_id', 'Post id must be provided').not().isEmpty(),
];

const getSavedPostValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
];

const getPaginationValidator = [
    query('page')
      .exists({ checkFalsy: true }).withMessage('page must be provided')
      .isInt({ min: 1 }).withMessage('page must be an integer >= 1'),
    query('limit')
      .exists({ checkFalsy: true }).withMessage('limit must be provided')
      .isInt({ min: 1, max: 100 }).withMessage('limit must be an integer between 1 and 100'),
];

const joinGroupValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('invite_link', 'Invite code number must be provided').not().isEmpty(),
    /*	
    oneOf([
       body('invite_code').notEmpty(),
       body('invite_link').notEmpty()
    ], 'Either invite code or invite link must be provided')
    */ 
];

const searchUserValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('search_query', 'Search query number must be provided').not().isEmpty(),
];

const wallpaperValidator = [
    param('media_id', 'media_id must be provided').not().isEmpty()
];

const postWallpaperValidator = [
    body('category', 'category must be provided - [Other Worlds, Metaverse Mood, Animated 3D Worlds]').not().isEmpty()
];

const googleWallpaperValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('lat', 'Latitude must be provided').notEmpty(),
    body('lat', 'Latitude must be a valid number').isFloat({ min: -90, max: 90 }),
    body('lng', 'Longitude must be provided').notEmpty(),
    body('lng', 'Longitude must be a valid number').isFloat({ min: -180, max: 180 })	
];

const getWallpaperValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),	
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('page must be an integer >= 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 500 }).withMessage('limit must be an integer between 1 and 500'),
];

const getWallpaperAdminValidator = [
    query('page')
      .exists({ checkFalsy: true }).withMessage('page must be provided')
      .isInt({ min: 1 }).withMessage('page must be an integer >= 1'),
    query('limit')
      .exists({ checkFalsy: true }).withMessage('limit must be provided')
      .isInt({ min: 1, max: 100 }).withMessage('limit must be an integer between 1 and 100'),
    query('category')
       .optional()
       .isString().withMessage('category must be a string')
       .trim()
       .escape()	
];

const groupAddBackgroundImageValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('group_reference_number', 'group_reference_number must be provided').not().isEmpty(),	
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

const groupAddNameValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('group_reference_number', 'group_reference_number must be provided').not().isEmpty(),
    body('group_name', 'group_name must be provided').not().isEmpty(),	
];

const groupAddCaptionValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('group_reference_number', 'group_reference_number must be provided').not().isEmpty(),
    body('group_caption', 'group_caption must be provided').not().isEmpty(),
];

const getGroupPaginationValidator = [
    query('email', 'Missing: email must be checked').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    query('group_reference_number', 'group_reference_number must be provided').not().isEmpty(),	
    query('page')
      .exists({ checkFalsy: true }).withMessage('page must be provided')
      .isInt({ min: 1 }).withMessage('page must be an integer >= 1'),
    query('limit')
      .exists({ checkFalsy: true }).withMessage('limit must be provided')
      .isInt({ min: 1, max: 100 }).withMessage('limit must be an integer between 1 and 100'),
];

const groupSwitchRoleValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('group_reference_number', 'group_reference_number must be provided').not().isEmpty(),
    body('member_reference_number', 'member_reference_number must be provided').not().isEmpty(),
    body('role', 'role must be provided').not().isEmpty(),	
];

const groupMuteUserValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('group_reference_number', 'group_reference_number must be provided').not().isEmpty(),
    body('member_reference_number', 'member_reference_number must be provided').not().isEmpty(),
    body('reason')
      .optional({ checkFalsy: true })
      .isString()
      .withMessage('Invalid: reason must be a string if provided')
      .isLength({ max: 255 })
      .withMessage('Invalid: reason must not exceed 255 characters'),
];

const getGroupDetailsValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
    query('group_reference_number', 'Group reference number must be provided').not().isEmpty(),	
];

const connectionRequestValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('friend_reference_number', 'Friend reference number must be provided').not().isEmpty(),
    body('connection_type', 'Friend reference number must be provided').not().isEmpty()	
      .exists({ checkFalsy: true })
      .withMessage('Missing: connection_type must be checked')
      .bail()
      .isIn(['inner-circle', 'follow'])
      .withMessage('connection_type must be either "inner-circle", "follow"'),	
];

const getProfileWallFeedValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
    query('target_reference_number', 'Target reference number must be provided').not().isEmpty(),	
    query('post_type', 'Post type must be provided').not().isEmpty(),
    query('page', 'Page number must be provided').not().isEmpty().isInt({ gt: 0 }).withMessage('Page must be a number greater than 0'),
    query('limit', 'Limit must be provided').not().isEmpty().isInt({ gt: 0, lt: 101 }).withMessage('Limit must be a number between 1 and 100'),
];

const connectionUserListValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
    query('target_reference_number', 'target_reference_number must be provided').not().isEmpty(),
    query('page', 'Page number must be provided').not().isEmpty().isInt({ gt: 0 }).withMessage('Page must be a number greater than 0'),
    query('limit', 'Limit must be provided').not().isEmpty().isInt({ gt: 0, lt: 21 }).withMessage('Limit must be a number between 1 and 20'),	
];

const getPendingConnectionValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
    query('type', 'Type number must be provided').not().isEmpty()
      .exists({ checkFalsy: true })
      .withMessage('Missing: connection_type must be checked')
      .bail()
      .isIn(['sender', 'receiver'])
      .withMessage('type must be either "sender", "receiver"'),	
];

const removeConnectionValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('initiator_reference_number', 'Initiator reference number must be provided').not().isEmpty(),
];

const targetUserProfileMetricsValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
    query('target_reference_number', 'target_reference_number must be provided').not().isEmpty(),	
];

const targetUserGroupMetricsValidator = [
    query('email', 'Email cannot be Empty').not().isEmpty(),
    query('email', 'Invalid email').isEmail(),
    query('reference_number', 'Reference number must be provided').not().isEmpty(),
    query('group_reference_number', 'group_reference_number must be provided').not().isEmpty(),	
    query('target_reference_number', 'target_reference_number must be provided').not().isEmpty(),
];

const changeGroupMemberPictureValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('picture_url', 'Picture url  must be provided').not().isEmpty(),
];

const groupInviteApprovalValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('group_reference_number', 'group_reference_number must be provided').not().isEmpty(),
    body('recipient_reference_number', 'recipient_reference_number must be provided').not().isEmpty(),
    body('is_approved')
        .isInt({ min: 0, max: 1 })
        .withMessage('is_approved must be checked, has a value of 0 or 1.'),
	
];

const reviewReportedUserValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    //body('reviewer_reference_number', 'reviewer_reference_number must be provided').not().isEmpty(),
    body('review_status')
        .exists({ checkFalsy: true })
        .withMessage('Missing: review_status must be checked')
        .bail()
        .isIn(['reviewed', 'dismissed', 'actioned'])
        .withMessage('review_status must be either "reviewed", "dismissed", or "actioned"'),	
    body('report_id', 'report_id must be provided').not().isEmpty().isInt({ gt: 0 }).withMessage('report_id must be atleast 1'),
];

const innerCircleTagValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    param('target_reference_number', 'Target reference number must be provided').not().isEmpty(),
    param('is_set')
        .isInt({ min: 0, max: 1 })
        .withMessage('is_set must be checked, has a value of 0 untag user as inner-circle or 1 - tag user as inner-circle.'),	
];

const createCollectionValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    //body('post_id', 'Post id must be provided').not().isEmpty(),
    body('collection_name', 'collection_name must be provided').not().isEmpty(),
    body('invitee_reference_numbers', 'invitee_reference_numbers must be provided in format: [invitee_reference_numbers]').not().isEmpty(),	
    body('is_collection_shared')
        .isInt({ min: 0, max: 1 })
        .withMessage('is_collection_shared must be checked, 0 - mark as not shared or 1 - mark as shared.'),
	
];

const addCollectionInviteValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('collection_reference_number', 'collection_reference_number must be provided').not().isEmpty(),
    body('invitee_reference_numbers', 'invitee_reference_numbers must be provided').not().isEmpty(),
];

const acceptRejectCollectionValidator = [
    body('email', 'Missing: email must be checked').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Missing: reference_number must be checked').not().isEmpty(),
    body('collection_reference_number', 'Missing: collection_reference_number must be checked').not().isEmpty(),	
    body('is_accepted')
        .isInt({ min: 0, max: 1 })
        .withMessage('is_accepted must be checked, 0 - declined invite or 1 - accepted invite.'),	
];

const savePostToCollectionValidator = [
    body('email', 'Email cannot be Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('reference_number', 'Reference number must be provided').not().isEmpty(),
    body('collection_reference_number', 'collection_reference_number must be provided').not().isEmpty(),
    body('post_id', 'post_id must be provided').not().isEmpty(),
];

/*
  *-email
 *-reference_number
 *-reviewer_reference_number
 *-review_status
 *-report_id

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
    removeGroupValidator,deleteUserFromGroupValidator,getGroupChatsValidator,
    socialSharedMediaURLValidator,singleSocialSharedUploadValidator,
    socialAiMediaURLValidator,togglFlagValidator,reportedPostValidator,
    uploadS3Validator,getUploadedFilesValidator,getUploadedFileValidator,
    deleteUploadedFileValidator,commentReplyValidator,getCommentReplyValidator,
    addSavedPostValidator,getSavedPostValidator,singlePaidGroupMgmtUploadValidator,
    getGroupsValidator,getPaginationValidator,joinGroupValidator,
    searchUserValidator,wallpaperValidator,getWallpaperValidator,getWallpaperAdminValidator,
    groupAddBackgroundImageValidator,groupAddNameValidator,groupAddCaptionValidator,
    postWallpaperValidator,addMultipleUserserValidator,googleWallpaperValidator,
    singleSocialWallGroupUploadValidator,reportedGroupPostValidator,getGroupPaginationValidator,
    groupSwitchRoleValidator,groupMuteUserValidator,getGroupDetailsValidator,connectionRequestValidator,
    getProfileWallFeedValidator,connectionUserListValidator,getPendingConnectionValidator,
    removeConnectionValidator,targetUserProfileMetricsValidator,groupWallURLValidator,
    singlePrivateGroupMgmtUploadValidator,targetUserGroupMetricsValidator,
    changeGroupMemberPictureValidator,groupInviteApprovalValidator,reviewReportedUserValidator,
    innerCircleTagValidator,createCollectionValidator,addCollectionInviteValidator,
    savePostToCollectionValidator,acceptRejectCollectionValidator	
};
