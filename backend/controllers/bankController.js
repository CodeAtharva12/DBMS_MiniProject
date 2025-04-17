const pool = require('../db');

// Get all blood banks
const getAllBanks = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM blood_banks
      ORDER BY bank_name ASC
    `);
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching blood banks:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get single blood bank
const getBankById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM blood_banks
      WHERE bank_id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching blood bank:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Create new blood bank
const createBank = async (req, res) => {
  try {
    const { 
      bank_name, 
      location, 
      contact_number, 
      email, 
      capacity 
    } = req.body;
    
    // Validate required fields
    if (!bank_name || !location || !contact_number || !email || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Check if blood bank with same name already exists
    const [existing] = await pool.query(
      'SELECT * FROM blood_banks WHERE bank_name = ?',
      [bank_name]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Blood bank with this name already exists'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO blood_banks (bank_name, location, contact_number, email, capacity) VALUES (?, ?, ?, ?, ?)',
      [bank_name, location, contact_number, email, capacity]
    );
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)',
      [
        req.user?.id || null, 
        'user_management', 
        `New blood bank added: ${bank_name}`,
        JSON.stringify({ 
          bank_id: result.insertId, 
          name: bank_name, 
          location 
        })
      ]
    );
    
    const [newBank] = await pool.query(
      'SELECT * FROM blood_banks WHERE bank_id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Blood bank added successfully',
      data: newBank[0]
    });
  } catch (error) {
    console.error('Error creating blood bank:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Update blood bank
const updateBank = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { 
      bank_name, 
      location, 
      contact_number, 
      email, 
      capacity 
    } = req.body;
    
    await connection.beginTransaction();
    
    // Check if blood bank exists
    const [bank] = await connection.query(
      'SELECT * FROM blood_banks WHERE bank_id = ?',
      [req.params.id]
    );
    
    if (bank.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }
    
    // If updating bank name, check if new name conflicts with existing
    if (bank_name && bank_name !== bank[0].bank_name) {
      const [existing] = await connection.query(
        'SELECT * FROM blood_banks WHERE bank_name = ? AND bank_id != ?',
        [bank_name, req.params.id]
      );
      
      if (existing.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Another blood bank with this name already exists'
        });
      }
    }
    
    // Update the blood bank
    const [result] = await connection.query(
      `UPDATE blood_banks SET 
        bank_name = ?, 
        location = ?, 
        contact_number = ?, 
        email = ?, 
        capacity = ?
      WHERE bank_id = ?`,
      [
        bank_name || bank[0].bank_name,
        location || bank[0].location,
        contact_number || bank[0].contact_number,
        email || bank[0].email,
        capacity || bank[0].capacity,
        req.params.id
      ]
    );
    
    // Log activity
    await connection.query(
      'INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)',
      [
        req.user?.id || null, 
        'user_management', 
        `Blood bank updated: ${bank_name || bank[0].bank_name}`,
        JSON.stringify({ 
          bank_id: req.params.id, 
          name: bank_name || bank[0].bank_name
        })
      ]
    );
    
    await connection.commit();
    
    const [updatedBank] = await pool.query(
      'SELECT * FROM blood_banks WHERE bank_id = ?',
      [req.params.id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Blood bank updated successfully',
      data: updatedBank[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating blood bank:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  } finally {
    connection.release();
  }
};

// Delete blood bank
const deleteBank = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check if blood bank exists
    const [bank] = await connection.query(
      'SELECT * FROM blood_banks WHERE bank_id = ?',
      [req.params.id]
    );
    
    if (bank.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }
    
    // Check if bank has donations
    const [donations] = await connection.query(
      'SELECT COUNT(*) as count FROM donations WHERE bank_id = ?',
      [req.params.id]
    );
    
    if (donations[0].count > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete blood bank with existing donations'
      });
    }
    
    // Check if bank has inventory
    const [inventory] = await connection.query(
      'SELECT COUNT(*) as count FROM blood_inventory WHERE bank_id = ?',
      [req.params.id]
    );
    
    if (inventory[0].count > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete blood bank with existing inventory'
      });
    }
    
    // Check if bank has requests
    const [requests] = await connection.query(
      'SELECT COUNT(*) as count FROM blood_requests WHERE bank_id = ?',
      [req.params.id]
    );
    
    if (requests[0].count > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete blood bank with existing requests'
      });
    }
    
    // Delete the blood bank
    await connection.query(
      'DELETE FROM blood_banks WHERE bank_id = ?',
      [req.params.id]
    );
    
    // Log activity
    await connection.query(
      'INSERT INTO activity_logs (user_id, activity_type, description, details) VALUES (?, ?, ?, ?)',
      [
        req.user?.id || null, 
        'user_management', 
        `Blood bank deleted: ${bank[0].bank_name}`,
        JSON.stringify({ 
          bank_id: req.params.id, 
          name: bank[0].bank_name
        })
      ]
    );
    
    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Blood bank deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting blood bank:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  } finally {
    connection.release();
  }
};

// Get bank inventory
const getBankInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT bi.*, bb.bank_name
      FROM blood_inventory bi
      JOIN blood_banks bb ON bi.bank_id = bb.bank_id
      WHERE bi.bank_id = ?
      ORDER BY bi.blood_group ASC
    `, [req.params.id]);
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching bank inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get bank's donation history
const getBankDonations = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, dn.full_name as donor_name
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.donor_id
      WHERE d.bank_id = ?
      ORDER BY d.donation_date DESC
    `, [req.params.id]);
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching bank donations:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get bank's request history
const getBankRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT br.*, r.organization_name as recipient_name
      FROM blood_requests br
      JOIN recipients r ON br.recipient_id = r.recipient_id
      WHERE br.bank_id = ?
      ORDER BY br.request_date DESC
    `, [req.params.id]);
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching bank requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  getAllBanks,
  getBankById,
  createBank,
  updateBank,
  deleteBank,
  getBankInventory,
  getBankDonations,
  getBankRequests
}; 