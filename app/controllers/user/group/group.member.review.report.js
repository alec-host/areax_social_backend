const { db2 } = require("../../../models");

const MembersReport = db2.members.report;

module.exports.reviewReportedGroupMember = async(reviewer_reference_number,report_id,review_status='reviewed') => {
  try {
    // Validate status
    const validStatuses = ['reviewed', 'dismissed', 'actioned'];
    if (!validStatuses.includes(review_status)) {
      return [false, 'Invalid review status provided.'];
    }

    // Find the report
    const report = await MembersReport.findOne({ where: { report_id } });

    if (!report) {
      return [false, 'Report not found.'];
    }

    // Update review fields
    report.status = review_status;
    report.reviewed_by = reviewer_reference_number;
    report.reviewed_at = new Date();

    await report.save();

    return [true, report];
  } catch (e) {
    console.log(`Review Error: ${e?.message}`);
    return [false, 'Error updating the report.'];
  }
};
