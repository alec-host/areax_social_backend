const { db2 } = require("../../../models");
const GroupInvites = db2.groups.invites;
const { v4: uuidv4 } = require('uuid');

const { getUserDetailByReferenceNumber } = require("../../../controllers/user/get.user.details");

const RESEND_COOLDOWN_MINUTES = 15;

async function generateGroupInvite({
  group_id,
  group_reference_number,
  group_name,
  group_photo_url,	
  max_members,
  group_type,
  is_secret_group,	
  admin_invite,
  invite_link,	
  recipient_reference_number = [],
  is_registered = false,	
  ttlMinutes = 1440
}) {
  const now = new Date();
  const expires_at = new Date(Date.now() + ttlMinutes * 60 * 1000);	

  // Normalize input to array
  const recipients = Array.isArray(recipient_reference_number)
    ? recipient_reference_number
    : [recipient_reference_number];

  const results = [];

  for (const recipient of recipients) {
    try {
      const existingInvite = await GroupInvites.findOne({
        where: {
          group_id,
          recipient_reference_number: recipient,
          status: 'pending'
        }
      });

      if (existingInvite) {
        const lastSent = new Date(existingInvite.last_sent_at);
        const minutesSinceLastSend = (now - lastSent) / (1000 * 60);

        if (minutesSinceLastSend < RESEND_COOLDOWN_MINUTES) {
          results.push({
            recipient,
            success: false,
            message: `Invite already sent. Try again in ${Math.ceil(RESEND_COOLDOWN_MINUTES - minutesSinceLastSend)} minutes.`
          });
          continue;
        }

        await existingInvite.update({ last_sent_at: now });

        results.push({
          recipient,
          success: true,
          token: existingInvite.token,
          invite_link: existingInvite.invite_link,
          message: 'Invite resent successfully'
        });
        continue;
      }

      const token = group_type === 'private' ? `GRP_INV${uuidv4()}` : invite_link;
      const inviteLink = group_type === 'private' ? `https://api.projectw.ai/social/api/v1/group/private-invite?token=${token}` : `https://api.projectw.ai/social/api/v1/group/open-invite?token=${invite_link}`;

      const userDetail = await getUserDetailByReferenceNumber(recipient);	    

      const invite = await GroupInvites.create({
        group_id,
        group_reference_number,
        token,
	invite_link: inviteLink,   
        group_name,
	group_photo_url,      
        max_members,
        group_type,
        is_secret_group,
        recipient_reference_number: recipient,
	recipient_name: userDetail.display_name,
	recipient_photo_url: userDetail.profile_picture_url,      
        is_registered,
	admin_invite,      
        expires_at,
        last_sent_at: now
      });

      results.push({
        recipient,
        success: true,
        token: invite.token,
        invite_link: invite.invite_link,
        message: 'Invite sent successfully'
      });
    } catch (err) {
      results.push({
        recipient,
        success: false,
        message: `Error: ${err.message}`
      });
    }
  }
  console.log(results);
  return [true, { group_id, group_reference_number, invites: results }];
};


module.exports = { generateGroupInvite }; 
