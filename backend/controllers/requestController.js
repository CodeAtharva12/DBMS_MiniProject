const pool = require("../db");

// Get all blood requests
const getAllRequests = async (req, res) => {
  try {
    // Check if we need to include all requests or just filter by status
    const includeAll = req.query.include_all === "true";
    const status = req.query.status;

    let query = `
      SELECT br.*, 
             r.organization_name as recipient_name, 
             bb.bank_name,
             r.contact_person,
             r.email as recipient_email,
             r.contact_number as recipient_phone
      FROM blood_requests br
      JOIN recipients r ON br.recipient_id = r.recipient_id
      JOIN blood_banks bb ON br.bank_id = bb.bank_id
    `;

    // Add WHERE clause if needed
    if (!includeAll && status) {
      query += ` WHERE br.status = '${status}'`;
    }

    query += ` ORDER BY br.request_date DESC`;

    const [rows] = await pool.query(query);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get single blood request
const getRequestById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT br.*, 
             r.organization_name as recipient_name, 
             bb.bank_name,
             r.contact_person,
             r.email as recipient_email,
             r.contact_number as recipient_phone
      FROM blood_requests br
      JOIN recipients r ON br.recipient_id = r.recipient_id
      JOIN blood_banks bb ON br.bank_id = bb.bank_id
      WHERE br.request_id = ?
    `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Create new blood request
const createRequest = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      recipient_id,
      bank_id,
      blood_group,
      units_requested,
      required_by,
      purpose,
      notes,
    } = req.body;

    // Get recipient ID from request body or from user token
    const requestRecipientId = recipient_id || req.user.id;

    // Validate required fields
    if (
      !requestRecipientId ||
      !bank_id ||
      !blood_group ||
      !units_requested ||
      !required_by ||
      !purpose
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    await connection.beginTransaction();

    // SPECIAL HANDLING FOR HARDCODED USERS
    // Check if this is our hardcoded hospital user
    if (req.user && req.user.email === "hospital@example.com") {
      console.log("Using hardcoded hospital user for request");

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

      // For hardcoded hospital, use recipient_id 1 (should be Deenanath Mangeshkar Hospital)
      // First check if this recipient exists in our database
      const [recipientExists] = await connection.query(
        "SELECT * FROM recipients WHERE recipient_id = 1"
      );

      let finalRecipientId = 1;
      let recipientName = "Deenanath Mangeshkar Hospital, Pune";

      // If no recipient with ID 1 exists, use the first recipient in the database
      if (recipientExists.length === 0) {
        const [firstRecipient] = await connection.query(
          "SELECT * FROM recipients LIMIT 1"
        );

        if (firstRecipient.length === 0) {
          // If no recipients exist at all, create one for our hardcoded hospital
          const [newRecipient] = await connection.execute(
            "INSERT INTO recipients (organization_name, type, contact_person, contact_number, email, address) VALUES (?, ?, ?, ?, ?, ?)",
            [
              "Deenanath Mangeshkar Hospital, Pune",
              "Hospital",
              "Dr. Deenanath",
              "(555) 123-4567",
              "hospital@example.com",
              "Erandwane, Pune, Maharashtra 411004",
            ]
          );

          finalRecipientId = newRecipient.insertId;
        } else {
          finalRecipientId = firstRecipient[0].recipient_id;
          recipientName = firstRecipient[0].organization_name;
        }
      } else {
        recipientName = recipientExists[0].organization_name;
      }

      // Insert request record
      const [requestResult] = await connection.execute(
        "INSERT INTO blood_requests (recipient_id, bank_id, blood_group, units_requested, required_by, purpose, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          finalRecipientId,
          bank_id,
          blood_group,
          units_requested,
          required_by,
          purpose,
          notes || null,
        ]
      );

      // Log activity
      try {
        await connection.query(
          "INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)",
          [
            req.user?.id || null,
            "request",
            `New blood request: ${units_requested} units of ${blood_group} from ${recipientName}`,
            JSON.stringify({
              request_id: requestResult.insertId,
              recipient_id: finalRecipientId,
              recipient_name: recipientName,
              bank_id,
              bank_name: bankCheck[0].bank_name,
              blood_group,
              units_requested,
              purpose,
            }),
          ]
        );
      } catch (err) {
        console.log("Failed to log activity, but continuing:", err.message);
        // Continue anyway, this is not critical
      }

      await connection.commit();

      return res.status(201).json({
        success: true,
        message: "Blood request submitted successfully",
        data: { request_id: requestResult.insertId },
      });
    }

    // NORMAL FLOW FOR DATABASE USERS
    // Check if recipient exists
    const [recipientCheck] = await connection.query(
      "SELECT * FROM recipients WHERE recipient_id = ?",
      [requestRecipientId]
    );

    if (recipientCheck.length === 0) {
      // If no recipient found by ID, try to find by user ID if available
      if (req.user && req.user.id) {
        const [userRecipientCheck] = await connection.query(
          "SELECT r.* FROM recipients r JOIN users u ON r.organization_name = u.name WHERE u.user_id = ?",
          [req.user.id]
        );

        if (userRecipientCheck.length > 0) {
          // Found a recipient associated with this user
          recipientCheck.push(userRecipientCheck[0]);
        } else {
          await connection.rollback();
          return res.status(404).json({
            success: false,
            message:
              "Recipient not found. Please check your recipient ID or user permissions.",
          });
        }
      } else {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Recipient not found",
        });
      }
    }

    // Use the found recipient ID
    const finalRecipientId = recipientCheck[0].recipient_id;

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

    // Check if required_by date is in the future
    const today = new Date();
    const requiredByDate = new Date(required_by);

    if (requiredByDate < today) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Required by date must be in the future",
      });
    }

    // Insert request record
    const [requestResult] = await connection.execute(
      "INSERT INTO blood_requests (recipient_id, bank_id, blood_group, units_requested, required_by, purpose, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        finalRecipientId,
        bank_id,
        blood_group,
        units_requested,
        required_by,
        purpose,
        notes || null,
      ]
    );

    // Log activity
    try {
      await connection.query(
        "INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)",
        [
          req.user?.id || null,
          "request",
          `New blood request: ${units_requested} units of ${blood_group} from ${recipientCheck[0].organization_name}`,
          JSON.stringify({
            request_id: requestResult.insertId,
            recipient_id: finalRecipientId,
            recipient_name: recipientCheck[0].organization_name,
            bank_id,
            bank_name: bankCheck[0].bank_name,
            blood_group,
            units_requested,
            purpose,
          }),
        ]
      );
    } catch (err) {
      console.log("Failed to log activity, but continuing:", err.message);
      // Continue anyway, this is not critical
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Blood request submitted successfully",
      data: { request_id: requestResult.insertId },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    connection.release();
  }
};

// Update blood request status
const updateRequestStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { status, notes, approved_by } = req.body;

    console.log("REQUEST BODY:", req.body);
    console.log("REQUEST PARAMS:", req.params);
    console.log("REQUEST USER:", req.user);

    if (!status) {
      console.log("ERROR: No status provided");
      return res.status(400).json({
        success: false,
        message: "Please provide a status",
      });
    }

    if (
      !["pending", "approved", "rejected", "fulfilled", "completed"].includes(
        status
      )
    ) {
      console.log("ERROR: Invalid status value:", status);
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: pending, approved, rejected, fulfilled, completed",
      });
    }

    await connection.beginTransaction();

    // Check if request exists
    const [requestCheck] = await connection.query(
      `
      SELECT br.*, 
             r.organization_name as recipient_name, 
             bb.bank_name
      FROM blood_requests br
      JOIN recipients r ON br.recipient_id = r.recipient_id
      JOIN blood_banks bb ON br.bank_id = bb.bank_id
      WHERE br.request_id = ?
    `,
      [req.params.id]
    );

    if (requestCheck.length === 0) {
      console.log("ERROR: Blood request not found, ID:", req.params.id);
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    const request = requestCheck[0];
    console.log("FOUND REQUEST:", request);

    // If status is the same, just update notes if provided
    if (request.status === status) {
      console.log("Status unchanged:", status);
      if (notes) {
        await connection.query(
          "UPDATE blood_requests SET notes = ? WHERE request_id = ?",
          [notes, req.params.id]
        );
      }

      await connection.commit();
      return res.status(200).json({
        success: true,
        message: `Request notes updated. Status remains ${status}.`,
      });
    }

    // If request is already fulfilled or rejected, we can't change its status
    if (
      (request.status === "fulfilled" || request.status === "rejected") &&
      (status === "approved" || status === "pending")
    ) {
      console.log(
        "ERROR: Cannot change status from",
        request.status,
        "to",
        status
      );
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${request.status} to ${status}`,
      });
    }

    // If status is changing to 'approved', check if there is enough blood in inventory
    if (status === "approved") {
      if (!approved_by) {
        console.log("ERROR: No approved_by value provided");
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "approved_by field is required when approving a request",
        });
      }

      console.log("REQUEST DATA:", {
        requestId: req.params.id,
        requestBloodGroup: request.blood_group,
        requestBankId: request.bank_id,
        requestUnits: request.units_requested,
      });

      // Normalize blood group by trimming whitespace and converting to uppercase
      const normalizedBloodGroup = request.blood_group.trim().toUpperCase();

      // First check if this blood group exists in inventory at all
      const [allInventory] = await connection.query(
        "SELECT * FROM blood_inventory WHERE bank_id = ?",
        [request.bank_id]
      );

      console.log(
        "ALL INVENTORY:",
        allInventory.map((item) => ({
          blood_group: item.blood_group,
          available_units: item.available_units,
        }))
      );

      // Use case-insensitive comparison for more reliable matching
      const [inventoryCheck] = await connection.query(
        "SELECT * FROM blood_inventory WHERE bank_id = ? AND UPPER(TRIM(blood_group)) = ?",
        [request.bank_id, normalizedBloodGroup]
      );

      console.log("INVENTORY CHECK:", {
        found: inventoryCheck.length > 0,
        inventoryBloodGroup: inventoryCheck[0]?.blood_group,
        normalizedRequestGroup: normalizedBloodGroup,
        availableUnits: inventoryCheck[0]?.available_units,
        requestedUnits: request.units_requested,
        availableType: typeof inventoryCheck[0]?.available_units,
        requestedType: typeof request.units_requested,
        query: `SELECT * FROM blood_inventory WHERE bank_id = ${request.bank_id} AND UPPER(TRIM(blood_group)) = '${normalizedBloodGroup}'`,
      });

      // Convert values to numbers before comparison to avoid string comparison issues
      const availableUnits = parseFloat(
        inventoryCheck[0]?.available_units || 0
      );
      const requestedUnits = parseFloat(request.units_requested || 0);

      console.log("NUMERIC COMPARISON:", {
        availableUnits,
        requestedUnits,
        comparison: availableUnits < requestedUnits,
      });

      if (inventoryCheck.length === 0 || availableUnits < requestedUnits) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient units available. Current inventory: ${availableUnits}, Requested: ${requestedUnits}`,
        });
      }

      // Deduct from inventory using the normalized blood group for consistency
      await connection.query(
        "UPDATE blood_inventory SET available_units = available_units - ? WHERE bank_id = ? AND UPPER(TRIM(blood_group)) = ?",
        [requestedUnits, request.bank_id, normalizedBloodGroup]
      );
    }

    // If status was 'approved' and is changing to 'rejected' or 'pending', add back to inventory
    if (
      request.status === "approved" &&
      (status === "rejected" || status === "pending")
    ) {
      // Convert units_requested to a number to avoid string operations in SQL
      const unitsToAdd = parseFloat(request.units_requested || 0);

      // Update inventory with proper numeric value
      await connection.query(
        "UPDATE blood_inventory SET available_units = available_units + ? WHERE bank_id = ? AND blood_group = ?",
        [unitsToAdd, request.bank_id, request.blood_group]
      );
    }

    // Update request status
    const updateFields = ["status = ?"];
    const updateValues = [status];

    if (notes) {
      updateFields.push("notes = ?");
      updateValues.push(notes);
    }

    if (status === "approved" && approved_by) {
      updateFields.push("approved_by = ?");
      updateValues.push(approved_by);
    }

    if (status === "fulfilled") {
      updateFields.push("fulfillment_date = NOW()");
    }

    updateValues.push(req.params.id); // for the WHERE clause

    await connection.query(
      `UPDATE blood_requests SET ${updateFields.join(
        ", "
      )} WHERE request_id = ?`,
      updateValues
    );

    // Log activity
    await connection.query(
      "INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)",
      [
        req.user?.id || null,
        status === "approved"
          ? "approval"
          : status === "rejected"
          ? "request"
          : status === "completed"
          ? "request"
          : "request",
        status === "approved"
          ? `Blood request approved: ${request.blood_group} (${request.units_requested} units)`
          : status === "rejected"
          ? `Blood request rejected: ${request.blood_group} (${request.units_requested} units)`
          : status === "completed"
          ? `Blood request status updated: ${request.status} -> pending`
          : `Blood request status updated: ${request.status} -> ${status}`,
        JSON.stringify({
          request_id: request.request_id,
          recipient_id: request.recipient_id,
          recipient_name: request.recipient_name,
          bank_id: request.bank_id,
          bank_name: request.bank_name,
          blood_group: request.blood_group,
          units: request.units_requested,
          old_status: request.status,
          new_status: status,
          status: status === "completed" ? "pending" : status, // Show "completed" as "pending" for frontend
        }),
      ]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: `Blood request status updated to ${status} successfully`,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating request status:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    connection.release();
  }
};

// Get blood requests by recipient
const getRequestsByRecipient = async (req, res) => {
  try {
    const { recipient_id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT br.*, 
             r.organization_name as recipient_name, 
             bb.bank_name,
             r.contact_person,
             r.email as recipient_email,
             r.contact_number as recipient_phone
      FROM blood_requests br
      JOIN recipients r ON br.recipient_id = r.recipient_id
      JOIN blood_banks bb ON br.bank_id = bb.bank_id
      WHERE br.recipient_id = ?
      ORDER BY br.request_date DESC
    `,
      [recipient_id]
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching requests by recipient:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get request statistics
const getRequestStats = async (req, res) => {
  try {
    // Get requests by status
    const [byStatus] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(units_requested) as total_units
      FROM blood_requests
      GROUP BY status
    `);

    // Get requests by blood group
    const [byBloodGroup] = await pool.query(`
      SELECT 
        blood_group,
        COUNT(*) as count,
        SUM(units_requested) as total_units
      FROM blood_requests
      GROUP BY blood_group
    `);

    // Get monthly request trends
    const [byMonth] = await pool.query(`
      SELECT 
        DATE_FORMAT(request_date, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(units_requested) as total_units
      FROM blood_requests
      WHERE request_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(request_date, '%Y-%m')
      ORDER BY month
    `);

    // Get total requests and approval rate
    const [totals] = await pool.query(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(units_requested) as total_units_requested,
        SUM(CASE WHEN status = 'approved' OR status = 'fulfilled' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'approved' OR status = 'fulfilled' THEN units_requested ELSE 0 END) as approved_units
      FROM blood_requests
    `);

    const approvalRate =
      totals[0].total_requests > 0
        ? (totals[0].approved_count / totals[0].total_requests) * 100
        : 0;

    res.status(200).json({
      success: true,
      data: {
        by_status: byStatus,
        by_blood_group: byBloodGroup,
        by_month: byMonth,
        totals: {
          ...totals[0],
          approval_rate: approvalRate.toFixed(2),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching request stats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  getRequestsByRecipient,
  getRequestStats,
};
