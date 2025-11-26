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
const sanitizeInput = require('../middleware/sanitizeInput');

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
 *-friend_category.
 *
 * */
  router.get('/friend/inner-circle',auth,inputValidator.getFriendDetailsValidator,friendController.MyInnerCircleList);	
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
 *-page
 *-limit
 *
 * */
  router.get('/social-content',auth,inputValidator.getWallFeedValidator,wallController.GetWallContent);
/*
 *-email
 *-reference_number
 *-post_type
 *-hashtag
 *-page
 *-limit
 *
 * */
  router.get('/social-content/hashtag',auth,inputValidator.getWallFeedValidator,wallController.GetWallContent);
/*
 *-email
 *-reference_number
 *-post_type
 *-collection_reference_number(optional)
 *-hashtag
 *-page
 *-limit
 *
 * */
  router.get('/social-content/saved',auth,inputValidator.getWallFeedValidator,wallController.GetSavedWallContent);	
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
  router.post('/like',auth,inputValidator.addLikeCommentValidator,sanitizeInput,likeController.AddLike);
/*
 *
 *-email
 *-reference_number
 *-like_id
 *
 * */
  router.delete('/like/:post_id',auth,inputValidator.removeLikeValidator,sanitizeInput,likeController.RemoveLike);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
  router.get('/like',auth,inputValidator.getLikeCommentValidator,sanitizeInput,likeController.GetUserLikes);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
  router.get('/like/count',auth,inputValidator.getLikeCommentValidator,sanitizeInput,likeController.GetLikeCount);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *-comment
 *
 * */
  router.post('/comment',auth,inputValidator.addCommentValidator,sanitizeInput,commentController.AddComment);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-post_id
 *-comment
 *
 * */
  router.post('/group/comment',auth,inputValidator.addCommentValidator,sanitizeInput,commentController.AddGroupComment);	
/*
 *
 *-email
 *-reference_number
 *-comment_id
 *-comment
 *
 * */
  router.patch('/comment',auth,inputValidator.editCommentValidator,sanitizeInput,commentController.EditComment);
/*
 *
 *-email
 *-reference_number
 *-comment_id
 *
 * */
  router.delete('/comment/:comment_id',auth,inputValidator.removeCommentValidator,sanitizeInput,commentController.RemoveComment);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
  router.get('/comment',auth,inputValidator.getLikeCommentValidator,sanitizeInput,commentController.GetComment);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
  router.get('/comment/count',auth,inputValidator.getLikeCommentValidator,sanitizeInput,commentController.GetCommentCount);
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
  router.post('/closed-bid',auth,inputValidator.showMediaURLValidator,sanitizeInput,wallController.SaveShowClosedBidContent);
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
  router.post('/open-bid',auth,inputValidator.showMediaURLValidator,sanitizeInput,wallController.SaveShowOpenBidContent);
/*
 *-email
 *-reference_number
 *-post_id
 *
 * */
  router.get('/open-bid',auth,inputValidator.getLikeCommentValidator,sanitizeInput,bidController.GetOpenBid);
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
  router.post('/buy-content',auth,fileHandler.uploadMiddleware,inputValidator.singleShowUploadValidator,sanitizeInput,wallController.SaveShowContent);
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
  router.post('/buy-content/url',auth,inputValidator.showMediaURLValidator,sanitizeInput,wallController.SaveShowContent);
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
  router.patch('/buy-content',auth,inputValidator.editItemValidator,sanitizeInput,buyController.EditBuyPostContent);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
  router.delete('/buy-content/:post_id',auth,inputValidator.deletePostValidator,sanitizeInput,buyController.DeleteBuyPostContent);
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
  router.post('/group/open',auth,fileHandler.uploadMiddleware,inputValidator.singleGroupMgmtUploadValidator,sanitizeInput,groupChatController.CreateOpenGroup);
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
  router.post('/group/private',auth,fileHandler.uploadMiddleware,inputValidator.singlePrivateGroupMgmtUploadValidator,sanitizeInput,groupChatController.CreatePrivateGroup);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
*/
  router.get('/group/member-status',auth,inputValidator.getGroupDetailsValidator,sanitizeInput,groupChatController.GroupMembershipStatus);	
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
  router.post('/group/paid',auth,fileHandler.uploadMiddleware,inputValidator.singlePaidGroupMgmtUploadValidator,sanitizeInput,groupChatController.CreatePaidGroup);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-file
 *
*/	
  router.put('/group/background-image',auth,fileHandler.uploadMiddleware,inputValidator.groupAddBackgroundImageValidator,sanitizeInput,groupChatController.AddGroupBackgroundImage);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-group_name
 *
