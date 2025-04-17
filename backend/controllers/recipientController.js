const pool = require('../db');

// Get all recipients
const getAllRecipients = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM recipients
      ORDER BY organization_name ASC
    `);
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get single recipient
const getRecipientById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM recipients
      WHERE recipient_id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching recipient:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Create new recipient
const createRecipient = async (req, res) => {
  try {
    const { 
      organization_name, 
      type, 
      contact_person, 
      contact_number, 
      email, 
      address 
    } = req.body;
    
    // Validate required fields
    if (!organization_name || !type || !contact_person || !contact_number || !email || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Validate recipient type
    if (!['Hospital', 'Research', 'EMS', 'Other'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient type. Must be one of: Hospital, Research, EMS, Other'
      });
    }
    
    // Check if recipient with same name already exists
    const [existing] = await pool.query(
      'SELECT * FROM recipients WHERE organization_name = ?',
      [organization_name]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipient with this name already exists'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO recipients (organization_name, type, contact_person, contact_number, email, address) VALUES (?, ?, ?, ?, ?, ?)',
      [organization_name, type, contact_person, contact_number, email, address]
    );
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)',
      [
        req.user?.id || null, 
        'user_management', 
        `New recipient added: ${organization_name}`,
        JSON.stringify({ 
          recipient_id: result.insertId, 
          name: organization_name, 
          type 
        })
      ]
    );
    
    const [newRecipient] = await pool.query(
      'SELECT * FROM recipients WHERE recipient_id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Recipient added successfully',
      data: newRecipient[0]
    });
  } catch (error) {
    console.error('Error creating recipient:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Update recipient
const updateRecipient = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { 
      organization_name, 
      type, 
      contact_person, 
      contact_number, 
      email, 
      address,
      status
    } = req.body;
    
    await connection.beginTransaction();
    
    // Check if recipient exists
    const [recipient] = await connection.query(
      'SELECT * FROM recipients WHERE recipient_id = ?',
      [req.params.id]
    );
    
    if (recipient.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    // If updating organization name, check if new name conflicts with existing
    if (organization_name && organization_name !== recipient[0].organization_name) {
      const [existing] = await connection.query(
        'SELECT * FROM recipients WHERE organization_name = ? AND recipient_id != ?',
        [organization_name, req.params.id]
      );
      
      if (existing.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Another recipient with this name already exists'
        });
      }
    }
    
    // Update the recipient
    const [result] = await connection.query(
      `UPDATE recipients SET 
        organization_name = ?, 
        type = ?, 
        contact_person = ?, 
        contact_number = ?, 
        email = ?, 
        address = ?,
        status = ?
      WHERE recipient_id = ?`,
      [
        organization_name || recipient[0].organization_name,
        type || recipient[0].type,
        contact_person || recipient[0].contact_person,
        contact_number || recipient[0].contact_number,
        email || recipient[0].email,
        address || recipient[0].address,
        status || recipient[0].status,
        req.params.id
      ]
    );
    
    // Log activity
    await connection.query(
      'INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)',
      [
        req.user?.id || null, 
        'user_management', 
        `Recipient updated: ${organization_name || recipient[0].organization_name}`,
        JSON.stringify({ 
          recipient_id: req.params.id, 
          name: organization_name || recipient[0].organization_name
        })
      ]
    );
    
    await connection.commit();
    
    const [updatedRecipient] = await pool.query(
      'SELECT * FROM recipients WHERE recipient_id = ?',
      [req.params.id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Recipient updated successfully',
      data: updatedRecipient[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating recipient:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  } finally {
    connection.release();
  }
};

// Delete recipient
const deleteRecipient = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check if recipient exists
    const [recipient] = await connection.query(
      'SELECT * FROM recipients WHERE recipient_id = ?',
      [req.params.id]
    );
    
    if (recipient.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    // Check if recipient has blood requests
    const [requests] = await connection.query(
      'SELECT COUNT(*) as count FROM blood_requests WHERE recipient_id = ?',
      [req.params.id]
    );
    
    if (requests[0].count > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete recipient with existing blood requests'
      });
    }
    
    // Delete the recipient
    await connection.query(
      'DELETE FROM recipients WHERE recipient_id = ?',
      [req.params.id]
    );
    
    // Log activity
    await connection.query(
      'INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)',
      [
        req.user?.id || null, 
        'user_management', 
        `Recipient deleted: ${recipient[0].organization_name}`,
        JSON.stringify({ 
          recipient_id: req.params.id, 
          name: recipient[0].organization_name
        })
      ]
    );
    
    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Recipient deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting recipient:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  } finally {
    connection.release();
  }
};

// Get recipient's blood request history
const getRecipientRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT br.*, bb.bank_name
      FROM blood_requests br
      JOIN blood_banks bb ON br.bank_id = bb.bank_id
      WHERE br.recipient_id = ?
      ORDER BY br.request_date DESC
    `, [req.params.id]);
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching recipient requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  getAllRecipients,
  getRecipientById,
  createRecipient,
  updateRecipient,
  deleteRecipient,
  getRecipientRequests
}; 