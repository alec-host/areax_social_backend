const { db2 } = require("../../../models");

const GroupMembers = db2.members;

async function isUserMuted(groupReferenceNumber, memberReferenceNumber) {
  try {
    const member = await GroupMembers.findOne({
      where: {
        group_reference_number: groupReferenceNumber,
        reference_number: memberReferenceNumber,
        is_deleted: 0
      },
      attributes: ['is_muted']
    });

    if (!member) {
      return [false, 'User not found in group'];
    }

    if (member.is_muted) {
      return [false, 'User is muted and cannot post content to this group'];
    }

    return [true, 'User is allowed to post'];
  } catch (error) {
    console.error('Error checking mute status:', error);
    return [false, 'Error checking mute status'];
  }
}

module.exports = { isUserMuted };
