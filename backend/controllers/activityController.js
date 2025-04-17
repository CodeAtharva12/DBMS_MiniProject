const pool = require("../db");

// Get all activity logs
const getAllActivities = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT al.*, 
             u.name as user_name,
             u.role as user_role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.timestamp DESC
      LIMIT 20
    `);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT al.*, 
             u.name as user_name,
             u.role as user_role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.timestamp DESC
      LIMIT 10
    `);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Create new activity log (mainly for testing, normally created by other controllers)
const createActivity = async (req, res) => {
  try {
    const { user_id, activity_type, description, details } = req.body;

    // Validate required fields
    if (!activity_type || !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide activity_type and description",
      });
    }

    // Insert activity log
    const [result] = await pool.execute(
      "INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)",
      [
        user_id || req.user?.id || null,
        activity_type,
        description,
        details || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Activity logged successfully",
      data: {
        id: result.insertId,
        user_id: user_id || req.user?.id || null,
        activity_type,
        description,
        details,
      },
    });
  } catch (error) {
    console.error("Error creating activity log:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllActivities,
  getRecentActivities,
  createActivity,
};
