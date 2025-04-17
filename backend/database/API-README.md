# Blood Bank Management System - API Structure

This document outlines the API endpoints and structure for the Blood Bank Management System.

## Project Structure

```
/
├── controllers/
│   ├── authController.js
│   ├── donorController.js
│   ├── donationController.js
│   ├── bankController.js
│   ├── inventoryController.js
│   ├── recipientController.js
│   └── requestController.js
│
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
│
├── models/
│   ├── donorModel.js
│   ├── donationModel.js
│   ├── bankModel.js
│   ├── inventoryModel.js
│   ├── recipientModel.js
│   ├── requestModel.js
│   └── userModel.js
│
├── routes/
│   ├── authRoutes.js
│   ├── donorRoutes.js
│   ├── donationRoutes.js
│   ├── bankRoutes.js
│   ├── inventoryRoutes.js
│   ├── recipientRoutes.js
│   └── requestRoutes.js
│
├── utils/
│   ├── database.js
│   ├── logger.js
│   ├── emailService.js
│   └── responseFormatter.js
│
├── config/
│   ├── db.js
│   └── config.js
│
└── server.js
```

## API Endpoints

### Auth Routes

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout

### Donor Routes

- `GET /api/donors` - Get all donors
- `GET /api/donors/:id` - Get donor by ID
- `POST /api/donors` - Create a new donor
- `PUT /api/donors/:id` - Update donor
- `DELETE /api/donors/:id` - Delete donor
- `GET /api/donors/:id/donations` - Get donations by donor

### Donation Routes

- `GET /api/donations` - Get all donations
- `GET /api/donations/:id` - Get donation by ID
- `POST /api/donations` - Record a new donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation
- `GET /api/donations/expired` - Get expired donations
- `GET /api/donations/expiring-soon` - Get soon-to-expire donations

### Bank Routes

- `GET /api/banks` - Get all blood banks
- `GET /api/banks/:id` - Get blood bank by ID
- `POST /api/banks` - Create a new blood bank
- `PUT /api/banks/:id` - Update blood bank
- `DELETE /api/banks/:id` - Delete blood bank
- `GET /api/banks/:id/inventory` - Get inventory for specific bank

### Inventory Routes

- `GET /api/inventory` - Get all inventory
- `GET /api/inventory/:bankId` - Get inventory by bank
- `GET /api/inventory/blood-group/:group` - Get inventory by blood group
- `POST /api/inventory/update` - Update inventory

### Recipient Routes

- `GET /api/recipients` - Get all recipients
- `GET /api/recipients/:id` - Get recipient by ID
- `POST /api/recipients` - Create a new recipient
- `PUT /api/recipients/:id` - Update recipient
- `DELETE /api/recipients/:id` - Delete recipient
- `GET /api/recipients/:id/requests` - Get requests by recipient

### Blood Request Routes

- `GET /api/requests` - Get all blood requests
- `GET /api/requests/:id` - Get request by ID
- `POST /api/requests` - Create a new request
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request
- `PUT /api/requests/:id/approve` - Approve request
- `PUT /api/requests/:id/reject` - Reject request
- `PUT /api/requests/:id/fulfill` - Fulfill request

## Implementation Examples

### Example Controller Function

```javascript
exports.getDonors = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM donors ORDER BY created_at DESC"
    );
    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
```

### Example Database Connection

```javascript
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "blood_bank_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
```
