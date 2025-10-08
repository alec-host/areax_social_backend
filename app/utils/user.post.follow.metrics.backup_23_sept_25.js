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
 * Fetches profile metrics including connection status between viewer and profile owner.
 *
 * connection_status mapping:
 *   0 = no relation (or outgoing pending from viewer’s POV)
 *   1 = outgoing accepted
 *   2 = incoming pending or incoming accepted
 *   3 = mutual accepted
 */
async function getUserActivityMetrics(viewerRef,profileOwnerRef,username = null,profileStatus = null) {
  if (!viewerRef || !profileOwnerRef) {
    throw new Error('Both viewer and profile-owner reference numbers are required')
  }

  const cacheKey = `social-profile:metrics:${viewerRef}:${profileOwnerRef}`
  const redis    = await connectToRedis()

  try {
    // 1. Return cached metrics if available
    const cached = await getCache(redis, cacheKey)
    if (cached) {
      return cached
    }

    // 2. Load the single friendship record in either direction
    const friendship = await Friends.findOne({
      where: {
        [Op.or]: [
          { reference_number: viewerRef, friend_reference_number: profileOwnerRef },
          { reference_number: profileOwnerRef, friend_reference_number: viewerRef }
        ],
        status: { [Op.in]: ['pending', 'accepted'] }
      },
      order: [['created_at', 'ASC']]
    })

    // 3. Determine true initiator and recipient from DB
    const initiatorRef = friendship
      ? friendship.reference_number
      : viewerRef

    const recipientRef = friendship
      ? friendship.friend_reference_number
      : profileOwnerRef

    // 4. Derive directional flags
    const pendingOut = friendship
      && friendship.reference_number === viewerRef
      && friendship.status === 'pending'

    const pendingIn = friendship
      && friendship.reference_number === profileOwnerRef
      && friendship.status === 'pending'

    const acceptedOut = friendship
      && friendship.reference_number === viewerRef
      && friendship.status === 'accepted'

    const acceptedIn = friendship
      && friendship.reference_number === profileOwnerRef
      && friendship.status === 'accepted'

    // 5. Compute connection_status from viewer’s POV
    let connectionStatus
    if (acceptedOut && acceptedIn) {
      connectionStatus = 3
    }
    else if (acceptedOut) {
      connectionStatus = 1
    }
    else if (pendingIn || acceptedIn) {
      connectionStatus = 2
    }
    else {
      connectionStatus = 0
    }

    // 6. Fetch other metrics in parallel
    const [ postCount, followCount, innerCircleCount ] = await Promise.all([
      Wall.count({
        where: {
          post_type: 'social-board',
          reference_number: profileOwnerRef,
          is_deleted: 0
        }
      }),

      Friends.count({
        where: {
          reference_number: viewerRef,
          friend_reference_number: profileOwnerRef,
          friend_category: 'follow',
          status: 'accepted'
        }
      }),

      Friends.count({
        where: {
          friend_reference_number: profileOwnerRef,
          friend_category: 'inner-circle',
          status: 'accepted'
        }
      })
    ])

    // 7. Assemble and cache response
    const metrics = {
      name: username,
      initiator_reference_number: initiatorRef,
      recipient_reference_number: recipientRef,
      posts_by_user: postCount,
      connection_status: connectionStatus,
      profile_status: profileStatus,
      friend_category_counts: {
        follow: followCount,
        following: acceptedIn ? 1 : 0,
        inner_circle: innerCircleCount
      }
    }

    await setCache(redis, cacheKey, metrics, CACHE_TTL)
    return metrics
  }
  finally {
    await closeRedisConnection(redis)
  }
}

module.exports = { getUserActivityMetrics }
