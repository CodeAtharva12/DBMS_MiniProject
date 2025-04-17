const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { name, email, password, role, contact_number, address } = req.body;

    console.log("Registration attempt:", { name, email, role });

    // Validate inputs
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, password, role",
      });
    }

    if (role === "hospital" && (!contact_number || !address)) {
      return res.status(400).json({
        message: "Contact number and address are required for hospitals",
      });
    }

    await connection.beginTransaction();

    // Check if user already exists
    const [existingUsers] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the user - use appropriate column names based on schema
    let userId;
    try {
      // Check if the table uses 'id' or 'user_id'
      const [table] = await connection.query("SHOW COLUMNS FROM users");
      const idColumn = table.find(
        (col) => col.Field === "id" || col.Field === "user_id"
      );
      const idFieldName = idColumn ? idColumn.Field : "user_id";

      const roleValue = role === "hospital" ? "recipient" : role;

      const [result] = await connection.query(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        [name, email, hashedPassword, roleValue]
      );

      userId = result.insertId;
      console.log("User created with ID:", userId);
    } catch (err) {
      console.error("Error inserting user:", err);
      await connection.rollback();
      return res.status(500).json({
        success: false,
        message: "Error creating user account",
      });
    }

    // For hospital role, create a recipient record
    if (role === "hospital") {
      try {
        // Match the recipients table schema exactly - including all required columns
        const [recipientResult] = await connection.query(
          "INSERT INTO recipients (organization_name, type, contact_person, contact_number, email, address) VALUES (?, ?, ?, ?, ?, ?)",
          [
            name, // organization_name
            "Hospital", // type
            name, // contact_person (using name as default)
            contact_number, // contact_number
            email, // email
            address, // address
          ]
        );
        console.log("Recipient record created for hospital user");
      } catch (err) {
        console.error("Error creating recipient record:", err);
        console.error("SQL Error:", err.sqlMessage);
        await connection.rollback();
        return res.status(500).json({
          success: false,
          message: "Error creating hospital record",
        });
      }
    }

    await connection.commit();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: userId,
        email,
        name,
        role: role === "hospital" ? "recipient" : role,
      },
      process.env.JWT_SECRET || "bloodhaven_secret_key",
      { expiresIn: "24h" }
    );

    console.log("Registration successful for:", email);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        name,
        email,
        role: role === "hospital" ? "recipient" : role,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration",
    });
  } finally {
    connection.release();
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", { email, password });

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // HARDCODED AUTHENTICATION FOR DEMO PURPOSES
    // Check for hardcoded admin credentials
    if (email === "lifestream@gmail.com" && password === "12345678") {
      const token = jwt.sign(
        {
          id: 1,
          email: "lifestream@gmail.com",
          name: "Administrator",
          role: "admin",
        },
        process.env.JWT_SECRET || "bloodhaven_secret_key",
        { expiresIn: "24h" }
      );

      console.log("Hardcoded admin login successful");

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: 1,
          name: "Administrator",
          email: "lifestream@gmail.com",
          role: "admin",
        },
      });
    }

    // Check for hardcoded hospital credentials
    if (email === "hospital@example.com" && password === "hospital123") {
      const token = jwt.sign(
        {
          id: 2,
          email: "hospital@example.com",
          name: "City General Hospital",
          role: "hospital",
        },
        process.env.JWT_SECRET || "bloodhaven_secret_key",
        { expiresIn: "24h" }
      );

      console.log("Hardcoded hospital login successful");

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: 2,
          name: "City General Hospital",
          email: "hospital@example.com",
          role: "hospital",
        },
      });
    }

    // If not using hardcoded credentials, proceed with database check
    // Find the user
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    console.log("Users found:", users.length);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = users[0];
    console.log("User found:", {
      id: user.id || user.user_id,
      email: user.email,
      role: user.role,
    });

    // Check if the password is correct
    const validPassword = await bcrypt.compare(password, user.password);
    console.log("Password verification:", validPassword);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id || user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET || "bloodhaven_secret_key",
      { expiresIn: "24h" }
    );

    // Update last login time
    try {
      await pool.query(
        "UPDATE users SET last_login = NOW() WHERE id = ? OR user_id = ?",
        [user.id || 0, user.user_id || 0]
      );
    } catch (err) {
      console.log("Failed to update last login time:", err.message);
      // Continue anyway, this is not critical
    }

    // Log activity (wrapped in try/catch to prevent errors)
    try {
      await pool.query(
        "INSERT INTO activity_logs (user_id, activity_type, description) VALUES (?, ?, ?)",
        [
          user.id || user.user_id,
          "authentication",
          `User logged in: ${user.email}`,
        ]
      );
    } catch (err) {
      console.log("Failed to log activity:", err.message);
      // Continue anyway, this is not critical
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id || user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    // The user object is attached by the auth middleware
    const userId = req.user.id;

    // For hardcoded users, return their profile directly
    if (req.user.email === "lifestream@gmail.com") {
      return res.status(200).json({
        success: true,
        data: {
          id: 1,
          name: "Administrator",
          email: "lifestream@gmail.com",
          role: "admin",
        },
      });
    }

    if (req.user.email === "hospital@example.com") {
      return res.status(200).json({
        success: true,
        data: {
          id: 2,
          name: "City General Hospital",
          email: "hospital@example.com",
          role: "hospital",
        },
      });
    }

    // For database users, fetch from database
    const [users] = await pool.query(
      "SELECT id, user_id, name, email, role, status, created_at FROM users WHERE id = ? OR user_id = ?",
      [userId, userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Debug function to help troubleshoot table structure
const debugTableStructure = async (req, res) => {
  try {
    // Check recipients table structure
    const [columns] = await pool.query("DESCRIBE recipients");

    // Get sample data if available
    const [sampleData] = await pool.query("SELECT * FROM recipients LIMIT 1");

    res.status(200).json({
      success: true,
      table_structure: columns,
      sample_data: sampleData,
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting table structure",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  debugTableStructure,
};
