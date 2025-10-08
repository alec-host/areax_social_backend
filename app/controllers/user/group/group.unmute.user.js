const { db2 } = require("../../../models");
const GroupMembers = db2.members;

async function unmuteGroupMember(groupReferenceNumber, memberReferenceNumber) {
  try {
    const [updatedCount] = await GroupMembers.update(
      {
        is_muted: false,
        muted_at: null,
        muted_by: null,
        mute_reason: null
      },
      {
        where: {
          group_reference_number: groupReferenceNumber,
          reference_number: memberReferenceNumber,
          is_deleted: 0
        }
      }
    );

    if (updatedCount === 0) {
      return [false, 'No matching group member found or already unmuted'];
    }

    return [true, `User ${memberReferenceNumber} has been unmuted in group ${groupReferenceNumber}`];
  } catch (error) {
    console.error('Error unmuting group member:', error);
    return [false, error.message];
  }
}

module.exports = { unmuteGroupMember };