*/
  router.put('/group/name',auth,inputValidator.groupAddNameValidator,sanitizeInput,groupChatController.AddGroupName);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-member_reference_number
 *-role [admin,member]
*/
  router.put('/group/role',auth,inputValidator.groupSwitchRoleValidator,sanitizeInput,groupChatController.ChangeUserRoleGroup);	
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
  router.post('/group-open/join',auth,inputValidator.joinGroupValidator,sanitizeInput,groupChatController.JoinOpenGroupWithGroupInviteLink);
/*
 *
 *-email
 *-reference_number
 *-invite_code
 *
*/
  router.post('/group-private/join',auth,inputValidator.joinGroupValidator,sanitizeInput,groupChatController.JoinPrivateGroupWithDynamicInviteLink);	
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
*/
  router.post('/group/join/send-request',auth,inputValidator.removeGroupValidator,sanitizeInput,groupChatController.SendJoinGroupRequest);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-member_reference_number
 *
*/
  router.post('/group/remove-user',auth,inputValidator.userGroupMgmtValidator,sanitizeInput,groupChatController.RemoveUserFromGroup);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
*/
  router.post('/group/leave',auth,inputValidator.removeGroupValidator,sanitizeInput,groupChatController.LeaveGroup)
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
*/
  router.delete('/group/:group_reference_number',auth,inputValidator.removeGroupValidator,sanitizeInput,groupChatController.DeleteGroup);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-[member_reference_numbers]
 *
*/
  router.post('/group/users',auth,inputValidator.addMultipleUserserValidator,sanitizeInput,groupChatController.AddMultipleUsersToGroup);
/*
 *
 *-email
 *-reference_number
 *-page
 *-limit
 *
*/
  router.get('/group',auth,inputValidator.getGroupsValidator,sanitizeInput,groupChatController.ListGroups);
/*
 *
 *-email
 *-reference_number
 *-post_type
 *
*/
  router.get('/group/content',auth,inputValidator.getWallFeedValidator,sanitizeInput,wallController.GetGroupWallContent);
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
  router.delete('/group/user/mute',auth,inputValidator.groupMuteUserValidator,sanitizeInput,groupChatController.UnmuteUserInGroup);	
/*
 *
 *-email
 *-reference_number
 *-target_reference_number
 *
*/
  router.get('/profile',auth,inputValidator.targetProfileValidator,sanitizeInput,friendController.ViewTargetProfile);
/*
 *
 *-email
 *-reference_number
 *-privacy_status
 *
*/
  router.patch('/profile/privacy-status',auth,inputValidator.changePrivacyStatusValidator,sanitizeInput,changeProfileStatusController.ChangeProfileStatus);
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
  router.get('/file/fetch',auth,inputValidator.getUploadedFilesValidator,sanitizeInput,fileController.getFiles);
/*
 *
 *-email
 *-reference_number
 *-id
 *
*/
  router.get('/file/:file_id',auth,inputValidator.getUploadedFileValidator,sanitizeInput,fileController.getFile);
/*
 *
 *-email
 *-reference_number
 *
*/
  router.delete('/file/:file_id',auth,inputValidator.deleteUploadedFileValidator,sanitizeInput,fileController.deleteFile);
/*
 *
 *-email
 *-reference_number
 *-feedback
 *-post_id
 *
 * */
  router.post('/report',auth,inputValidator.reportedPostValidator,sanitizeInput,reportController.reportedSocialPost);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-feedback
 *-post_id
 *
 * */
  router.post('/group/report',auth,inputValidator.reportedGroupPostValidator,sanitizeInput,reportController.reportedGroupPost);	
/*
 *
 *-email
 *-reference_number
 *-reply
 *-post_id
 *-comment_id
 *
 * */
  router.post('/comment/reply',auth,inputValidator.commentReplyValidator,sanitizeInput,commentController.AddCommentReply);
/*
 *
 *-email
 *-reference_number
 *-comment_id
 *
 * */
  router.get('/comment/reply',auth,inputValidator.getCommentReplyValidator,sanitizeInput,commentController.GetCommentReplies);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
  router.post('/save',auth,inputValidator.addSavedPostValidator,sanitizeInput,savedPostController.addSavedPost);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *
 * */
  router.delete('/save/:post_id',auth,inputValidator.deletePostValidator,sanitizeInput,savedPostController.removeSavedPost);
/*
 *
 *-email
 *-reference_number
 *
 * */
  router.get('/save',auth,inputValidator.getSavedPostValidator,sanitizeInput,savedPostController.getSavedPost);
/*
 *
 *-email
 *-reference_number
 *-post_id
 *-collection_name
 *-is_collection_shared
 *
 * */
  router.post('/social-content/collection',auth,inputValidator.createCollectionValidator,savedPostController.createCollection);
