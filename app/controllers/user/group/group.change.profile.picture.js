const { db2 } = require("../../../models");

const GroupMembers = db2.members;

async function updateProfilePictureByReferenceNumber(reference_number, newProfilePictureUrl) {
  try {
    const [updatedCount] = await GroupMembers.update(
      { profile_picture_url: newProfilePictureUrl },
      {
        where: { reference_number },
        validate: true
      }
    );

    if (updatedCount === 0) {
      return [false, `No member found with reference_number: ${reference_number}`];
    }

    return [true, `Profile picture updated for reference_number: ${reference_number}`];
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return [false, `Error: ${error.message}`];
  }
};

module.exports = { updateProfilePictureByReferenceNumber };
