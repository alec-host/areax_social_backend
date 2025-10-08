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
const savedPostController = require("../controllers/saved.post.controller");
const searchUserController = require("../controllers/search.user.controller");
const wallpaperController = require("../controllers/wallpaper.controller");

const inputValidator = require("../validation/common.validation");

const { s3UploadMiddleware } = require("../middleware/s3.bucket.upload");
const fileHandler = require("../middleware/file.upload.handler");

const auth = require("../middleware/auth");
const basicAuth = require("../middleware/basic.auth");
const error = require('../middleware/error.handler');

module.exports = (app) => {

  const router = require("express").Router();
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
 *-connection_type
 *
 * */
  router.post('/connection-request',auth,inputValidator.connectionRequestValidator,friendController.MakeConnectionRequest);
/*
 *
 *-email
 *-reference_number
 *-type
*/
  router.get('/connection-request',auth,inputValidator.getPendingConnectionValidator,friendController.GetConnectionRequest);
/*
 *-email
 *-reference_number
 *-friend_reference_number
 *
 * */
  router.post('/connection-request/accept',auth,inputValidator.acceptFriendValidator,friendController.AcceptConnection);
/*
 *-email
 *-reference_number
 *-initiator_reference_number
 *
 * */
  router.delete('/connection-request/remove',auth,inputValidator.removeConnectionValidator,friendController.RemoveConnection);	
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
  router.get('/social-content',auth,inputValidator.getUserDetailsValidator,wallController.GetWallContent);
/*
 *-email
 *-reference_number
 *-target_reference_number
 *-post_type
 *
 * */
  router.get('/social-content/profile',auth,inputValidator.getProfileWallFeedValidator,wallController.GetWallContentByReferenceNumber);	
/*
 *
 *-email
 *-reference_number
 *-file
 *-caption
 *-location_name
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
 *-group_reference_number
 *-file
 *-caption
 *-gps_coordinates
 *-type
 *-is_public
 *-is_buy_enabled
 *-is_comment_allowed
 *-is_minted_automatically
 *
 * */
  router.post('/social-group-content',auth,fileHandler.uploadMiddleware,inputValidator.singleSocialWallGroupUploadValidator,wallController.SaveGroupContent);	
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
 *-group_reference_number
 *-media_url
 *-caption
 *-gps_coordinates
 *-type
 *-is_public
 *-is_buy_enabled
 *-is_comment_allowed
 *-is_minted_automatically
 *
 * */
  router.post('/social-group-content/url',auth,inputValidator.groupWallURLValidator,wallController.SaveGroupContent);	
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
  router.delete('/like/:post_id',auth,inputValidator.removeLikeValidator,likeController.RemoveLike);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
  router.get('/like',auth,inputValidator.getLikeCommentValidator,likeController.GetUserLikes);
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
 *-group_reference_number
 *-post_id
 *-comment
 *
 * */
  router.post('/group/comment',auth,inputValidator.addCommentValidator,commentController.AddGroupComment);	
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
 *-max_members
 *-file - optional
 *
*/
  router.post('/group/open',auth,fileHandler.uploadMiddleware,inputValidator.singleGroupMgmtUploadValidator,groupChatController.CreateOpenGroup);
/*
 *
 *-email
 *-reference_number
 *-group_name
 *-group_caption
 *-max_members
 *-is_private
 *-event_support
 *-live_stream_support
 *-buy_sell_support
 *-gift_token_support
 *-is_secret_group
 *-file - optional
 *
*/
  router.post('/group/private',auth,fileHandler.uploadMiddleware,inputValidator.singlePrivateGroupMgmtUploadValidator,groupChatController.CreatePrivateGroup);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
*/
  router.get('/group/member-status',auth,inputValidator.getGroupDetailsValidator,groupChatController.GroupMembershipStatus);	
/*
 *
 *-email
 *-reference_number
 *-group_name
 *-group_caption
 *-price_amount
 *-subscription_interval
 *-max_members
 *-file - optional
 *-is_secret_group
 *-live_stream_support
 *-event_support
 *-buy_sell_support
 *-gift_token_support
 *
*/
  router.post('/group/paid',auth,fileHandler.uploadMiddleware,inputValidator.singlePaidGroupMgmtUploadValidator,groupChatController.CreatePaidGroup);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-file
 *
*/	
  router.put('/group/background-image',auth,fileHandler.uploadMiddleware,inputValidator.groupAddBackgroundImageValidator,groupChatController.AddGroupBackgroundImage);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-group_name
 *
*/
  router.put('/group/name',auth,inputValidator.groupAddNameValidator,groupChatController.AddGroupName);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-member_reference_number
 *-role [admin,member]
*/
  router.put('/group/role',auth,inputValidator.groupSwitchRoleValidator,groupChatController.ChangeUserRoleGroup);	
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-group_caption
 *
*/
  router.put('/group/caption',auth,inputValidator.groupAddCaptionValidator,groupChatController.AddGroupCaption);	
/*
 *
 *-email
 *-reference_number
 *-invite_code
 *
*/
  router.post('/group-open/join',auth,inputValidator.joinGroupValidator,groupChatController.JoinOpenGroupWithGroupInviteLink);
/*
 *
 *-email
 *-reference_number
 *-invite_code
 *
*/
  router.post('/group-private/join',auth,inputValidator.joinGroupValidator,groupChatController.JoinPrivateGroupWithDynamicInviteLink);	
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
*/
  router.post('/group/join/send-request',auth,inputValidator.removeGroupValidator,groupChatController.SendJoinGroupRequest);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-member_reference_number
 *
*/
  router.post('/group/remove-user',auth,inputValidator.userGroupMgmtValidator,groupChatController.RemoveUserFromGroup);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
*/
  router.post('/group/leave',auth,inputValidator.removeGroupValidator,groupChatController.LeaveGroup)
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
*/
  router.delete('/group/:group_reference_number',auth,inputValidator.removeGroupValidator,groupChatController.DeleteGroup);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-[member_reference_numbers]
 *
*/
  router.post('/group/users',auth,inputValidator.addMultipleUserserValidator,groupChatController.AddMultipleUsersToGroup);
/*
 *
 *-email
 *-reference_number
 *-page
 *-limit
 *
*/
  router.get('/group',auth,inputValidator.getGroupsValidator,groupChatController.ListGroups);
/*
 *
 *-email
 *-reference_number
 *-post_type
 *
*/
  router.get('/group/content',auth,inputValidator.getWallFeedValidator,wallController.GetGroupWallContent);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-member_reference_number
 *-reason (optional)
 *
*/
  router.post('/group/user/mute',auth,inputValidator.groupMuteUserValidator,groupChatController.MuteUserInGroup);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-member_reference_number
 *
*/
  router.delete('/group/user/mute',auth,inputValidator.groupMuteUserValidator,groupChatController.UnmuteUserInGroup);	
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
 *-feedback
 *-post_id
 *
 * */
  router.post('/report',auth,inputValidator.reportedPostValidator,reportController.reportedSocialPost);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-feedback
 *-post_id
 *
 * */
  router.post('/group/report',auth,inputValidator.reportedGroupPostValidator,reportController.reportedGroupPost);	
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
  router.post('/save',auth,inputValidator.addSavedPostValidator,savedPostController.addSavedPost);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
  router.delete('/save/:post_id',auth,inputValidator.deletePostValidator,savedPostController.removeSavedPost);
/*
 *
 *-email
 *-reference_number
 *
 * */
  router.get('/save',auth,inputValidator.getSavedPostValidator,savedPostController.getSavedPost);
/*
 *
 *-page
 *-limit
 *
 * */
  router.get('/report',basicAuth,inputValidator.getPaginationValidator,wallController.GetReportedSocialPost);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-page
 *-limit
 *
 * */
  router.get('/group/report',auth,inputValidator.getGroupPaginationValidator,wallController.GetReportedGroupPost);
/*
 *
 *-email
 *-reference_number
 *-search_query
 *
 * */	
  router.post('/search-user',auth,inputValidator.searchUserValidator,searchUserController.searchUserByUsername);
/*
 *
 *-email
 *-reference_number
 *-target_reference_number
 *
 * */
  router.get('/profile/stats',auth,inputValidator.targetUserProfileMetricsValidator,wallController.SocialProfileMetrics);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
 * */
  router.get('/group/stats',auth,inputValidator.getGroupDetailsValidator,groupChatController.GroupActivityMetrics);	
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-target_reference_number
 *
 * */
  router.get('/group/user/stats',auth,inputValidator.targetUserGroupMetricsValidator,groupChatController.UserGroupActivityMetrics);
/*
 *
 *-email
 *-reference_number
 *-target_reference_number
 *-page
 *-limit
 *
 * */
  router.get('/connection/user-follow',auth,inputValidator.connectionUserListValidator,friendController.ConnectionFollowList);
/*
 *
 *-email
 *-reference_number
 *-target_reference_number
 *-page
 *-limit
 *
 * */
  router.get('/connection/user-following',auth,inputValidator.connectionUserListValidator,friendController.ConnectionFollowingList);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-page
 *-limit
 *
 * */
  router.get('/group/members',auth,inputValidator.getGroupPaginationValidator,groupChatController.GroupMembershipList);
/*
 *
 *-email
 *-reference_number
 *-page
 *-limit
 *
 * */
  router.get('/group/invites',auth,inputValidator.getUserDetailsValidator,groupChatController.GroupUserInvites);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-page
 *-limit
 *
 * */
  router.get('/group/admin/invites',auth,inputValidator.getGroupPaginationValidator,groupChatController.GroupAdminInvites);	
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-recipient_reference_number
 *-is_approved
 *
 * */
  router.post('/group/admin/invites-approval',auth,inputValidator.groupInviteApprovalValidator,groupChatController.GroupAdminApproveRejectInviteRequest);	
/*
 *
 *-email
 *-reference_number
 *-picture_url
 *
 * */
  router.patch('/group/member/profile-picture',auth,inputValidator.changeGroupMemberPictureValidator,groupChatController.ChangeGroupMemberProfilePicture);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
*/
  router.post('/group/invites/reject',auth,inputValidator.removeGroupValidator,groupChatController.RejectGroupInvite);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
*/
  router.post('/group/members-import',auth,inputValidator.joinGroupValidator,groupChatController.ImportGroupMembersAsInvites);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-member_reference_number
 *-reason
 *
*/
  router.post('/group/report-user',auth,inputValidator.groupMuteUserValidator,groupChatController.ReportUser);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-page
 *-limit
 *
*/
  router.get('/group/report-user',auth,inputValidator.getGroupPaginationValidator,groupChatController.AdminReportedUserList);
/*
 *
 *-email
 *-reference_number
 *-review_status
 *-report_id
 *
*/
  router.post('/group/review/report-user',auth,inputValidator.reviewReportedUserValidator,groupChatController.ReviewReportedGroupMembers);

/*
 modlule.exports.ReviewReportedGroupMembers = async(req,res) => {
  const { email, reference_number, reviewer_reference_number, report_id } = req.body;

 **/	

  //email, reference_number, group_reference_number, target_reference_number, reason	
  router.post('/wallpaper/google',auth,inputValidator.googleWallpaperValidator,wallpaperController.saveGoogleNearbyMedia);
  router.post('/wallpaper/custom',auth,s3UploadMiddleware,inputValidator.uploadS3Validator,wallpaperController.saveUserMedia);	
  router.post('/wallpaper',basicAuth,s3UploadMiddleware,inputValidator.postWallpaperValidator,wallpaperController.saveMedia);
  router.get('/wallpaper',auth,inputValidator.getWallpaperValidator,wallpaperController.fetchMedia);	
  router.get('/wallpaper/admin',inputValidator.getWallpaperAdminValidator,wallpaperController.fetchMediaAdmin);	
  router.delete('/wallpaper/:media_id',basicAuth,inputValidator.wallpaperValidator,wallpaperController.deleteMedia);	
  router.put('/wallpaper/:media_id',basicAuth,inputValidator.wallpaperValidator,s3UploadMiddleware,wallpaperController.modifyMedia);

  router.get('/ping', (req, res) => res.send('pong'));	
  
  app.use('/social/api/v1',router);

  app.use((req, res, next) => {
     console.log(`🔍 Missed route: ${req.method} ${req.url}`);
     res.status(404).json({ success: false, error: true, error: true, message: 'Endpoint not found or parameter missing' });	  
     next();
  });

  app.use(error.errorHandler);
};