/*
 *
 *-email
 *-reference_number
 *
 * */
  router.get('/social-content/collection',auth,inputValidator.getSavedPostValidator,savedPostController.getCollections);	
/*
 *
 *-email
 *-reference_number
 *-post_id
 *-collection_reference_number
 *
 * */
  router.post('/social-content/collection/add',auth,inputValidator.savePostToCollectionValidator,sanitizeInput,savedPostController.addPostToCollection);	
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
  router.get('/group/report',auth,inputValidator.getGroupPaginationValidator,sanitizeInput,wallController.GetReportedGroupPost);
/*
 *
 *-email
 *-reference_number
 *-search_query
 *
 * */	
  router.post('/search-user',auth,inputValidator.searchUserValidator,sanitizeInput,searchUserController.searchUserByUsername);
/*
 *
 *-email
 *-reference_number
 *-target_reference_number
 *
 * */
  router.get('/profile/stats',auth,inputValidator.targetUserProfileMetricsValidator,sanitizeInput,wallController.SocialProfileMetrics);
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
  router.get('/group/user/stats',auth,inputValidator.targetUserGroupMetricsValidator,sanitizeInput,groupChatController.UserGroupActivityMetrics);
/*
 *
 *-email
 *-reference_number
 *-target_reference_number
 *-page
 *-limit
 *
 * */
  router.get('/connection/user-follow',auth,inputValidator.connectionUserListValidator,sanitizeInput,friendController.ConnectionFollowList);
/*
 *
 *-email
 *-reference_number
 *-target_reference_number
 *-page
 *-limit
 *
 * */
  router.get('/connection/user-following',auth,inputValidator.connectionUserListValidator,sanitizeInput,friendController.ConnectionFollowingList);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-page
 *-limit
 *
 * */
  router.get('/group/members',auth,inputValidator.getGroupPaginationValidator,sanitizeInput,groupChatController.GroupMembershipList);
/*
 *
 *-email
 *-reference_number
 *-page
 *-limit
 *
 * */
  router.get('/group/invites',auth,inputValidator.getUserDetailsValidator,sanitizeInput,groupChatController.GroupUserInvites);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-page
 *-limit
 *
 * */
  router.get('/group/admin/invites',auth,inputValidator.getGroupPaginationValidator,sanitizeInput,groupChatController.GroupAdminInvites);	
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-recipient_reference_number
 *-is_approved
 *
 * */
  router.post('/group/admin/invites-approval',auth,inputValidator.groupInviteApprovalValidator,sanitizeInput,groupChatController.GroupAdminApproveRejectInviteRequest);	
/*
 *
 *-email
 *-reference_number
 *-picture_url
 *
 * */
  router.patch('/group/member/profile-picture',auth,inputValidator.changeGroupMemberPictureValidator,sanitizeInput,groupChatController.ChangeGroupMemberProfilePicture);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
*/
  router.post('/group/invites/reject',auth,inputValidator.removeGroupValidator,sanitizeInput,groupChatController.RejectGroupInvite);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *
*/
  router.post('/group/members-import',auth,inputValidator.joinGroupValidator,sanitizeInput,groupChatController.ImportGroupMembersAsInvites);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-member_reference_number
 *-reason
 *
*/
  router.post('/group/report-user',auth,inputValidator.groupMuteUserValidator,sanitizeInput,groupChatController.ReportUser);
/*
 *
 *-email
 *-reference_number
 *-group_reference_number
 *-page
 *-limit
 *
*/
  router.get('/group/report-user',auth,inputValidator.getGroupPaginationValidator,sanitizeInput,groupChatController.AdminReportedUserList);
/*
 *
 *-email
 *-reference_number
 *-review_status
 *-report_id
 *
*/
  router.post('/group/review/report-user',auth,inputValidator.reviewReportedUserValidator,sanitizeInput,groupChatController.ReviewReportedGroupMembers);
/*
 *-email
 *-reference_number
 *-friend_reference_number
 *-is_set { 0/1 }
 *
 * */
  router.patch('/friend/inner-circle/:target_reference_number/:is_set',auth,inputValidator.innerCircleTagValidator,sanitizeInput,friendController.SetResetInnerCircleTag);
/*
 *-email
 *-reference_number
 *
 * */
  router.get('/collection/invite',auth,inputValidator.getUserDetailsValidator,sanitizeInput,savedPostController.getCollectionInvite);
/*
 *-email
 *-reference_number
 *-collection_reference_number
 *-is_accepted {0/1}
 *
 * */
  router.post('/collection/invite/accept-reject',auth,inputValidator.acceptRejectCollectionValidator,sanitizeInput,savedPostController.acceptRejectCollectionInvite);	
/*
 *
 *
 *
 * */
  router.post('/flashback/time-wrap');	
	
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
