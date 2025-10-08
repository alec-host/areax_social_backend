const { Op } = require('sequelize')
const { db2 } = require('../models')
const {
  connectToRedis,
  closeRedisConnection,
  getCache,
  setCache
} = require('../cache/redis')

const Wall    = db2.wall
const Friends = db2.friends
const CACHE_TTL = 300

/**
 * Fetches profile metrics and computes connection_status following:
 *
 * 0 = no connection
 * 2 = pending (outgoing or incoming)
 * 3 = incoming accepted (“follow back” available)
 * 1 = outgoing accepted or mutual accepted (active follow)
 *
 * This logic never swaps initiator/recipient: initiatorRef is always
 * whoever actually started that follow request or acceptance from the viewer’s POV.
 */
async function getUserActivityMetrics(viewerRef,profileOwnerRef,username = null,profileStatus = null) {
  if (!viewerRef || !profileOwnerRef) {
    throw new Error('Both viewer and profile-owner reference numbers are required')
  }

  const cacheKey = `social-profile:metrics:${viewerRef}:${profileOwnerRef}`
  const redis    = await connectToRedis()

  try {
    // 1) Return cached if exists
    //const cached = await getCache(redis, cacheKey)
    //if (cached) return cached

    // 2) Parallel counts for posts and relationship flags
    const [
      postCount,
      followCount,
      innerCircleCount,
      pendingOutCount,
      pendingInCount,
      acceptedOutCount,
      acceptedInCount
    ] = await Promise.all([
      // Posts by profile owner
      Wall.count({
        where: {
          post_type: 'social-board',
          reference_number: profileOwnerRef,
          is_deleted: 0
        }
      }),
      // “follow” accepted viewer→owner
      Friends.count({
        where: {
          reference_number: viewerRef,
          friend_reference_number: profileOwnerRef,
          friend_category: 'follow',
          status: 'accepted'
        }
      }),
      // “inner-circle” accepted toward owner
      Friends.count({
        where: {
          friend_reference_number: profileOwnerRef,
          friend_category: 'inner-circle',
          status: 'accepted'
        }
      }),
      // Pending request viewer→owner
      Friends.count({
        where: {
          reference_number: viewerRef,
          friend_reference_number: profileOwnerRef,
          status: 'pending'
        }
      }),
      // Pending request owner→viewer
      Friends.count({
        where: {
          reference_number: profileOwnerRef,
          friend_reference_number: viewerRef,
          status: 'pending'
        }
      }),
      // Accepted viewer→owner
      Friends.count({
        where: {
          reference_number: viewerRef,
          friend_reference_number: profileOwnerRef,
          status: 'accepted'
        }
      }),
      // Accepted owner→viewer
      Friends.count({
        where: {
          reference_number: profileOwnerRef,
          friend_reference_number: viewerRef,
          status: 'accepted'
        }
      })
    ])

    // 3) Derive boolean flags
    const pendingOut  = pendingOutCount  > 0
    const pendingIn   = pendingInCount   > 0
    const acceptedOut = acceptedOutCount > 0
    const acceptedIn  = acceptedInCount  > 0

    // 4) Compute connection_status & initiator_ref according to pseudocode
    let connectionStatus
    let initiatorRef

    // Step 1: no requests yet
    if (!pendingOut && !pendingIn && !acceptedOut && !acceptedIn) {
      connectionStatus = 0
      initiatorRef     = viewerRef
    }
    // Step 2: A→B sent pending
    else if (pendingOut) {
      connectionStatus = 2
      initiatorRef     = viewerRef
    }
    else if (pendingIn) {
      connectionStatus = 2
      initiatorRef     = profileOwnerRef
    }
    // Step 3: B accepted A’s request
    else if (acceptedIn && !acceptedOut) {
      connectionStatus = 3
      initiatorRef     = profileOwnerRef
    }
    else if (acceptedOut && !acceptedIn) {
      connectionStatus = 1
      initiatorRef     = viewerRef
    }
    // Step 5: mutual accepted or follow-back accepted
    else if (acceptedOut && acceptedIn) {
      connectionStatus = 1
      initiatorRef     = viewerRef
    }
    else {
      // Fallback
      connectionStatus = 0
      initiatorRef     = viewerRef
    }

    // Always set recipientRef to the other party
    const recipientRef = initiatorRef === viewerRef
      ? profileOwnerRef
      : viewerRef

    // 5) Assemble and cache metrics
    const metrics = {
      name:                        username,
      initiator_reference_number:  initiatorRef,
      recipient_reference_number:  recipientRef,
      posts_by_user:               postCount,
      connection_status:           connectionStatus,
      profile_status:              profileStatus,
      friend_category_counts: {
        follow:       followCount,
        following:    acceptedIn  ? 1 : 0,
        inner_circle: innerCircleCount
      }
    }

    //await setCache(redis, cacheKey, metrics, CACHE_TTL)
    return metrics
  }
  finally {
    await closeRedisConnection(redis)
  }
}

module.exports = { getUserActivityMetrics }
