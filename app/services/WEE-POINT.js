const { addWeePointsToUserWallet } = require('../utils/wee.point.client');

async function onCreateWeePointPost(userEmail,actionRewardType) {
  const res = await addWeePointsToUserWallet({ email: userEmail, rewardType: actionRewardType });
  if (!res.success) {
    console.warn('WeePoints awarding failed:', res.error);
  } else {
    console.log('WeePoints awarded:', res.data);
  }
}

module.exports = { onCreateWeePointPost };
