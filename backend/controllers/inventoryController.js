const pool = require("../db");

// Get all blood inventory
const getAllInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT bi.inventory_id, bi.bank_id, bb.bank_name, bi.blood_group, 
             bi.available_units, bi.updated_at
      FROM blood_inventory bi
      JOIN blood_banks bb ON bi.bank_id = bb.bank_id
      ORDER BY bi.blood_group ASC
    `);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get inventory by blood group
const getInventoryByBloodGroup = async (req, res) => {
  try {
    const { blood_group } = req.params;

    const [rows] = await pool.query(
      `
      SELECT bi.inventory_id, bi.bank_id, bb.bank_name, bi.blood_group, 
             bi.available_units, bi.updated_at
      FROM blood_inventory bi
      JOIN blood_banks bb ON bi.bank_id = bb.bank_id
      WHERE bi.blood_group = ?
      ORDER BY bi.available_units DESC
    `,
      [blood_group]
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching inventory by blood group:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get inventory statistics
const getInventoryStats = async (req, res) => {
  try {
    // Get total units by blood group
    const [bloodGroups] = await pool.query(`
      SELECT blood_group, SUM(available_units) as total_units
      FROM blood_inventory
      GROUP BY blood_group
      ORDER BY blood_group
    `);

    // Get total available units
    const [totalUnits] = await pool.query(`
      SELECT SUM(available_units) as total_units
      FROM blood_inventory
    `);

    // Get soon to expire donations
    const [expiringSoon] = await pool.query(`
      SELECT blood_group, COUNT(*) as count, SUM(units) as total_units
      FROM donations
      WHERE status = 'valid' 
      AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      GROUP BY blood_group
    `);

    res.status(200).json({
      success: true,
      data: {
        by_blood_group: bloodGroups,
        total_units: totalUnits[0].total_units || 0,
        expiring_soon: expiringSoon,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update inventory manually (admin only)
const updateInventory = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { bank_id, blood_group, units, operation } = req.body;

    if (!bank_id || !blood_group || !units || !operation) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: bank_id, blood_group, units, operation",
      });
    }

    if (operation !== "add" && operation !== "subtract") {
      return res.status(400).json({
        success: false,
        message: 'Operation must be either "add" or "subtract"',
      });
    }

    // Ensure units is a number
    const numericUnits = parseFloat(units);

    if (isNaN(numericUnits) || numericUnits <= 0) {
      return res.status(400).json({
        success: false,
        message: "Units must be a positive number",
      });
    }

    await connection.beginTransaction();

    // Check if blood bank exists
    const [bankCheck] = await connection.query(
      "SELECT * FROM blood_banks WHERE bank_id = ?",
      [bank_id]
    );

    if (bankCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Blood bank not found",
      });
    }

    // Check if inventory record exists
    const [inventoryCheck] = await connection.query(
      "SELECT * FROM blood_inventory WHERE bank_id = ? AND blood_group = ?",
      [bank_id, blood_group]
    );

    if (inventoryCheck.length === 0 && operation === "subtract") {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Cannot subtract from non-existent inventory",
      });
    }

    if (inventoryCheck.length === 0) {
      // Create new inventory record
      await connection.query(
        "INSERT INTO blood_inventory (bank_id, blood_group, available_units) VALUES (?, ?, ?)",
        [bank_id, blood_group, numericUnits]
      );
    } else {
      // Update existing record
      if (operation === "add") {
        await connection.query(
          "UPDATE blood_inventory SET available_units = available_units + ? WHERE bank_id = ? AND blood_group = ?",
          [numericUnits, bank_id, blood_group]
        );
      } else {
        // Check if enough units available
        const availableUnits = parseFloat(
          inventoryCheck[0].available_units || 0
        );

        if (availableUnits < numericUnits) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: `Insufficient units available. Current: ${availableUnits}, Requested: ${numericUnits}`,
          });
        }

        await connection.query(
          "UPDATE blood_inventory SET available_units = available_units - ? WHERE bank_id = ? AND blood_group = ?",
          [numericUnits, bank_id, blood_group]
        );
      }
    }

    // Log activity
    await connection.query(
      "INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)",
      [
        req.user?.id || null,
        "inventory_update",
        `Manual inventory ${operation}: ${numericUnits} units of ${blood_group} at ${bankCheck[0].bank_name}`,
        JSON.stringify({
          bank_id,
          blood_group,
          units: numericUnits,
          operation,
          bank_name: bankCheck[0].bank_name,
        }),
      ]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: `Inventory updated successfully. ${numericUnits} units ${
        operation === "add" ? "added to" : "removed from"
      } ${blood_group} inventory.`,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating inventory:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    connection.release();
  }
};

// Get donations that will expire soon
const getExpiringDonations = async (req, res) => {
  try {
    const days = req.query.days || 7;

    const [rows] = await pool.query(
      `
      SELECT d.donation_id, d.donor_id, d.bank_id, d.blood_group, d.units,
             d.donation_date, d.expiry_date, 
             DATEDIFF(d.expiry_date, CURDATE()) as days_to_expiry,
             bb.bank_name, dn.full_name as donor_name
      FROM donations d
      JOIN blood_banks bb ON d.bank_id = bb.bank_id
      JOIN donors dn ON d.donor_id = dn.donor_id
      WHERE d.status = 'valid'
      AND d.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY d.expiry_date ASC
    `,
      [days]
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching expiring donations:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllInventory,
  getInventoryByBloodGroup,
  getInventoryStats,
  updateInventory,
  getExpiringDonations,
};
