/**
 * Filters for items that are saved and match the reference number.
 *
 * @param {Array<Object>} data - The array of post objects to search.
 * @param {string} referenceNumber - The reference number to match.
 * @returns {Array<Object>} - Filtered array of matching posts.
 */
function filterSavedByReference(data, referenceNumber, mCurrentPage, pageSize = 10) {
  const filterData = data.filter(item => item.is_saved === true /* && item.reference_number === referenceNumber */);
  const total = filterData.length;
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.min(mCurrentPage, totalPages || 1);
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const pageData = filterData.slice(pageStart, pageEnd);
  const hasMore = currentPage < totalPages;

  const nextCursor = hasMore
    ? pageData[pageData.length - 1]?.created_at
    : null;

  return {
    data: pageData,
    pagination: {
      total,
      current_page: currentPage,
      total_pages: totalPages
    },
    infinite_scroll: {
      next_cursor: nextCursor,
      hasMore
    }
  };
}

module.exports = { filterSavedByReference };
