-- =============================================================================
-- APEX INVENTORY MANAGEMENT SYSTEM - SEED DATA
-- Realistic initial dataset for development & database deployment
-- =============================================================================

USE inventory_db;

-- Clear existing data (in dependency order)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE stock_logs;
TRUNCATE TABLE order_details;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE inventory;
TRUNCATE TABLE products;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Seed Users
INSERT INTO users (user_id, username, email, password_hash, full_name, role, department) VALUES
(1, 'admin', 'admin@inventory.com', '$2a$12$eA8Z/71g47v4u8K8tF0L9eB6S5V5E3pG.8fH2i1kL0mN9oP8qR7sS', 'Alexander Vance', 'admin', 'Executive Ops'),
(2, 'manager', 'manager@inventory.com', '$2a$12$eA8Z/71g47v4u8K8tF0L9eB6S5V5E3pG.8fH2i1kL0mN9oP8qR7sS', 'Marcus Holloway', 'manager', 'Procurement & Logistics'),
(3, 'staff', 'staff@inventory.com', '$2a$12$eA8Z/71g47v4u8K8tF0L9eB6S5V5E3pG.8fH2i1kL0mN9oP8qR7sS', 'Elena Rostova', 'staff', 'Warehouse Floor');

-- 2. Seed Categories
INSERT INTO categories (category_id, name, code, description) VALUES
(1, 'Industrial Machinery', 'IND-MACH', 'Heavy hardware, motors, CNC modules, and precision robotics components.'),
(2, 'Electronic Components', 'ELEC-COMP', 'Microcontrollers, ICs, sensors, high-grade relays, and wiring assemblies.'),
(3, 'Raw Materials & Metals', 'RAW-MAT', 'Aluminum extrusions, titanium alloy sheets, copper wiring, and polymer stock.'),
(4, 'Safety & PPE', 'SAFE-PPE', 'Industrial helmets, heat-resistant gloves, respirators, and harness gear.'),
(5, 'Hydraulics & Pneumatics', 'HYD-PNEU', 'High-pressure hoses, hydraulic valves, pneumatic actuators, and seal rings.');

-- 3. Seed Suppliers
INSERT INTO suppliers (supplier_id, code, company_name, contact_person, email, phone, address, lead_time_days, rating) VALUES
(1, 'SUP-1001', 'Vortex Industrial Dynamics', 'Sarah Jenkins', 'orders@vortexindustrial.com', '+1 (555) 019-2831', '450 Industrial Parkway, Sector 7, Chicago, IL', 5, 4.85),
(2, 'SUP-1002', 'Titanium Tech Solutions', 'David Zhang', 'procurement@titaniumtech.io', '+1 (555) 084-9912', '120 Silicon Ave, Suite 300, San Jose, CA', 3, 4.90),
(3, 'SUP-1003', 'AeroMat Global Supplies', 'Klaus Weber', 'sales@aeromatglobal.de', '+49 30 901820', 'Industriestrasse 14, Stuttgart, Germany', 12, 4.60),
(4, 'SUP-1004', 'Apex Safety Systems', 'Rachel Adams', 'info@apexsafety.com', '+1 (555) 431-7788', '88 Sentinel Blvd, Houston, TX', 4, 4.75);

