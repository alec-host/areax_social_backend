const express = require('express');

const friendController = require("../controllers/friends.controller");
const wallController = require("../controllers/social.wall.controller");
const likeController = require("../controllers/likes.controller");
const commentController = require("../controllers/comments.controller");
const buyController = require("../controllers/buy.controller");
const bidController = require("../controllers/bids.controller");
const groupChatController = require("../controllers/group.chat.controller");
const changeProfileStatusController = require("../controllers/user.profile.controller");
const fileController = require("../controllers/file.controller");
const flagController = require("../controllers/flag.controller");
const reportController = require("../controllers/report.controller");
const savedPostController = required("../controllers/saved.post.controller");

const inputValidator = require("../validation/common.validation");

const { s3UploadMiddleware } = require("../middleware/s3.bucket.upload");
const fileHandler = require("../middleware/file.upload.handler");

const auth = require("../middleware/auth");
const basicAuth = require("../middleware/basic.auth");

const router = express.Router();

/*
 *-email
 *-reference_number
 *
 * */
router.get('/friend/potential-matches',auth,inputValidator.getUserDetailsValidator,friendController.GetPotentialFriendList);
/*
 *-email
 *-reference_number
 *-friend_reference_number
 *
 * */
router.post('/friend-request',auth,inputValidator.friendOpValidator,friendController.MakeFriendRequest);
/*
 *
 *-email
 *-reference_number
 *
*/
router.get('/friend-request',auth,inputValidator.getUserDetailsValidator,friendController.GetFriendRequest);
/*
 *-email
 *-reference_number
 *-friend_reference_number
 *
 * */
router.post('/friend-request/accept',auth,inputValidator.acceptFriendValidator,friendController.AcceptFriend);
/*
 *-email
 *-reference_number
 *-friend_category.
 *
 * */
router.get('/friend',auth,inputValidator.getFriendDetailsValidator,friendController.MyFriendList);
/*
 *-email
 *-reference_number
 *-friend_reference_number
 *
 * */
router.post('/friend/block',auth,inputValidator.friendOpValidator,friendController.BlockFriend);
/*
 *-email
 *-reference_number
 *-friend_reference_number
 *
 * */
router.post('/friend/unblock',auth,inputValidator.friendOpValidator,friendController.UnblockFriend);
/*
 *-email
 *-reference_number
 *-post_type
 *
 * */
router.get('/social-content'/*,auth*/,inputValidator.getWallFeedValidator,wallController.GetWallContent);
/*
 *
 *-email
 *-reference_number
 *-file
 *-caption
 *-gps_coordinates
 *-type
 *-is_buy_enabled
 *-is_comment_allowed
 *-is_minted_automatically
 *
 * */
router.post('/social-content',auth,fileHandler.uploadMiddleware,inputValidator.singleSocialWallUploadValidator,wallController.SaveSocialContent);
/*
 *
 *-email
 *-reference_number
 *-media_url
 *-caption
 *-gps_coordinates
 *-type
 *-is_buy_enabled
 *-is_comment_allowed
 *-is_minted_automatically 
 *
 * */
router.post('/social-content/url',auth,inputValidator.socialWallURLValidator,wallController.SaveSocialContent);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.delete('/social-content/:post_id',auth,inputValidator.deletePostValidator,wallController.DeleteSocialPost);
/*
 *
 *-email
 *-reference_number
 *-media_url
 *-caption
 *-gps_coordinates
 *-category
 *
 * */
router.post('/social-content/ai',basicAuth,inputValidator.socialAiMediaURLValidator,wallController.SaveSocialAIContent);
/*
 *
 *-email
 *-reference_number
 *-file
 *-caption
 *-gps_coordinates
 *-share_on_social_wall
 *
 * */
router.post('/social-content/show',auth,fileHandler.uploadMiddleware,inputValidator.singleShowUploadValidator,wallController.SaveShowContent);
/*
 *
 *-email
 *-reference_number
 *-media_url
 *-caption
 *-gps_coordinates
 *-share_on_social_wall
 *
 * */
