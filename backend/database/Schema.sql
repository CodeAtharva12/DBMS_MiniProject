-- Blood Bank Management System Database Schema
-- MySQL dump 10.13 compatible

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Create the database
CREATE DATABASE IF NOT EXISTS blood_bank_system;
USE blood_bank_system;

-- Users table for system access
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','recipient','hospital') NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Donors table
DROP TABLE IF EXISTS `donors`;
CREATE TABLE IF NOT EXISTS `donors` (
  `donor_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `age` int DEFAULT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
  `contact_number` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `health_status` enum('Eligible','Not Eligible') DEFAULT 'Eligible',
  `medical_history` text,
  `last_donation_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`donor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Blood Bank table
DROP TABLE IF EXISTS `blood_banks`;
CREATE TABLE IF NOT EXISTS `blood_banks` (
  `bank_id` int NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(100) NOT NULL,
  `location` text NOT NULL,
  `contact_number` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `capacity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`bank_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Recipients/Hospital table
DROP TABLE IF EXISTS `recipients`;
CREATE TABLE IF NOT EXISTS `recipients` (
  `recipient_id` int NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `organization_name` varchar(100) NOT NULL,
  `type` enum('Hospital','Research','EMS','Other') NOT NULL,
  `contact_person` varchar(100) NOT NULL,
  `contact_number` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`recipient_id`),
  CONSTRAINT `recipients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Donations table
DROP TABLE IF EXISTS `donations`;
CREATE TABLE IF NOT EXISTS `donations` (
  `donation_id` int NOT NULL AUTO_INCREMENT,
  `donor_id` int NOT NULL,
  `bank_id` int NOT NULL,
  `blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
  `units` decimal(5,2) NOT NULL,
  `donation_date` date NOT NULL,
  `expiry_date` date GENERATED ALWAYS AS ((`donation_date` + interval 41 day)) STORED,
  `status` enum('valid','expired','used') DEFAULT 'valid',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`donation_id`),
  KEY `donor_id` (`donor_id`),
  KEY `bank_id` (`bank_id`),
  CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`donor_id`),
  CONSTRAINT `donations_ibfk_2` FOREIGN KEY (`bank_id`) REFERENCES `blood_banks` (`bank_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Blood Inventory table
DROP TABLE IF EXISTS `blood_inventory`;
CREATE TABLE IF NOT EXISTS `blood_inventory` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `bank_id` int NOT NULL,
  `blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
  `available_units` decimal(5,2) DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`inventory_id`),
  UNIQUE KEY `bank_blood_group` (`bank_id`,`blood_group`),
  CONSTRAINT `blood_inventory_ibfk_1` FOREIGN KEY (`bank_id`) REFERENCES `blood_banks` (`bank_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Blood Requests table
DROP TABLE IF EXISTS `blood_requests`;
CREATE TABLE IF NOT EXISTS `blood_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `recipient_id` int NOT NULL,
  `bank_id` int NOT NULL,
  `blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
  `units_requested` decimal(5,2) NOT NULL,
  `request_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `required_by` date NOT NULL,
  `purpose` text NOT NULL,
  `status` enum('pending','approved','rejected','fulfilled','completed') DEFAULT 'pending',
  `approved_by` int DEFAULT NULL,
  `fulfillment_date` date DEFAULT NULL,
  `notes` text,
  `patient_name` VARCHAR(100) DEFAULT NULL,
  `patient_age` INT DEFAULT NULL,
  PRIMARY KEY (`request_id`),
  KEY `recipient_id` (`recipient_id`),
  KEY `bank_id` (`bank_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `blood_requests_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `recipients` (`recipient_id`),
  CONSTRAINT `blood_requests_ibfk_2` FOREIGN KEY (`bank_id`) REFERENCES `blood_banks` (`bank_id`),
  CONSTRAINT `blood_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Activity Logs table
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `activity_type` enum('login','donation','request','approval','expiry','inventory_update','user_management','authentication') NOT NULL,
  `description` text NOT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===== TRIGGERS =====

-- Trigger to check if donor is eligible before allowing donation (56-day rule)
DELIMITER //
CREATE TRIGGER IF NOT EXISTS before_donation_insert
BEFORE INSERT ON donations
FOR EACH ROW
BEGIN
    DECLARE last_donation DATE;
    DECLARE day_diff INT;
    
    -- Get donor's last donation date
    SELECT last_donation_date INTO last_donation
    FROM donors
    WHERE donor_id = NEW.donor_id;
    
    -- Check if donor has donated before and if they are eligible
    IF last_donation IS NOT NULL THEN
        SET day_diff = DATEDIFF(NEW.donation_date, last_donation);
        
        IF day_diff < 56 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = CONCAT("Donor's last donation was less than 56 days ago (", day_diff, " days). Must wait at least 56 days between donations.");
        END IF;
    END IF;
END//
DELIMITER ;

-- Trigger to update blood inventory after a new donation
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_donation_insert
AFTER INSERT ON donations
FOR EACH ROW
BEGIN
    -- Insert or update inventory record
    INSERT INTO blood_inventory (bank_id, blood_group, available_units)
    VALUES (NEW.bank_id, NEW.blood_group, NEW.units)
    ON DUPLICATE KEY UPDATE
        available_units = available_units + NEW.units;
    
    -- Update donor's last donation date
    UPDATE donors
    SET last_donation_date = NEW.donation_date
    WHERE donor_id = NEW.donor_id;
    
    -- Log the activity
    INSERT INTO activity_logs (activity_type, description, details)
    VALUES ('donation', 
            CONCAT('New donation of ', NEW.units, ' units of ', NEW.blood_group, ' blood'),
            JSON_OBJECT('donation_id', NEW.donation_id, 'donor_id', NEW.donor_id, 'bank_id', NEW.bank_id));
END//
DELIMITER ;

-- Trigger to update inventory when blood expires
DELIMITER //
CREATE TRIGGER IF NOT EXISTS check_blood_expiry
BEFORE UPDATE ON donations
FOR EACH ROW
BEGIN
    -- If status is changing from valid to expired
    IF OLD.status = 'valid' AND NEW.status = 'expired' THEN
        -- Update inventory
        UPDATE blood_inventory
        SET available_units = available_units - OLD.units
        WHERE bank_id = OLD.bank_id AND blood_group = OLD.blood_group;
        
        -- Log the activity
        INSERT INTO activity_logs (activity_type, description, details)
        VALUES ('expiry', 
                CONCAT(OLD.units, ' units of ', OLD.blood_group, ' blood expired'),
                JSON_OBJECT('donation_id', OLD.donation_id, 'bank_id', OLD.bank_id));
    END IF;
END//
DELIMITER ;

-- Trigger to update inventory and donation status when a request is approved
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_request_approval
AFTER UPDATE ON blood_requests
FOR EACH ROW
BEGIN
    -- If status is changing from pending to approved
    IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
        -- Update inventory
        UPDATE blood_inventory
        SET available_units = available_units - NEW.units_requested
        WHERE bank_id = NEW.bank_id AND blood_group = NEW.blood_group;
        
        -- Log the activity with preserved notes
        INSERT INTO activity_logs (activity_type, description, details)
        VALUES ('approval', 
                CONCAT('Request for ', NEW.units_requested, ' units of ', NEW.blood_group, ' blood approved'),
                JSON_OBJECT(
                    'request_id', NEW.request_id, 
                    'recipient_id', NEW.recipient_id, 
                    'bank_id', NEW.bank_id,
                    'notes', NEW.notes,
                    'original_notes', OLD.notes
                ));
    END IF;
END//
DELIMITER ;

-- Trigger to log activity when a request is rejected
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_request_rejection
AFTER UPDATE ON blood_requests
FOR EACH ROW
BEGIN
    -- If status is changing from pending to rejected
    IF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
        -- Log the activity with preserved notes
        INSERT INTO activity_logs (activity_type, description, details)
        VALUES ('request', 
                CONCAT('Request for ', NEW.units_requested, ' units of ', NEW.blood_group, ' blood rejected'),
                JSON_OBJECT(
                    'request_id', NEW.request_id, 
                    'recipient_id', NEW.recipient_id, 
                    'bank_id', NEW.bank_id,
                    'notes', NEW.notes,
                    'rejection_reason', NEW.notes
                ));
    END IF;
END//
DELIMITER ;

-- ===== PROCEDURES =====

-- Procedure to check and update expired blood
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS update_expired_blood()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE d_id INT;
    DECLARE d_units DECIMAL(5,2);
    DECLARE d_bank_id INT;
    DECLARE d_blood_group VARCHAR(5);
    
    -- Cursor for donations that are valid but have passed their expiry date
    DECLARE cur CURSOR FOR 
        SELECT donation_id, units, bank_id, blood_group
        FROM donations
        WHERE status = 'valid' AND expiry_date < CURDATE();
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    update_loop: LOOP
        FETCH cur INTO d_id, d_units, d_bank_id, d_blood_group;
        IF done THEN
            LEAVE update_loop;
        END IF;
        
        -- Update donation status to expired
        UPDATE donations
        SET status = 'expired'
        WHERE donation_id = d_id;
        
        -- Update inventory (trigger will handle this)
    END LOOP;
    
    CLOSE cur;
END//
DELIMITER ;

-- Procedure to get available blood by blood group
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS get_available_blood_by_group(IN blood_group_param VARCHAR(5))
BEGIN
    SELECT 
        blood_group,
        SUM(available_units) as total_units,
        COUNT(DISTINCT bank_id) as bank_count
    FROM 
        blood_inventory
    WHERE 
        blood_group = blood_group_param
        AND available_units > 0
    GROUP BY 
        blood_group;
END//
DELIMITER ;

-- Procedure to check donor eligibility
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS check_donor_eligibility(IN donor_phone VARCHAR(15), OUT is_eligible BOOLEAN, OUT eligible_date DATE)
BEGIN
    DECLARE last_don_date DATE;
    DECLARE elig_date DATE;
    
    -- Get donor's last donation date
    SELECT
        last_donation_date,
        DATE_ADD(last_donation_date, INTERVAL 56 DAY) INTO last_don_date, elig_date
    FROM donors
    WHERE contact_number = donor_phone;
    
    -- Set eligibility based on last donation
    IF last_don_date IS NULL THEN
        SET is_eligible = TRUE;
        SET eligible_date = NULL;
    ELSEIF CURDATE() >= elig_date THEN
        SET is_eligible = TRUE;
        SET eligible_date = elig_date;
    ELSE
        SET is_eligible = FALSE;
        SET eligible_date = elig_date;
    END IF;
END//
DELIMITER ;

-- ===== VIEWS =====

-- View for valid blood inventory
CREATE OR REPLACE VIEW valid_blood_inventory AS
SELECT 
    bi.bank_id,
    bb.bank_name,
    bi.blood_group,
    bi.available_units,
    bb.location
FROM 
    blood_inventory bi
JOIN 
    blood_banks bb ON bi.bank_id = bb.bank_id
WHERE 
    bi.available_units > 0;

-- View for donor statistics
CREATE OR REPLACE VIEW donor_statistics AS
SELECT 
    d.blood_group,
    COUNT(DISTINCT d.donor_id) as donor_count,
    COUNT(do.donation_id) as donation_count,
    SUM(do.units) as total_units_donated
FROM 
    donors d
LEFT JOIN 
    donations do ON d.donor_id = do.donor_id
GROUP BY 
    d.blood_group;

-- View for recipient request history
CREATE OR REPLACE VIEW recipient_request_history AS
SELECT 
    r.recipient_id,
    r.organization_name,
    r.type,
    COUNT(br.request_id) as total_requests,
    SUM(CASE WHEN br.status = 'approved' THEN 1 ELSE 0 END) as approved_requests,
    SUM(CASE WHEN br.status = 'rejected' THEN 1 ELSE 0 END) as rejected_requests,
    SUM(CASE WHEN br.status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
    SUM(CASE WHEN br.status = 'fulfilled' THEN 1 ELSE 0 END) as fulfilled_requests,
    SUM(CASE WHEN br.status = 'completed' THEN 1 ELSE 0 END) as completed_requests
FROM 
    recipients r
LEFT JOIN 
    blood_requests br ON r.recipient_id = br.recipient_id
GROUP BY 
    r.recipient_id, r.organization_name, r.type;

-- View for donations about to expire
CREATE OR REPLACE VIEW soon_to_expire_donations AS
SELECT 
    d.donation_id,
    d.blood_group,
    d.units,
    d.donation_date,
    d.expiry_date,
    DATEDIFF(d.expiry_date, CURDATE()) as days_to_expiry,
    bb.bank_name,
    bb.location
FROM 
    donations d
JOIN 
    blood_banks bb ON d.bank_id = bb.bank_id
WHERE 
    d.status = 'valid'
    AND d.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY);

-- View for eligible donors
CREATE OR REPLACE VIEW eligible_donors AS
SELECT
    donor_id,
    full_name,
    blood_group,
    contact_number,
    last_donation_date,
    DATE_ADD(last_donation_date, INTERVAL 56 DAY) as eligibility_date,
    CASE
        WHEN last_donation_date IS NULL THEN 'Never donated'
        WHEN CURDATE() >= DATE_ADD(last_donation_date, INTERVAL 56 DAY) THEN 'Eligible now'
        ELSE CONCAT('Eligible on ', DATE_FORMAT(DATE_ADD(last_donation_date, INTERVAL 56 DAY), '%b %d, %Y'))
    END AS eligibility_status
FROM
    donors
WHERE
    health_status = 'Eligible';

-- ===== SAMPLE DATA INSERTS =====

-- Insert default admin user
INSERT INTO users (name, email, password, role, status) 
VALUES ('Administrator', 'lifestream@gmail.com', '$2a$10$xVfF7tH5hbaxqHUV3o8P9u6JrBnpVIxB8zJM/y3hM01jYwZCdzkGS', 'admin', 'active') 
ON DUPLICATE KEY UPDATE email = email;

-- Insert another admin user
INSERT INTO users (name, email, password, role, status)
VALUES ('Admin', 'admin@lifestream.com', '$2a$10$xVfF7tH5hbaxqHUV3o8P9u6JrBnpVIxB8zJM/y3hM01jYwZCdzkGS', 'admin', 'active')
ON DUPLICATE KEY UPDATE email = email;

-- Insert hospital user
INSERT INTO users (name, email, password, role, status)
VALUES ('City Hospital', 'hospital@example.com', '$2a$10$xVfF7tH5hbaxqHUV3o8P9u6JrBnpVIxB8zJM/y3hM01jYwZCdzkGS', 'recipient', 'active')
ON DUPLICATE KEY UPDATE email = email;

-- Insert default blood bank
INSERT INTO blood_banks (bank_name, location, contact_number, email, capacity)
VALUES ('LifeStream Blood Bank', 'Central City Hospital Campus, Medical District', '123-456-7890', 'contact@lifestream.org', 5000)
ON DUPLICATE KEY UPDATE bank_name = bank_name;

-- Insert additional blood bank
INSERT INTO blood_banks (bank_name, location, contact_number, email, capacity)
VALUES ('LIFESTREAM+ Blood Bank', 'Main St, City Center', '123-456-7890', 'contact@lifestream.com', 1000)
ON DUPLICATE KEY UPDATE bank_name = bank_name;

-- Insert sample hospital recipients
INSERT INTO recipients (organization_name, type, contact_person, contact_number, email, address, status)
VALUES 
('City General Hospital', 'Hospital', 'Dr. Smith', '(555) 123-4567', 'info@citygeneral.com', '123 Medical Center Dr, City, State 12345', 'active'),
('County Medical Center', 'Hospital', 'Dr. Johnson', '(555) 987-6543', 'contact@countymedical.org', '456 Health Blvd, County, State 67890', 'active'),
('Children\'s Hospital', 'Hospital', 'Dr. Williams', '(555) 456-7890', 'info@childrenshospital.org', '789 Pediatric Way, Metro, State 34567', 'active'),
('University Medical Center', 'Hospital', 'Dr. Brown', '(555) 234-5678', 'admin@universitymed.edu', '101 Academic Health Dr, College Town, State 45678', 'active'),
('Veterans Memorial Hospital', 'Hospital', 'Dr. Davis', '(555) 876-5432', 'info@veteransmemorial.org', '202 Veterans Way, Liberty, State 56789', 'active')
ON DUPLICATE KEY UPDATE organization_name = organization_name;

-- Insert sample donor data
INSERT INTO donors (full_name, date_of_birth, gender, blood_group, contact_number, email, address, health_status)
VALUES 
  ('John Doe', '1985-06-15', 'Male', 'A+', '123-456-7890', 'john@example.com', '123 Main St', 'Eligible'),
  ('Jane Smith', '1990-02-20', 'Female', 'O-', '098-765-4321', 'jane@example.com', '456 Oak Ave', 'Eligible'),
  ('Robert Johnson', '1978-11-30', 'Male', 'B+', '555-123-4567', 'robert@example.com', '789 Pine Dr', 'Eligible')
ON DUPLICATE KEY UPDATE full_name = full_name;

-- Initialize blood inventory with some values for each blood group
INSERT INTO blood_inventory (bank_id, blood_group, available_units)
VALUES 
  (1, 'A+', 10), (1, 'A-', 5), (1, 'B+', 8), (1, 'B-', 3),
  (1, 'AB+', 4), (1, 'AB-', 2), (1, 'O+', 15), (1, 'O-', 7)
ON DUPLICATE KEY UPDATE available_units = VALUES(available_units);

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */; 