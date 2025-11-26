// collection_enricher.js
const { Op } = require('sequelize');

/**
 * Enrich collections with total_count and up to `limitPerCollection` recent posts.
 *
 * @param {Array<Object>} collections - array of collection objects that contain collection_reference_number
 * @param {Object} models - { Wall, sequelize } Sequelize model + sequelize instance
 * @param {Object} opts
 *   - limitPerCollection {number} default 4
 *   - maxRowsFetch {number} safety cap (default 2000)
 *   - whereExtra {object} optional extra WHERE filters for posts (Sequelize where object)
 *
 * @returns {Promise<Array<Object>>} enriched collections (new objects)
 */
async function enrichCollectionsWithPosts(collections, models, opts = {}) {
  if (!Array.isArray(collections)) throw new TypeError('collections must be an array');
  const { Wall, sequelize } = models;
  if (!Wall || !sequelize) throw new TypeError('models must include Wall and sequelize');

  const limitPerCollection = Number(opts.limitPerCollection ?? 4);
  const maxRowsFetch = Number(opts.maxRowsFetch ?? 2000);
  const whereExtra = opts.whereExtra ?? {};

  // collect distinct refs
  const refs = Array.from(
    new Set(collections.map(c => c && c.collection_reference_number).filter(Boolean))
  );
  if (refs.length === 0) {
    return collections.map(c => ({ ...c, total_count: 0, collection_posts: [] }));
  }

  // 1) counts per collection_reference_number (single grouped query)
  // Returns rows like: { collection_reference_number: 'PW-COLL-...', cnt: 3 }
  const countRows = await Wall.findAll({
    attributes: [
      'collection_reference_number',
      [sequelize.fn('COUNT', sequelize.col('*')), 'cnt']
    ],
    where: {
      collection_reference_number: { [Op.in]: refs },
      is_public: 'everyone',	   
      is_deleted: 0,	    
      ...whereExtra
    },
    group: ['collection_reference_number'],
    raw: true
  });

  const countsMap = new Map();
  for (const r of countRows) {
    // Sequelize returns cnt as string for some dialects; ensure number
    countsMap.set(r.collection_reference_number, Number(r.cnt || 0));
  }

  // 2) fetch posts for these refs in a single query
  // Safety limit: min(refs.length * limitPerCollection, maxRowsFetch)
  const targetRows = Math.min(refs.length * limitPerCollection, maxRowsFetch);

  const posts = await Wall.findAll({
    attributes: ['media_url','type','collection_reference_number'],	  
    where: {
      collection_reference_number: { [Op.in]: refs },
      is_public: 'everyone',
      is_deleted: 0,	    
      ...whereExtra
    },
    order: [
      ['collection_reference_number', 'ASC'],
      ['created_at', 'DESC']
    ],
    limit: targetRows,
    raw: true
  });

  // 3) group posts by collection_reference_number and keep top N per ref
  const postsByRef = new Map();
  for (const p of posts) {
    const ref = p.collection_reference_number;
    if (!postsByRef.has(ref)) postsByRef.set(ref, []);
    const arr = postsByRef.get(ref);
    if (arr.length < limitPerCollection){ 
	// create a shallow copy and remove collection_reference_number before pushing
        const { collection_reference_number: _skip, ...postWithoutRef } = p;    
	//arr.push(p);
	arr.push(postWithoutRef);    
    }
  }

  // 4) merge into collections immutably
  const enriched = collections.map(col => {
    const ref = col && col.collection_reference_number;
    return {
      ...col,
      collection_count: countsMap.get(ref) ?? 0,
      collection_posts: postsByRef.get(ref) ?? []
    };
  });

  return enriched;
}

module.exports = { enrichCollectionsWithPosts };