router.post('/social-content/show/url',auth,inputValidator.showMediaURLValidator,wallController.SaveShowContent);
/*
 *
 *-email
 *-reference_number
 *-file
 *-caption
 *-is_public {1 - public, 0 - private}
 *
 * */
router.post('/group-share-content',auth,fileHandler.uploadMiddleware,inputValidator.singleSocialSharedUploadValidator,wallController.SaveShareContent);
/*
 *
 *-email
 *-reference_number
 *-media_url
 *-caption
 *-is_public {1 - public, 0 - private}
 *
 * */
router.post('/group-share-content/url',auth,inputValidator.socialSharedMediaURLValidator,wallController.SaveShareContent);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.post('/like',auth,inputValidator.addLikeCommentValidator,likeController.AddLike);
/*
 *
 *-email
 *-reference_number
 *-like_id
 *
 * */
router.delete('/like/:like_id',auth,inputValidator.removeLikeValidator,likeController.RemoveLike);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.get('/like'/*,auth*/,inputValidator.getLikeCommentValidator,likeController.GetUserLikes);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.get('/like/count',auth,inputValidator.getLikeCommentValidator,likeController.GetLikeCount);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *-comment
 *
 * */
router.post('/comment',auth,inputValidator.addCommentValidator,commentController.AddComment);
/*
 *
 *-email
 *-reference_number
 *-comment_id
 *-comment
 *
 * */
router.patch('/comment',auth,inputValidator.editCommentValidator,commentController.EditComment);
/*
 *
 *-email
 *-reference_number
 *-comment_id
 *
 * */
router.delete('/comment/:comment_id',auth,inputValidator.removeCommentValidator,commentController.RemoveComment);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.get('/comment',auth,inputValidator.getLikeCommentValidator,commentController.GetComment);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.get('/comment/count',auth,inputValidator.getLikeCommentValidator,commentController.GetCommentCount);
/*
 *
 *-email
 *-reference_number
 *-media_url
 *-caption
 *-item_amount
 *-gps_coordinates
 *-share_on_social_wall
 *-close_time
 *
 * */
router.post('/closed-bid',auth,inputValidator.showMediaURLValidator,wallController.SaveShowClosedBidContent);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.get('/closed-bid',auth,inputValidator.getLikeCommentValidator,bidController.GetClosedBid);
/*
 *
 *-email
 *-reference_number
 *-media_url
 *-caption
 *-item_amount
 *-gps_coordinates
 *-share_on_social_wall
 *
 * */
router.post('/open-bid',auth,inputValidator.showMediaURLValidator,wallController.SaveShowOpenBidContent);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.get('/open-bid',auth,inputValidator.getLikeCommentValidator,bidController.GetOpenBid);
/*
 *
 *-email
 *-reference_number
 *-file
 *-caption
 *-item_amount
 *-gps_coordinates
 *-share_on_social_wall
 *
 * */
router.post('/buy-content',auth,fileHandler.uploadMiddleware,inputValidator.singleShowUploadValidator,wallController.SaveShowContent);
/*
 *
 *-email
 *-reference_number
 *-media_url
 *-caption
 *-item_amount
 *-gps_coordinates
 *-share_on_social_wall
 *
 * */
router.post('/buy-content/url',auth,inputValidator.showMediaURLValidator,wallController.SaveShowContent);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *-item_amount
 *-caption
 *-share_on_social_wall
 *
 * */
