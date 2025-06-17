const express = require('express');

const friendController = require("../controllers/friends.controller");
const wallController = require("../controllers/social.wall.controller");
const likeController = require("../controllers/likes.controller");
const commentController = require("../controllers/comments.controller");
const buyController = require("../controllers/buy.controller");
const bidController = require("../controllers/bids.controller");
const groupChatController = require("../controllers/group.chat.controller");
const changeProfileStatusController = require("../controllers/user.profile.controller");

const inputValidator = require("../validation/common.validation");

const fileHandler = require("../middleware/file.upload.handler");

const auth = require("../middleware/auth");
const basicAuth = require("../middleware/basic.auth");

const router = express.Router();

/*
 *-email
 *-reference_number
 *
 * */
router.get('/getPotentialFriends',auth,inputValidator.getUserDetailsValidator,friendController.GetPotentialFriendList);
/*
 *-email
 *-reference_number
 *-friend_reference_number
 *
 * */
router.post('/friendRequest',auth,inputValidator.friendOpValidator,friendController.MakeFriendRequest);
/*
 *-email
 *-reference_number
 *-friend_category.
 *
 * */
router.get('/myFriendList',auth,inputValidator.getFriendDetailsValidator,friendController.MyFriendList);
/*
 *-email
 *-reference_number
 *-friend_reference_number
 *
 * */
router.post('/acceptFriend',auth,inputValidator.acceptFriendValidator,friendController.AcceptFriend);
/*
 *-email
 *-reference_number
 *-friend_reference_number
 *
 * */
router.post('/blockFriend',auth,inputValidator.friendOpValidator,friendController.BlockFriend);
/*
 *-email
 *-reference_number
 *-post_type
 *
 * */
router.get('/getWallContent',auth,inputValidator.getWallFeedValidator,wallController.GetWallContent);
/*
 *
 *-email
 *-reference_number
 *-file
 *-caption
 *-gps_coordinates
 *
 * */
router.post('/socialContent',auth,fileHandler.uploadMiddleware,inputValidator.singleSocialUploadValidator,wallController.SaveSocialContent);
/*
 *
 *-email
 *-reference_number
 *-media_url
 *-caption
 *-gps_coordinates
 *
 * */
router.post('/socialContentWithURL',auth,inputValidator.socialMediaURLValidator,wallController.SaveSocialContent);
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
router.post('/socialAIContent',basicAuth,inputValidator.socialMediaURLValidator,wallController.SaveSocialAIContent);
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
router.post('/showContent',auth,fileHandler.uploadMiddleware,inputValidator.singleShowUploadValidator,wallController.SaveShowContent);
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
router.post('/showContentWithURL',auth,inputValidator.showMediaURLValidator,wallController.SaveShowContent);
/*
 *
 *-email
 *-reference_number
 *-file
 *-caption
 *-is_public {1 - public, 0 - private}
 *
 * */
router.post('/groupShareContent',auth,fileHandler.uploadMiddleware,inputValidator.singleSocialUploadValidator,wallController.SaveShareContent);
/*
 *
 *-email
 *-reference_number
 *-media_url
 *-capttion
 *-is_public {1 - public, 0 - private}
 *
 * */
router.post('/groupShareContentWithURL',auth,inputValidator.socialMediaURLValidator,wallController.SaveShareContent);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.post('/addLike',auth,inputValidator.addLikeCommentValidator,likeController.AddLike);
/*
 *
 *-email
 *-reference_number
 *-like_id
 *
 * */
router.delete('/deleteLike',auth,inputValidator.removeLikeValidator,likeController.RemoveLike);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.get('/getLikeCount',auth,inputValidator.getLikeCommentValidator,likeController.GetLikeCount);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *-comment
 *
 * */
router.post('/addComment',auth,inputValidator.addCommentValidator,commentController.AddComment);
/*
 *
 *-email
 *-reference_number
 *-comment_id
 *-comment
 *
 * */
router.patch('/editComment',auth,inputValidator.editCommentValidator,commentController.EditComment);
/*
 *
 *-email
 *-reference_number
 *-comment_id
 *
 * */
