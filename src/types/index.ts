export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  status: 'active' | 'inactive';
}

export interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface Supplier {
  id: number;
  code: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  leadTimeDays: number;
  rating: number;
  status: 'active' | 'inactive';
  productCount?: number;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  supplierId: number;
  supplierName?: string;
  costPrice: number;
  unitPrice: number;
  minStockLevel: number;
  reorderQuantity: number;
  unitOfMeasure: string;
  locationBin: string;
  status: 'active' | 'discontinued';
  quantityOnHand?: number;
}

export interface InventoryItem {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  categoryName: string;
  supplierName: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  minStockLevel: number;
  reorderQuantity: number;
  stockStatus: 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lastStockTake: string;
  locationBin: string;
}

export interface OrderDetail {
  id?: number;
  poId?: number;
  productId: number;
  sku?: string;
  productName?: string;
  quantityOrdered: number;
  quantityReceived?: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  createdByUserId: number;
  createdByName: string;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate: string;
  receivedDate?: string;
  totalAmount: number;
  notes: string;
  details: OrderDetail[];
}

export interface StockLog {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  userId: number;
  userName: string;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'po_receipt';
  quantityChanged: number;
  newQuantity: number;
  reason: string;
  referenceNo: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalInventoryValue: number;
  totalProducts: number;
  lowStockAlertsCount: number;
  pendingPOsCount: number;
  monthlyProcurementSpend: number;
}
