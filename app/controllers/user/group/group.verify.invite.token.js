const { db2 } = require("../../../models");

const GroupInvites = db2.groups.invites;

async function verifyGroupInviteToken(token){
  try{	
     const invite = await GroupInvites.findOne({ where: token });
     if(!invite){  
        return [false, 'Invalid invite token'];
     }

     if(invite.status !== 'pending') {
        return [false, 'Invite already used or expired'];
     }

     if(new Date() > new Date(invite.expires_at)) {
        await invite.update({ status: 'expired' });
        return [false, 'Invite has expired'];
     }

     return [true, invite];
  }catch(error){
     return [false, `Error ${error?.message}`];
  }	
};

async function markInviteAccepted(token) {
  const invite = await GroupInvites.findOne({ where: { token } });
  if(invite){
     await invite.update({ status: 'accepted' });
  }
};

module.exports = { verifyGroupInviteToken, markInviteAccepted };