-- 4. Seed Products
INSERT INTO products (product_id, sku, name, description, category_id, supplier_id, cost_price, unit_price, min_stock_level, reorder_quantity, unit_of_measure, location_bin) VALUES
(1, 'PROD-IND-001', 'Servo Motor Drive 5kW', 'High-torque brushless AC servo motor for automated assembly arms.', 1, 1, 450.00, 780.00, 15, 30, 'Units', 'A-12-04'),
(2, 'PROD-IND-002', 'CNC Spindle Assembly 24k RPM', 'Water-cooled high precision CNC milling spindle motor.', 1, 1, 1200.00, 1950.00, 5, 10, 'Units', 'A-14-01'),
(3, 'PROD-ELC-101', 'Cortex-M4 Microcontroller Core', '32-bit ARM MCU with floating point unit & CAN bus controller.', 2, 2, 8.50, 18.00, 100, 500, 'Pieces', 'B-03-02'),
(4, 'PROD-ELC-102', 'Optocoupler Isolation Relay module', 'Industrial 8-channel optical isolation module 24V DC.', 2, 2, 14.20, 29.99, 40, 100, 'Pieces', 'B-05-11'),
(5, 'PROD-RAW-201', 'Aluminum 6061-T6 Extrusion Bar (3m)', 'Aero-grade structural aluminum extrusion profile 50x50mm.', 3, 3, 35.00, 65.00, 50, 150, 'Meters', 'C-01-08'),
(6, 'PROD-RAW-202', 'Titanium Grade 5 Sheet (2mm)', 'High-strength heat-resistant titanium alloy plate.', 3, 3, 210.00, 380.00, 8, 20, 'Sheets', 'C-02-03'),
(7, 'PROD-SAF-301', 'Kevlar Heat-Resistant Gloves (L)', 'Level 5 cut resistance with aluminized back heat shield.', 4, 4, 18.00, 39.50, 25, 60, 'Pairs', 'D-01-02'),
(8, 'PROD-SAF-302', 'ANSI Industrial Helmet with Visor', 'High-density ABS shell with anti-scratch UV face guard.', 4, 4, 32.00, 68.00, 30, 80, 'Units', 'D-02-05'),
(9, 'PROD-HYD-401', 'Hydraulic Solenoid Valve 350 Bar', 'Directional control valve 4-way 3-position 24V solenoid.', 5, 1, 160.00, 290.00, 12, 25, 'Units', 'E-04-01');

-- 5. Seed Inventory Levels (Including Low Stock and Normal Items)
INSERT INTO inventory (product_id, quantity_on_hand, quantity_reserved, last_stock_take) VALUES
(1, 18, 2, NOW()),
(2, 3, 0, NOW()),  -- Low Stock (Min: 5)
(3, 450, 50, NOW()),
(4, 12, 0, NOW()), -- Low Stock (Min: 40)
(5, 110, 10, NOW()),
(6, 4, 1, NOW()),  -- Low Stock (Min: 8)
(7, 45, 5, NOW()),
(8, 28, 2, NOW()), -- Slightly Low Stock (Min: 30)
(9, 15, 0, NOW());

-- 6. Seed Purchase Orders
INSERT INTO purchase_orders (po_id, po_number, supplier_id, created_by_user_id, status, order_date, expected_delivery_date, total_amount, notes) VALUES
(1, 'PO-2026-001', 1, 2, 'approved', '2026-09-15', '2026-09-23', 6900.00, 'Expedited restock for CNC CNC Spindle & Hydraulic Valves.'),
(2, 'PO-2026-002', 2, 2, 'pending', '2026-09-18', '2026-09-25', 1420.00, 'Routine replenishment of MCU cores and isolation relays.'),
(3, 'PO-2026-003', 3, 1, 'received', '2026-09-01', '2026-09-12', 4200.00, 'Titanium sheets and aluminum bar delivery verified.'),
(4, 'PO-2026-004', 4, 2, 'draft', '2026-09-20', '2026-09-27', 2880.00, 'Quarterly safety helmet and glove procurement.');

-- 7. Seed Order Details
INSERT INTO order_details (po_id, product_id, quantity_ordered, quantity_received, unit_cost) VALUES
(1, 2, 5, 0, 1200.00),
(1, 9, 5, 0, 180.00),
(2, 3, 100, 0, 8.50),
(2, 4, 40, 0, 14.25),
(3, 6, 20, 20, 210.00),
(4, 8, 40, 0, 32.00),
(4, 7, 40, 0, 18.00);

-- 8. Seed Stock Audit Logs
INSERT INTO stock_logs (product_id, user_id, type, quantity_changed, new_quantity, reason, reference_no) VALUES
(6, 1, 'po_receipt', 20, 24, 'Purchase Order PO-2026-003 received', 'PO-2026-003'),
(6, 3, 'stock_out', -20, 4, 'Dispatch to Aerospace Production Line B', 'SO-88219'),
(2, 3, 'stock_out', -2, 3, 'Motor unit swapped for warranty replacement', 'ADJ-10492'),
(4, 2, 'stock_out', -28, 12, 'Automated pick list for Control Cabinet Assembly', 'SO-88240');