router.delete('/deleteComment',auth,inputValidator.removeCommentValidator,commentController.RemoveComment);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.get('/getCommentCount',auth,inputValidator.getLikeCommentValidator,commentController.GetCommentCount);
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
router.patch('/editBuyItem',auth,inputValidator.editItemValidator,buyController.EditBuyItem);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.delete('/deleteBuyItem',auth,inputValidator.addLikeCommentValidator,buyController.DeleteBuyItem);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.get('/getOpenBid',auth,inputValidator.getLikeCommentValidator,bidController.GetOpenBid);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
router.get('/getClosedBid',auth,inputValidator.getLikeCommentValidator,bidController.GetClosedBid);
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
router.post('/postClosedBid',auth,inputValidator.showMediaURLValidator,wallController.SaveShowClosedBidContent);
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
router.post('/postOpenBid',auth,inputValidator.showMediaURLValidator,wallController.SaveShowOpenBidContent);
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
router.post('/postBuyContent',auth,fileHandler.uploadMiddleware,inputValidator.singleShowUploadValidator,wallController.SaveShowContent);
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
router.post('/postBuyContentWithURL',auth,inputValidator.showMediaURLValidator,wallController.SaveShowContent);
/*
 *
 *-email
 *-reference_number
 *-group_name
 *-group_caption
 *-file
 *
*/
router.post('/createGroupChat',auth,fileHandler.uploadMiddleware,inputValidator.singleGroupMgmtUploadValidator,groupChatController.CreateGroupChat);
/*
 *
 *-email
 *-reference_number
 *-group_id
 *
*/
router.delete('/removeGroupChat',auth,inputValidator.groupMgmtValidator,groupChatController.DeleteGroupChat);
/*
 *
 *-email
 *-reference_number
 *-group_id
 *-friend_reference_number
 *
*/
router.post('/addUserToGroupChat',auth,inputValidator.userGroupMgmtValidator,groupChatController.AddUserToGroupChat);
/*
 *
 *-email
 *-reference_number
 *-group_id
 *-friend_reference_number
 *
*/
router.delete('/removeUserFromGroupChat',auth,inputValidator.userGroupMgmtValidator,groupChatController.RemoveUserFromGroupChat);
/*
 *
 *-email
 *-reference_number
 *-group_id
 *-message
 *-media_url
 *
*/
router.post('/sendGroupChatMessageURL',auth,inputValidator.groupChatMediaURLValidator,groupChatController.SendGroupMessageChat);
/*
 *
 *-email
 *-reference_number
 *-group_id
 *-message
 *-file
 *
*/
router.post('/sendGroupChatMessage',auth,fileHandler.uploadMiddleware,inputValidator.singleGroupChatUploadValidator,groupChatController.SendGroupMessageChat);
/*
 *
 *-email
 *-reference_number
 *-message_id
 *-message
 *
*/
router.patch('/editGroupChatMessage',auth,inputValidator.editGroupMessageValidator,groupChatController.EditGroupChatMessage);
/*
 *
 *-email
 *-reference_number
 *-message_id
 *
*/
router.delete('/removeGroupChatMessage',auth,inputValidator.groupMessageMgmtValidator,groupChatController.DeleteGroupChatMessage);
/*
 *
 *-email
 *-reference_number
 *-group_id
 *
*/
router.get('/getGroupChats',auth,inputValidator.groupMgmtValidator,groupChatController.GetGroupChats);
/*
 *
 *-email
 *-reference_number
 *-privacy_status
 *
 *
*/
router.patch('/changeProficeStatus',auth,inputValidator.changePrivacyStatusValidator,changeProfileStatusController.ChangeProfileStatus);
/*
 *
 *-email
 *-reference_number
 *-target_reference_number
 *
*/
router.get('/viewTargetProfile',auth,inputValidator.targetProfileValidator,friendController.ViewTargetProfile);
/*
 *
 *-email
 *-reference_number
 *
*/
router.get('/getFriendRequest',auth,inputValidator.getUserDetailsValidator,friendController.GetFriendRequest);

module.exports = router;