router.patch('/buy-content',auth,inputValidator.editItemValidator,buyController.EditBuyPostContent);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.delete('/buy-content/:post_id',auth,inputValidator.deletePostValidator,buyController.DeleteBuyPostContent);
/*
 *
 *-email
 *-reference_number
 *-group_name
 *-group_caption
 *-file
 *
*/
router.post('/group',auth,fileHandler.uploadMiddleware,inputValidator.singleGroupMgmtUploadValidator,groupChatController.CreateGroup);
/*
 *
 *-email
 *-reference_number
 *-group_id
 *
*/
router.delete('/group/:group_id',auth,inputValidator.removeGroupValidator,groupChatController.DeleteGroup);
/*
 *
 *-email
 *-reference_number
 *-group_id
 *-friend_reference_number
 *
*/
router.post('/group/user',auth,inputValidator.userGroupMgmtValidator,groupChatController.AddUserToGroup);
/*
 *
 *-email
 *-reference_number
 *-group_id
 *-friend_reference_number
 *
*/
router.delete('/group/user/:group_id/:friend_reference_number',auth,inputValidator.deleteUserFromGroupValidator,groupChatController.RemoveUserFromGroup);
/*
 *
 *-email
 *-reference_number
 *-group_id
 *-message
 *-file
 *
*/
router.post('/group/message',auth,fileHandler.uploadMiddleware,inputValidator.singleGroupChatUploadValidator,groupChatController.SendGroupChatMessage);
/*
 *
 *-email
 *-reference_number
 *-group_id
 *-message
 *-media_url
 *
*/
router.post('/group/message/url',auth,inputValidator.groupChatMediaURLValidator,groupChatController.SendGroupChatMessage);
/*
 *
 *-email
 *-reference_number
 *-message_id
 *-message
 *
*/
router.patch('/group/message',auth,inputValidator.editGroupMessageValidator,groupChatController.EditGroupChatMessage);
/*
 *
 *-email
 *-reference_number
 *-message_id
 *
*/
router.delete('/group/message/:message_id',auth,inputValidator.removeGroupMessageValidator,groupChatController.DeleteGroupChatMessage);
/*
 *
 *-email
 *-reference_number
 *-group_id
 *
*/
router.get('/group/message',auth,inputValidator.getGroupChatsValidator,groupChatController.GetGroupChatMessages);
/*
 *
 *-email
 *-reference_number
 *-target_reference_number
 *
*/
router.get('/profile',auth,inputValidator.targetProfileValidator,friendController.ViewTargetProfile);
/*
 *
 *-email
 *-reference_number
 *-privacy_status
 *
*/
router.patch('/profile/privacy-status',auth,inputValidator.changePrivacyStatusValidator,changeProfileStatusController.ChangeProfileStatus);
/*
 *
 *-email
 *-reference_number
 *-file
 *
*/
router.post('/file/upload',auth,inputValidator.uploadS3Validator,s3UploadMiddleware,fileController.uploadFile);
/*
 *
 *-email
 *-reference_number
 *-file_type
 *-page
 *-limit
 *
*/
router.get('/file/fetch',auth,inputValidator.getUploadedFilesValidator,fileController.getFiles);
/*
 *
 *-email
 *-reference_number
 *-id
 *
*/
router.get('/file/:file_id',auth,inputValidator.getUploadedFileValidator,fileController.getFile);
/*
 *
 *-email
 *-reference_number
 *
*/
router.delete('/file/:file_id',auth,inputValidator.deleteUploadedFileValidator,fileController.deleteFile);
/*
 *
 *-email
 *-reference_number
 *-flag
 *-post_id
 *
 * */
router.patch('/toggle/like/:post_id',auth,inputValidator.togglFlagValidator,flagController.toggleLikeFlag);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.patch('/toggle/save/:post_id',auth,inputValidator.togglFlagValidator,flagController.toggleSaveFlag);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.patch('/toggle/report/:post_id',basicAuth,inputValidator.togglFlagValidator,flagController.toggleReportFlag);
/*
 *
 *-email
 *-reference_number
 *-vote type
 *-feedback
 *-post_id
 *
 * */
router.post('/report',auth,inputValidator.postReportValidator,reportController.savePost);
/*
 *
 *-email
 *-reference_number
 *-reply
 *-post_id
 *-comment_id
 *
 * */
router.post('/comment/reply',auth,inputValidator.commentReplyValidator,commentController.AddCommentReply);
/*
 *
 *-email
 *-reference_number
 *-comment_id
 *
 * */
router.get('/comment/reply',auth,inputValidator.getCommentReplyValidator,commentController.GetCommentReplies);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.post('/save',auth,inputValidator.togglFlagValidator,savedPostController.addSavedPost);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.delete('/save/:post_id',auth,inputValidator.togglFlagValidator,savedPostController.removeSavedPost);

module.exports = router;
