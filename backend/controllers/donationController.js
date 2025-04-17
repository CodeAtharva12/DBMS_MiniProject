const pool = require("../db");

// Get all donations
const getAllDonations = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, 
             dn.full_name as donor_name, 
             bb.bank_name
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.donor_id
      JOIN blood_banks bb ON d.bank_id = bb.bank_id
      ORDER BY d.donation_date DESC
    `);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get single donation
const getDonationById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT d.*, 
             dn.full_name as donor_name, 
             bb.bank_name
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.donor_id
      JOIN blood_banks bb ON d.bank_id = bb.bank_id
      WHERE d.donation_id = ?
    `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching donation:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Create new donation
const createDonation = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { donor_id, bank_id, blood_group, units, donation_date } = req.body;

    // Validate required fields
    if (!donor_id || !bank_id || !blood_group || !units || !donation_date) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    await connection.beginTransaction();

    // Check if donor exists
    const [donorCheck] = await connection.query(
      "SELECT * FROM donors WHERE donor_id = ?",
      [donor_id]
    );

    if (donorCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

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

    // Check if donor's blood group matches the donation blood group
    if (donorCheck[0].blood_group !== blood_group) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Blood group mismatch. Donor's blood group is ${donorCheck[0].blood_group}, but donation is for ${blood_group}`,
      });
    }

    // Check if donor is eligible to donate (health status)
    if (donorCheck[0].health_status === "Not Eligible") {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Donor is not eligible to donate at this time",
      });
    }

    // Check if donor's last donation was at least 56 days ago
    if (donorCheck[0].last_donation_date) {
      const lastDonation = new Date(donorCheck[0].last_donation_date);
      const currentDonation = new Date(donation_date);
      const daysDifference = Math.floor(
        (currentDonation - lastDonation) / (1000 * 60 * 60 * 24)
      );

      if (daysDifference < 56) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Donor's last donation was less than 56 days ago (${daysDifference} days). Must wait at least 56 days between donations.`,
        });
      }
    }

    // Insert donation record
    const [donationResult] = await connection.execute(
      "INSERT INTO donations (donor_id, bank_id, blood_group, units, donation_date) VALUES (?, ?, ?, ?, ?)",
      [donor_id, bank_id, blood_group, units, donation_date]
    );

    // Update donor's last donation date
    await connection.execute(
      "UPDATE donors SET last_donation_date = ? WHERE donor_id = ?",
      [donation_date, donor_id]
    );

    // Log activity
    await connection.query(
      "INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)",
      [
        req.user?.id || null,
        "donation",
        `New donation: ${units} units of ${blood_group} from ${donorCheck[0].full_name}`,
        JSON.stringify({
          donation_id: donationResult.insertId,
          donor_id,
          donor_name: donorCheck[0].full_name,
          bank_id,
          bank_name: bankCheck[0].bank_name,
          blood_group,
          units,
        }),
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Donation recorded successfully",
      data: { donation_id: donationResult.insertId },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating donation:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    connection.release();
  }
};

// Update donation status
const updateDonationStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Please provide a status",
      });
    }

    if (!["valid", "expired", "used"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: valid, expired, used",
      });
    }

    await connection.beginTransaction();

    // Check if donation exists
    const [donationCheck] = await connection.query(
      "SELECT d.*, bb.bank_name, dn.full_name as donor_name FROM donations d JOIN blood_banks bb ON d.bank_id = bb.bank_id JOIN donors dn ON d.donor_id = dn.donor_id WHERE d.donation_id = ?",
      [req.params.id]
    );

    if (donationCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    const donation = donationCheck[0];

    // If status is the same, no need to update
    if (donation.status === status) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Donation status is already ${status}`,
      });
    }

    // If donation is already expired or used, we can't change its status
    if (
      (donation.status === "expired" || donation.status === "used") &&
      status === "valid"
    ) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${donation.status} to ${status}`,
      });
    }

    // Update donation status
    await connection.query(
      "UPDATE donations SET status = ? WHERE donation_id = ?",
      [status, req.params.id]
    );

    // If status is changing FROM 'valid' TO 'expired' or 'used', decrease inventory
    if (
      donation.status === "valid" &&
      (status === "expired" || status === "used")
    ) {
      await connection.query(
        "UPDATE blood_inventory SET available_units = available_units - ? WHERE bank_id = ? AND blood_group = ?",
        [donation.units, donation.bank_id, donation.blood_group]
      );
    }

    // If status is changing TO 'valid' FROM 'expired' or 'used', increase inventory
    if (
      (donation.status === "expired" || donation.status === "used") &&
      status === "valid"
    ) {
      await connection.query(
        "UPDATE blood_inventory SET available_units = available_units + ? WHERE bank_id = ? AND blood_group = ?",
        [donation.units, donation.bank_id, donation.blood_group]
      );
    }

    // Log activity
    await connection.query(
      "INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)",
      [
        req.user?.id || null,
        "donation",
        `Donation status updated: ${donation.status} -> ${status} for donation #${donation.donation_id}`,
        JSON.stringify({
          donation_id: donation.donation_id,
          donor_id: donation.donor_id,
          donor_name: donation.donor_name,
          bank_id: donation.bank_id,
          bank_name: donation.bank_name,
          blood_group: donation.blood_group,
          units: donation.units,
          old_status: donation.status,
          new_status: status,
        }),
      ]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: `Donation status updated to ${status} successfully`,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating donation status:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    connection.release();
  }
};

// Get donations by date range
const getDonationsByDateRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Please provide start_date and end_date",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT d.*, 
             dn.full_name as donor_name, 
             bb.bank_name
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.donor_id
      JOIN blood_banks bb ON d.bank_id = bb.bank_id
      WHERE d.donation_date BETWEEN ? AND ?
      ORDER BY d.donation_date DESC
    `,
      [start_date, end_date]
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching donations by date range:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get donation stats
const getDonationStats = async (req, res) => {
  try {
    // Get donations by month for last 6 months
    const [byMonth] = await pool.query(`
      SELECT 
        DATE_FORMAT(donation_date, '%Y-%m') as month,
        SUM(units) as total_units,
        COUNT(*) as donation_count
      FROM donations
      WHERE donation_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(donation_date, '%Y-%m')
      ORDER BY month
    `);

    // Get donations by blood group
    const [byBloodGroup] = await pool.query(`
      SELECT 
        blood_group,
        SUM(units) as total_units,
        COUNT(*) as donation_count
      FROM donations
      GROUP BY blood_group
      ORDER BY blood_group
    `);

    // Get total donations and units
    const [totals] = await pool.query(`
      SELECT 
        COUNT(*) as total_donations,
        SUM(units) as total_units
      FROM donations
    `);

    res.status(200).json({
      success: true,
      data: {
        by_month: byMonth,
        by_blood_group: byBloodGroup,
        totals: totals[0],
      },
    });
  } catch (error) {
    console.error("Error fetching donation stats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonationStatus,
  getDonationsByDateRange,
  getDonationStats,
};
