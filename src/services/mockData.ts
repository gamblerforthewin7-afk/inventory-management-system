import { Category, InventoryItem, Product, PurchaseOrder, StockLog, Supplier, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@inventory.com',
    fullName: 'Alexander Vance',
    role: 'admin',
    department: 'Executive Operations',
    status: 'active'
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@inventory.com',
    fullName: 'Marcus Holloway',
    role: 'manager',
    department: 'Procurement & Logistics',
    status: 'active'
  },
  {
    id: 3,
    username: 'staff',
    email: 'staff@inventory.com',
    fullName: 'Elena Rostova',
    role: 'staff',
    department: 'Warehouse Floor',
    status: 'active'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Industrial Machinery', code: 'IND-MACH', description: 'Heavy hardware, motors, CNC modules, and robotics.' },
  { id: 2, name: 'Electronic Components', code: 'ELEC-COMP', description: 'Microcontrollers, ICs, sensors, and relays.' },
  { id: 3, name: 'Raw Materials & Metals', code: 'RAW-MAT', description: 'Aluminum extrusions, titanium alloy sheets, copper wiring.' },
  { id: 4, name: 'Safety & PPE', code: 'SAFE-PPE', description: 'Industrial helmets, cut gloves, respirators.' },
  { id: 5, name: 'Hydraulics & Pneumatics', code: 'HYD-PNEU', description: 'High-pressure hoses, valves, pneumatic actuators.' }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 1,
    code: 'SUP-1001',
    companyName: 'Vortex Industrial Dynamics',
    contactPerson: 'Sarah Jenkins',
    email: 'orders@vortexindustrial.com',
    phone: '+1 (555) 019-2831',
    address: '450 Industrial Parkway, Sector 7, Chicago, IL',
    leadTimeDays: 5,
    rating: 4.85,
    status: 'active',
    productCount: 3
  },
  {
    id: 2,
    code: 'SUP-1002',
    companyName: 'Titanium Tech Solutions',
    contactPerson: 'David Zhang',
    email: 'procurement@titaniumtech.io',
    phone: '+1 (555) 084-9912',
    address: '120 Silicon Ave, Suite 300, San Jose, CA',
    leadTimeDays: 3,
    rating: 4.90,
    status: 'active',
    productCount: 2
  },
  {
    id: 3,
    code: 'SUP-1003',
    companyName: 'AeroMat Global Supplies',
    contactPerson: 'Klaus Weber',
    email: 'sales@aeromatglobal.de',
    phone: '+49 30 901820',
    address: 'Industriestrasse 14, Stuttgart, Germany',
    leadTimeDays: 12,
    rating: 4.60,
    status: 'active',
    productCount: 2
  },
  {
    id: 4,
    code: 'SUP-1004',
    companyName: 'Apex Safety Systems',
    contactPerson: 'Rachel Adams',
    email: 'info@apexsafety.com',
    phone: '+1 (555) 431-7788',
    address: '88 Sentinel Blvd, Houston, TX',
    leadTimeDays: 4,
    rating: 4.75,
    status: 'active',
    productCount: 2
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    sku: 'PROD-IND-001',
    name: 'Servo Motor Drive 5kW',
    description: 'High-torque brushless AC servo motor for automated assembly arms.',
    categoryId: 1,
    categoryName: 'Industrial Machinery',
    supplierId: 1,
    supplierName: 'Vortex Industrial Dynamics',
    costPrice: 450.00,
    unitPrice: 780.00,
    minStockLevel: 15,
    reorderQuantity: 30,
    unitOfMeasure: 'Units',
    locationBin: 'A-12-04',
    status: 'active',
    quantityOnHand: 18
  },
  {
    id: 2,
    sku: 'PROD-IND-002',
    name: 'CNC Spindle Assembly 24k RPM',
    description: 'Water-cooled high precision CNC milling spindle motor.',
    categoryId: 1,
    categoryName: 'Industrial Machinery',
    supplierId: 1,
    supplierName: 'Vortex Industrial Dynamics',
    costPrice: 1200.00,
    unitPrice: 1950.00,
    minStockLevel: 5,
    reorderQuantity: 10,
    unitOfMeasure: 'Units',
    locationBin: 'A-14-01',
    status: 'active',
    quantityOnHand: 3 // LOW STOCK
  },
  {
    id: 3,
    sku: 'PROD-ELC-101',
    name: 'Cortex-M4 Microcontroller Core',
    description: '32-bit ARM MCU with floating point unit & CAN bus controller.',
    categoryId: 2,
    categoryName: 'Electronic Components',
    supplierId: 2,
    supplierName: 'Titanium Tech Solutions',
    costPrice: 8.50,
    unitPrice: 18.00,
    minStockLevel: 100,
    reorderQuantity: 500,
    unitOfMeasure: 'Pieces',
    locationBin: 'B-03-02',
    status: 'active',
    quantityOnHand: 450
  },
  {
    id: 4,
    sku: 'PROD-ELC-102',
    name: 'Optocoupler Isolation Relay Module',
    description: 'Industrial 8-channel optical isolation module 24V DC.',
    categoryId: 2,
    categoryName: 'Electronic Components',
    supplierId: 2,
    supplierName: 'Titanium Tech Solutions',
    costPrice: 14.20,
    unitPrice: 29.99,
    minStockLevel: 40,
    reorderQuantity: 100,
    unitOfMeasure: 'Pieces',
    locationBin: 'B-05-11',
    status: 'active',
    quantityOnHand: 12 // LOW STOCK
  },
  {
    id: 5,
    sku: 'PROD-RAW-201',
    name: 'Aluminum 6061-T6 Extrusion Bar (3m)',
    description: 'Aero-grade structural aluminum extrusion profile 50x50mm.',
    categoryId: 3,
    categoryName: 'Raw Materials & Metals',
    supplierId: 3,
    supplierName: 'AeroMat Global Supplies',
    costPrice: 35.00,
    unitPrice: 65.00,
    minStockLevel: 50,
    reorderQuantity: 150,
    unitOfMeasure: 'Meters',
    locationBin: 'C-01-08',
    status: 'active',
    quantityOnHand: 110
  },
  {
    id: 6,
    sku: 'PROD-RAW-202',
    name: 'Titanium Grade 5 Sheet (2mm)',
    description: 'High-strength heat-resistant titanium alloy plate.',
    categoryId: 3,
    categoryName: 'Raw Materials & Metals',
    supplierId: 3,
    supplierName: 'AeroMat Global Supplies',
    costPrice: 210.00,
    unitPrice: 380.00,
    minStockLevel: 8,
    reorderQuantity: 20,
    unitOfMeasure: 'Sheets',
    locationBin: 'C-02-03',
    status: 'active',
    quantityOnHand: 4 // LOW STOCK
  },
  {
    id: 7,
    sku: 'PROD-SAF-301',
    name: 'Kevlar Heat-Resistant Gloves (L)',
    description: 'Level 5 cut resistance with aluminized back heat shield.',
    categoryId: 4,
    categoryName: 'Safety & PPE',
    supplierId: 4,
    supplierName: 'Apex Safety Systems',
    costPrice: 18.00,
    unitPrice: 39.50,
    minStockLevel: 25,
    reorderQuantity: 60,
    unitOfMeasure: 'Pairs',
    locationBin: 'D-01-02',
    status: 'active',
    quantityOnHand: 45
  },
  {
    id: 8,
    sku: 'PROD-SAF-302',
    name: 'ANSI Industrial Helmet with Visor',
    description: 'High-density ABS shell with anti-scratch UV face guard.',
    categoryId: 4,
    categoryName: 'Safety & PPE',
    supplierId: 4,
    supplierName: 'Apex Safety Systems',
    costPrice: 32.00,
    unitPrice: 68.00,
    minStockLevel: 30,
    reorderQuantity: 80,
    unitOfMeasure: 'Units',
    locationBin: 'D-02-05',
    status: 'active',
    quantityOnHand: 28 // CRITICAL LOW
  },
  {
    id: 9,
    sku: 'PROD-HYD-401',
    name: 'Hydraulic Solenoid Valve 350 Bar',
    description: 'Directional control valve 4-way 3-position 24V solenoid.',
    categoryId: 5,
    categoryName: 'Hydraulics & Pneumatics',
    supplierId: 1,
    supplierName: 'Vortex Industrial Dynamics',
    costPrice: 160.00,
    unitPrice: 290.00,
    minStockLevel: 12,
    reorderQuantity: 25,
    unitOfMeasure: 'Units',
    locationBin: 'E-04-01',
    status: 'active',
    quantityOnHand: 15
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 1,
    poNumber: 'PO-2026-001',
    supplierId: 1,
    supplierName: 'Vortex Industrial Dynamics',
    createdByUserId: 2,
    createdByName: 'Marcus Holloway',
    status: 'approved',
    orderDate: '2026-09-15',
    expectedDeliveryDate: '2026-09-24',
    totalAmount: 6900.00,
    notes: 'Expedited restock for CNC Spindle & Hydraulic Valves.',
    details: [
      { id: 101, poId: 1, productId: 2, sku: 'PROD-IND-002', productName: 'CNC Spindle Assembly 24k RPM', quantityOrdered: 5, quantityReceived: 0, unitCost: 1200.00, lineTotal: 6000.00 },
      { id: 102, poId: 1, productId: 9, sku: 'PROD-HYD-401', productName: 'Hydraulic Solenoid Valve 350 Bar', quantityOrdered: 5, quantityReceived: 0, unitCost: 180.00, lineTotal: 900.00 }
    ]
  },
  {
    id: 2,
    poNumber: 'PO-2026-002',
    supplierId: 2,
    supplierName: 'Titanium Tech Solutions',
    createdByUserId: 2,
    createdByName: 'Marcus Holloway',
    status: 'pending',
    orderDate: '2026-09-18',
    expectedDeliveryDate: '2026-09-25',
    totalAmount: 1420.00,
    notes: 'Routine replenishment of MCU cores and isolation relays.',
    details: [
      { id: 103, poId: 2, productId: 3, sku: 'PROD-ELC-101', productName: 'Cortex-M4 Microcontroller Core', quantityOrdered: 100, quantityReceived: 0, unitCost: 8.50, lineTotal: 850.00 },
      { id: 104, poId: 2, productId: 4, sku: 'PROD-ELC-102', productName: 'Optocoupler Isolation Relay Module', quantityOrdered: 40, quantityReceived: 0, unitCost: 14.25, lineTotal: 570.00 }
    ]
  },
  {
    id: 3,
    poNumber: 'PO-2026-003',
    supplierId: 3,
    supplierName: 'AeroMat Global Supplies',
    createdByUserId: 1,
    createdByName: 'Alexander Vance',
    status: 'received',
    orderDate: '2026-09-01',
    expectedDeliveryDate: '2026-09-12',
    receivedDate: '2026-09-12',
    totalAmount: 4200.00,
    notes: 'Titanium sheets and aluminum bar delivery verified.',
    details: [
      { id: 105, poId: 3, productId: 6, sku: 'PROD-RAW-202', productName: 'Titanium Grade 5 Sheet (2mm)', quantityOrdered: 20, quantityReceived: 20, unitCost: 210.00, lineTotal: 4200.00 }
    ]
  }
];

