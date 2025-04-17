const pool = require('../db');

// Get overview dashboard stats
const getOverviewStats = async (req, res) => {
  try {
    // Get total donors
    const [donorsCount] = await pool.query('SELECT COUNT(*) as count FROM donors');
    
    // Get total recipients
    const [recipientsCount] = await pool.query('SELECT COUNT(*) as count FROM recipients');
    
    // Get total blood banks
    const [banksCount] = await pool.query('SELECT COUNT(*) as count FROM blood_banks');
    
    // Get total donations
    const [donationsCount] = await pool.query('SELECT COUNT(*) as count, SUM(units) as total_units FROM donations');
    
    // Get total blood inventory by blood group
    const [inventoryByGroup] = await pool.query(`
      SELECT blood_group, SUM(available_units) as total_units
      FROM blood_inventory
      GROUP BY blood_group
      ORDER BY blood_group
    `);
    
    // Get total pending requests
    const [pendingRequests] = await pool.query(`
      SELECT COUNT(*) as count
      FROM blood_requests
      WHERE status = 'pending'
    `);
    
    res.status(200).json({
      success: true,
      data: {
        donors_count: donorsCount[0].count,
        recipients_count: recipientsCount[0].count,
        banks_count: banksCount[0].count,
        donations_count: donationsCount[0].count,
        total_donated_units: donationsCount[0].total_units || 0,
        inventory_by_group: inventoryByGroup,
        pending_requests: pendingRequests[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get inventory report
const getInventoryReport = async (req, res) => {
  try {
    // Get inventory by blood group and bank
    const [inventoryByBank] = await pool.query(`
      SELECT bb.bank_id, bb.bank_name, bi.blood_group, bi.available_units
      FROM blood_inventory bi
      JOIN blood_banks bb ON bi.bank_id = bb.bank_id
      ORDER BY bb.bank_name, bi.blood_group
    `);
    
    // Get total inventory by blood group
    const [totalByGroup] = await pool.query(`
      SELECT blood_group, SUM(available_units) as total_units
      FROM blood_inventory
      GROUP BY blood_group
      ORDER BY blood_group
    `);
    
    // Get expiring soon inventory
    const [expiringSoon] = await pool.query(`
      SELECT d.blood_group, COUNT(*) as count, SUM(d.units) as total_units
      FROM donations d
      WHERE d.status = 'valid' 
        AND d.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      GROUP BY d.blood_group
    `);
    
    // Format the data for easier consumption
    const bankData = {};
    inventoryByBank.forEach(item => {
      if (!bankData[item.bank_name]) {
        bankData[item.bank_name] = {
          bank_id: item.bank_id,
          bank_name: item.bank_name,
          blood_groups: {}
        };
      }
      bankData[item.bank_name].blood_groups[item.blood_group] = item.available_units;
    });
    
    res.status(200).json({
      success: true,
      data: {
        by_bank: Object.values(bankData),
        by_blood_group: totalByGroup,
        expiring_soon: expiringSoon
      }
    });
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get donation report
const getDonationReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    let dateParams = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE d.donation_date BETWEEN ? AND ?';
      dateParams = [start_date, end_date];
    }
    
    // Get donations by month
    const [byMonth] = await pool.query(`
      SELECT 
        DATE_FORMAT(d.donation_date, '%Y-%m') as month,
        SUM(d.units) as total_units,
        COUNT(*) as donation_count
      FROM donations d
      ${dateFilter}
      GROUP BY DATE_FORMAT(d.donation_date, '%Y-%m')
      ORDER BY month
    `, dateParams);
    
    // Get donations by blood group
    const [byBloodGroup] = await pool.query(`
      SELECT 
        d.blood_group,
        SUM(d.units) as total_units,
        COUNT(*) as donation_count
      FROM donations d
      ${dateFilter}
      GROUP BY d.blood_group
      ORDER BY d.blood_group
    `, dateParams);
    
    // Get donations by bank
    const [byBank] = await pool.query(`
      SELECT 
        bb.bank_name,
        SUM(d.units) as total_units,
        COUNT(*) as donation_count
      FROM donations d
      JOIN blood_banks bb ON d.bank_id = bb.bank_id
      ${dateFilter}
      GROUP BY bb.bank_name
      ORDER BY total_units DESC
    `, dateParams);
    
    // Get summary stats
    const [summary] = await pool.query(`
      SELECT 
        COUNT(DISTINCT d.donor_id) as unique_donors,
        COUNT(*) as donation_count,
        SUM(d.units) as total_units,
        AVG(d.units) as average_donation_size
      FROM donations d
      ${dateFilter}
    `, dateParams);
    
    res.status(200).json({
      success: true,
      data: {
        by_month: byMonth,
        by_blood_group: byBloodGroup,
        by_bank: byBank,
        summary: summary[0]
      }
    });
  } catch (error) {
    console.error('Error fetching donation report:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get request report
const getRequestReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    let dateParams = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE br.request_date BETWEEN ? AND ?';
      dateParams = [start_date, end_date];
    }
    
    // Get requests by status
    const [byStatus] = await pool.query(`
      SELECT 
        br.status,
        COUNT(*) as count,
        SUM(br.units_requested) as total_units
      FROM blood_requests br
      ${dateFilter}
      GROUP BY br.status
    `, dateParams);
    
    // Get requests by blood group
    const [byBloodGroup] = await pool.query(`
      SELECT 
        br.blood_group,
        COUNT(*) as count,
        SUM(br.units_requested) as total_units
      FROM blood_requests br
      ${dateFilter}
      GROUP BY br.blood_group
      ORDER BY br.blood_group
    `, dateParams);
    
    // Get requests by recipient
    const [byRecipient] = await pool.query(`
      SELECT 
        r.organization_name,
        COUNT(*) as count,
        SUM(br.units_requested) as total_units
      FROM blood_requests br
      JOIN recipients r ON br.recipient_id = r.recipient_id
      ${dateFilter}
      GROUP BY r.organization_name
      ORDER BY count DESC
    `, dateParams);
    
    // Get monthly trends
    const [byMonth] = await pool.query(`
      SELECT 
        DATE_FORMAT(br.request_date, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(br.units_requested) as total_units,
        SUM(CASE WHEN br.status = 'approved' OR br.status = 'fulfilled' THEN 1 ELSE 0 END) as approved_count
      FROM blood_requests br
      ${dateFilter}
      GROUP BY DATE_FORMAT(br.request_date, '%Y-%m')
      ORDER BY month
    `, dateParams);
    
    // Get summary stats
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(br.units_requested) as total_units_requested,
        SUM(CASE WHEN br.status = 'approved' OR br.status = 'fulfilled' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN br.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN br.status = 'pending' THEN 1 ELSE 0 END) as pending_count
      FROM blood_requests br
      ${dateFilter}
    `, dateParams);
    
    // Calculate approval rate
    const approvalRate = summary[0].total_requests > 0 
      ? (summary[0].approved_count / summary[0].total_requests) * 100 
      : 0;
    
    summary[0].approval_rate = approvalRate.toFixed(2);
    
    res.status(200).json({
      success: true,
      data: {
        by_status: byStatus,
        by_blood_group: byBloodGroup,
        by_recipient: byRecipient,
        by_month: byMonth,
        summary: summary[0]
      }
    });
  } catch (error) {
    console.error('Error fetching request report:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get activity logs
const getActivityLogs = async (req, res) => {
  try {
    const { start_date, end_date, activity_type, limit } = req.query;
    
    let whereConditions = [];
    let queryParams = [];
    
    if (start_date && end_date) {
      whereConditions.push('timestamp BETWEEN ? AND ?');
      queryParams.push(start_date, end_date);
    }
    
    if (activity_type) {
      whereConditions.push('activity_type = ?');
      queryParams.push(activity_type);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    const limitClause = limit ? `LIMIT ${parseInt(limit)}` : '';
    
    // Get activity logs
    const [logs] = await pool.query(`
      SELECT 
        al.log_id,
        al.user_id,
        u.name as user_name,
        u.email as user_email,
        al.activity_type,
        al.description,
        al.details,
        al.ip_address,
        al.timestamp
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ${whereClause}
      ORDER BY al.timestamp DESC
      ${limitClause}
    `, queryParams);
    
    // Get activity counts by type
    const [byType] = await pool.query(`
      SELECT 
        activity_type,
        COUNT(*) as count
      FROM activity_logs
      ${whereClause}
      GROUP BY activity_type
    `, queryParams);
    
    res.status(200).json({
      success: true,
      data: {
        logs,
        by_type: byType
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  getOverviewStats,
  getInventoryReport,
  getDonationReport,
  getRequestReport,
  getActivityLogs
}; 