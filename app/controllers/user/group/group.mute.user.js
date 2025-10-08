const { db2 } = require("../../../models");
const GroupMembers = db2.members;

async function muteGroupMember(groupReferenceNumber, memberReferenceNumber, adminReferenceNumber, reason = null) {
  try {
    const [updatedCount] = await GroupMembers.update(
      {
        is_muted: true,
        muted_at: new Date(),
        muted_by: adminReferenceNumber,
        mute_reason: reason
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
      return [false, 'No matching group member found or already muted'];
    }

    return [true, `User ${memberReferenceNumber} has been muted in group ${groupReferenceNumber}`];
  } catch (error) {
    console.error('Error muting group member:', error);
    return [false, error.message];
  }
}

module.exports = { muteGroupMember };