export const INITIAL_STOCK_LOGS: StockLog[] = [
  {
    id: 1,
    productId: 6,
    sku: 'PROD-RAW-202',
    productName: 'Titanium Grade 5 Sheet (2mm)',
    userId: 1,
    userName: 'Alexander Vance',
    type: 'po_receipt',
    quantityChanged: 20,
    newQuantity: 24,
    reason: 'Purchase Order PO-2026-003 received in full',
    referenceNo: 'PO-2026-003',
    createdAt: '2026-09-12T14:30:00Z'
  },
  {
    id: 2,
    productId: 6,
    sku: 'PROD-RAW-202',
    productName: 'Titanium Grade 5 Sheet (2mm)',
    userId: 3,
    userName: 'Elena Rostova',
    type: 'stock_out',
    quantityChanged: -20,
    newQuantity: 4,
    reason: 'Dispatch to Aerospace Production Line B',
    referenceNo: 'SO-88219',
    createdAt: '2026-09-16T09:15:00Z'
  },
  {
    id: 3,
    productId: 2,
    sku: 'PROD-IND-002',
    productName: 'CNC Spindle Assembly 24k RPM',
    userId: 3,
    userName: 'Elena Rostova',
    type: 'stock_out',
    quantityChanged: -2,
    newQuantity: 3,
    reason: 'Warranty unit replacement for Line 3',
    referenceNo: 'ADJ-10492',
    createdAt: '2026-09-19T11:45:00Z'
  },
  {
    id: 4,
    productId: 4,
    sku: 'PROD-ELC-102',
    productName: 'Optocoupler Isolation Relay Module',
    userId: 2,
    userName: 'Marcus Holloway',
    type: 'stock_out',
    quantityChanged: -28,
    newQuantity: 12,
    reason: 'Automated pick list for Control Cabinet Assembly',
    referenceNo: 'SO-88240',
    createdAt: '2026-09-21T16:00:00Z'
  }
];
