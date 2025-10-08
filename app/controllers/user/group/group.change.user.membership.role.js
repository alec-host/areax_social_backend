const { db2 } = require("../../../models");

const GroupMembers = db2.members;

async function updateGroupMemberRole(groupReferenceNumber, memberReferenceNumber, newRole) {
  try {
    const [updatedCount] = await GroupMembers.update(
      { role: newRole },
      {
        where: {
          group_reference_number: groupReferenceNumber,
          reference_number: memberReferenceNumber,
          is_deleted: 0
        }
      }
    );

    if (updatedCount === 0) {
      return [false, 'No matching group member found or role unchanged'];
    }

    return [true, `Role updated to "${newRole}" for member ${memberReferenceNumber}`];
  } catch (error) {
    console.error('Error updating group member role:', error);
    return [false, error.message];
  }
}

module.exports = { updateGroupMemberRole };
