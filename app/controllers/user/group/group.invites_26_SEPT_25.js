const { db2 } = require("../../../models");

const GroupInvites = db2.groups.invites;

const { v4: uuidv4 } = require('uuid');
const RESEND_COOLDOWN_MINUTES = 15;

async function generateGroupInvite({ group_id, group_reference_number, recipient_reference_number, is_registered = false, ttlMinutes = 1440 }) {
  const now = new Date();	

  const existingInvite = await GroupInvites.findOne({
    where: {
      group_id,
      recipient,
      status: 'pending'
    }
  });

  if(existingInvite){
     const lastSent = new Date(existingInvite.last_sent_at);
     const minutesSinceLastSend = (now - lastSent) / (1000 * 60);

     if(minutesSinceLastSend < RESEND_COOLDOWN_MINUTES) {
        return [false, `Invite already sent. Try again in ${Math.ceil(RESEND_COOLDOWN_MINUTES - minutesSinceLastSend)} minutes.`];
     }

     // Resend existing token
     await existingInvite.update({ last_sent_at: now });
     return [true, {
        token: existingInvite.token,
        invite_link: `https://api.projectw.ai/group/invite?token=${existingInvite.token}`,
        message: 'Invite resent successfully'
     }];
  }    
 
  const token = uuidv4();
  const expires_at = new Date(Date.now() + ttlMinutes * 60 * 1000);
	
  const invite = await GroupInvites.create({
    group_id,
    group_reference_number,
    token,
    recipient_reference_number,
    is_registered,
    expires_at,
    last_sent_at: now	  
  });

  return [true, {
    token: invite.token,
    invite_link: `https://api.projectw.ai/group/invite?token=${invite.token}`,
    message: 'Invite sent successfully'	  
  }];
};
