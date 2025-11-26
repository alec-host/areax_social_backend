const { Op } = require('sequelize');
const { db, db2, sequelize2 } = require("../../../models");

const Users = db.users;
const Collections = db2.collections;
const CollectionInvites = db2.collections.invite;

module.exports.addCollectionInvite = async (data) => {
  try {
    // 1) validate input
    const refs = Array.isArray(data.invitee_reference_numbers) ? data.invitee_reference_numbers : [];
    if (refs.length === 0) return [false, 'ivitee_reference_numbers must be a non-empty array'];

    // 2) defensive dedupe of incoming refs
    const inputRefs = Array.from(new Set(refs));
    // 3) resolve reference_numbers -> Users
    const users = await Users.findAll({
      where: { reference_number: { [Op.in]: inputRefs } }, // <-- IMPORTANT
      attributes: ['_id', 'username','display_name','email','reference_number','profile_picture_url'],
      raw: true
    });
    // 4) figure out which resolved users are already in this group
    const candidateUserIds = Array.from(new Set(users.map(u => u.reference_number)));
    let addedUsers = [];
    let addedCount = 0;
    let skippedRefs = [];
    if(candidateUserIds.length > 0) {	    
      const existing = await CollectionInvites.findAll({
        where: {
          collection_reference_number: data.collection_reference_number,
          reference_number: { [Op.in]: candidateUserIds },          // <-- IMPORTANT
          is_deleted: 0
        },
        attributes: ['reference_number'],
        raw: true
      });

      const existingIds = new Set(existing.map(e => e.reference_number));
      const newUsers = users.filter(u => !existingIds.has(u.reference_number));
      const already = users.filter(u => existingIds.has(u.reference_number));
      skippedRefs = already.map(u => u.reference_number);
      
      // 5) build payload (dedupe in-memory across collection/user) 
      if (newUsers.length > 0) {
        const payload = Array.from(
          new Map(
            newUsers.map(u => [
              `${data.collection_reference_number}:${u._id}`,
              {
                collection_reference_number: data.collection_reference_number,
                email: u.email,
                reference_number: u.reference_number,
                name: u.username || u.display_name,
                profile_picture_url: u.profile_picture_url,
              }
            ])
          ).values()
        );

        // 6) insert
        await CollectionInvites.bulkCreate(payload, { ignoreDuplicates: true });

        const confirm = await CollectionInvites.findAll({
           where:{
              collection_reference_number: data.collection_reference_number,
              reference_number: { [Op.in]: newUsers.map(u => u.reference_number) },
              is_deleted: 0
           },
           attributes: ['reference_number'],
           raw: true
        });
        const confirmedIds = new Set(confirm.map(r => r.reference_number));
        addedUsers = newUsers.filter(u => confirmedIds.has(u.reference_number)); 
        addedCount = addedUsers.length; 
      }
    }

    const result = {
      added_count: addedCount,
      added_users: addedUsers.map(u => ({ id: u.id, email: u.email ,reference_number: u.reference_number })),
    };

    // still OK if nothing added but there are invites to send
    if (result.added_count === 0 /*&& result.invitee_reference_numbers.length === 0*/) {
      return [false, 'No users added and no users to invite to the collection. Check the provided reference numbers.'];
    }

    return [true, result];

  } catch (error) {
    console.error('Error creating a user collection invite:', error.message);
    return [false, error.message];
  }
};
