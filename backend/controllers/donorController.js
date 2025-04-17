const pool = require("../db");

// Get all donors
const getAllDonors = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM donors ORDER BY created_at DESC"
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching donors:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get single donor
const getDonorById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM donors WHERE donor_id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching donor:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Create new donor
const createDonor = async (req, res) => {
  try {
    const {
      full_name,
      date_of_birth,
      age,
      gender,
      blood_group,
      contact_number,
      email,
      address,
      health_status,
      medical_history,
    } = req.body;

    // Validate required fields
    if (
      !full_name ||
      !date_of_birth ||
      !gender ||
      !blood_group ||
      !contact_number ||
      !email ||
      !address ||
      !age
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO donors (full_name, date_of_birth, age, gender, blood_group, contact_number, email, address, health_status, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        full_name,
        date_of_birth,
        age,
        gender,
        blood_group,
        contact_number,
        email,
        address,
        health_status || "Eligible",
        medical_history || "None reported",
      ]
    );

    if (result.affectedRows === 1) {
      const [donor] = await pool.query(
        "SELECT * FROM donors WHERE donor_id = ?",
        [result.insertId]
      );

      // Log activity
      await pool.query(
        "INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)",
        [
          req.user?.id || null,
          "user_management",
          `New donor added: ${full_name}`,
          JSON.stringify({
            donor_id: result.insertId,
            name: full_name,
            blood_group,
          }),
        ]
      );

      res.status(201).json({
        success: true,
        message: "Donor added successfully",
        data: donor[0],
      });
    }
  } catch (error) {
    console.error("Error creating donor:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update donor
const updateDonor = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      full_name,
      date_of_birth,
      age,
      gender,
      blood_group,
      contact_number,
      email,
      address,
      health_status,
      medical_history,
    } = req.body;

    await connection.beginTransaction();

    // First check if donor exists
    const [donor] = await connection.query(
      "SELECT * FROM donors WHERE donor_id = ?",
      [req.params.id]
    );

    if (donor.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    // Update the donor
    const [result] = await connection.query(
      `UPDATE donors SET 
        full_name = ?, 
        date_of_birth = ?, 
        age = ?,
        gender = ?, 
        blood_group = ?, 
        contact_number = ?, 
        email = ?, 
        address = ?, 
        health_status = ?,
        medical_history = ?
      WHERE donor_id = ?`,
      [
        full_name || donor[0].full_name,
        date_of_birth || donor[0].date_of_birth,
        age || donor[0].age,
        gender || donor[0].gender,
        blood_group || donor[0].blood_group,
        contact_number || donor[0].contact_number,
        email || donor[0].email,
        address || donor[0].address,
        health_status || donor[0].health_status,
        medical_history || donor[0].medical_history || "None reported",
        req.params.id,
      ]
    );

    // Log activity
    await connection.query(
      "INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)",
      [
        req.user?.id || null,
        "user_management",
        `Donor updated: ${full_name || donor[0].full_name}`,
        JSON.stringify({
          donor_id: req.params.id,
          name: full_name || donor[0].full_name,
        }),
      ]
    );

    await connection.commit();

    const [updatedDonor] = await pool.query(
      "SELECT * FROM donors WHERE donor_id = ?",
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: "Donor updated successfully",
      data: updatedDonor[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating donor:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    connection.release();
  }
};

// Delete donor
const deleteDonor = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // First check if donor exists
    const [donor] = await connection.query(
      "SELECT * FROM donors WHERE donor_id = ?",
      [req.params.id]
    );

    if (donor.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    // Check if donor has donations
    const [donations] = await connection.query(
      "SELECT COUNT(*) as count FROM donations WHERE donor_id = ?",
      [req.params.id]
    );

    if (donations[0].count > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Cannot delete donor with existing donations",
      });
    }

    // Delete the donor
    await connection.query("DELETE FROM donors WHERE donor_id = ?", [
      req.params.id,
    ]);

    // Log activity
    await connection.query(
      "INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)",
      [
        req.user?.id || null,
        "user_management",
        `Donor deleted: ${donor[0].full_name}`,
        JSON.stringify({ donor_id: req.params.id, name: donor[0].full_name }),
      ]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Donor deleted successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting donor:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    connection.release();
  }
};

// Get donor donation history
const getDonorDonations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, bb.bank_name
       FROM donations d
       JOIN blood_banks bb ON d.bank_id = bb.bank_id
       WHERE d.donor_id = ?
       ORDER BY d.donation_date DESC`,
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching donor donations:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
  getDonorDonations,
};
