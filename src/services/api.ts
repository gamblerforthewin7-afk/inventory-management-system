import { Category, InventoryItem, Product, PurchaseOrder, StockLog, Supplier, User, DashboardMetrics } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_PURCHASE_ORDERS, INITIAL_STOCK_LOGS, INITIAL_SUPPLIERS, INITIAL_USERS } from './mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'apex_ims_products',
  SUPPLIERS: 'apex_ims_suppliers',
  PURCHASE_ORDERS: 'apex_ims_purchase_orders',
  STOCK_LOGS: 'apex_ims_stock_logs',
  USERS: 'apex_ims_users',
  CATEGORIES: 'apex_ims_categories',
};

// Helper to initialize local storage for stateful Demo Mode
const getStored = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

// Seed storage if empty
export const initializeDemoStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    setStored(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS)) {
    setStored(STORAGE_KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.STOCK_LOGS)) {
    setStored(STORAGE_KEYS.STOCK_LOGS, INITIAL_STOCK_LOGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    setStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }
};

initializeDemoStorage();

const USE_LIVE_API = import.meta.env.VITE_USE_LIVE_API === 'true';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';

// API Service Interface & Implementation
export const api = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    if (USE_LIVE_API) {
      try {
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Live API unavailable, falling back to Demo Mode');
      }
    }
    return getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    if (USE_LIVE_API) {
      try {
        const res = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        if (res.ok) {
          const data = await res.json();
          return { ...productData, id: data.productId };
        }
      } catch (e) {}
    }
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const newProduct: Product = {
      ...productData,
      id: Date.now(),
      quantityOnHand: productData.quantityOnHand || 0,
    };
    products.unshift(newProduct);
    setStored(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
      setStored(STORAGE_KEYS.PRODUCTS, products);
      return products[index];
    }
    throw new Error('Product not found');
  },

  async deleteProduct(id: number): Promise<boolean> {
    let products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    products = products.filter((p) => p.id !== id);
    setStored(STORAGE_KEYS.PRODUCTS, products);
    return true;
  },

  // INVENTORY & STOCK TRACKING
  async getInventory(): Promise<InventoryItem[]> {
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return products.map((p) => {
      const qty = p.quantityOnHand || 0;
      let stockStatus: 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'NORMAL';
      if (qty === 0) stockStatus = 'OUT_OF_STOCK';
      else if (qty <= p.minStockLevel) stockStatus = 'LOW_STOCK';

      return {
        id: p.id,
        productId: p.id,
        sku: p.sku,
        productName: p.name,
        categoryName: p.categoryName || 'Uncategorized',
        supplierName: p.supplierName || 'Primary Supplier',
        quantityOnHand: qty,
        quantityReserved: Math.floor(qty * 0.1),
        quantityAvailable: Math.max(0, qty - Math.floor(qty * 0.1)),
        minStockLevel: p.minStockLevel,
        reorderQuantity: p.reorderQuantity,
        stockStatus,
        lastStockTake: new Date().toISOString().split('T')[0],
        locationBin: p.locationBin || 'A-01',
      };
    });
  },

  async getLowStockAlerts(): Promise<InventoryItem[]> {
    const inventory = await this.getInventory();
    return inventory.filter((item) => item.stockStatus === 'LOW_STOCK' || item.stockStatus === 'OUT_OF_STOCK');
  },

  async adjustStock(
    productId: number,
    userId: number,
    userName: string,
    type: 'stock_in' | 'stock_out' | 'adjustment',
    quantityChanged: number,
    reason: string,
    referenceNo?: string
  ): Promise<boolean> {
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const prodIndex = products.findIndex((p) => p.id === productId);
    if (prodIndex === -1) return false;

    const currentQty = products[prodIndex].quantityOnHand || 0;
    const change = type === 'stock_out' ? -Math.abs(quantityChanged) : Math.abs(quantityChanged);
    const newQty = Math.max(0, currentQty + change);

    products[prodIndex].quantityOnHand = newQty;
    setStored(STORAGE_KEYS.PRODUCTS, products);

    // Create Audit Log
    const logs = getStored<StockLog[]>(STORAGE_KEYS.STOCK_LOGS, INITIAL_STOCK_LOGS);
    const newLog: StockLog = {
      id: Date.now(),
      productId,
      sku: products[prodIndex].sku,
      productName: products[prodIndex].name,
      userId,
      userName,
      type,
      quantityChanged: change,
      newQuantity: newQty,
      reason,
      referenceNo: referenceNo || `MANUAL-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setStored(STORAGE_KEYS.STOCK_LOGS, logs);

    return true;
  },

  async getStockLogs(): Promise<StockLog[]> {
    return getStored<StockLog[]>(STORAGE_KEYS.STOCK_LOGS, INITIAL_STOCK_LOGS);
  },

  // SUPPLIERS
  async getSuppliers(): Promise<Supplier[]> {
    return getStored<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  },

  async addSupplier(supplierData: Omit<Supplier, 'id'>): Promise<Supplier> {
    const suppliers = getStored<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now(),
      productCount: 0,
    };
    suppliers.unshift(newSupplier);
    setStored(STORAGE_KEYS.SUPPLIERS, suppliers);
    return newSupplier;
  },

  // PURCHASE ORDERS
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return getStored<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS);
  },

  async createPurchaseOrder(
    poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'totalAmount'> & { items: { productId: number; quantity: number; unitCost: number }[] }
  ): Promise<PurchaseOrder> {
    const pos = getStored<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS);
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);

    const details = poData.items.map((item, idx) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        id: Date.now() + idx,
        productId: item.productId,
        sku: prod?.sku || 'N/A',
        productName: prod?.name || 'Item',
        quantityOrdered: item.quantity,
        quantityReceived: 0,
        unitCost: item.unitCost,
        lineTotal: item.quantity * item.unitCost,
      };
    });

    const totalAmount = details.reduce((sum, d) => sum + d.lineTotal, 0);

    const newPO: PurchaseOrder = {
      id: Date.now(),
      poNumber: `PO-${new Date().getFullYear()}-${(pos.length + 1).toString().padStart(3, '0')}`,
      supplierId: poData.supplierId,
      supplierName: poData.supplierName,
      createdByUserId: poData.createdByUserId,
      createdByName: poData.createdByName,
      status: 'pending',
      orderDate: poData.orderDate,
      expectedDeliveryDate: poData.expectedDeliveryDate,
      totalAmount,
      notes: poData.notes || '',
      details,
    };

    pos.unshift(newPO);
    setStored(STORAGE_KEYS.PURCHASE_ORDERS, pos);
    return newPO;
  },

  async updatePOStatus(poId: number, status: PurchaseOrder['status']): Promise<boolean> {
    const pos = getStored<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS);
    const poIndex = pos.findIndex((p) => p.id === poId);
    if (poIndex === -1) return false;

    pos[poIndex].status = status;
    setStored(STORAGE_KEYS.PURCHASE_ORDERS, pos);
    return true;
  },

  async receivePO(poId: number, userId: number, userName: string): Promise<boolean> {
    const pos = getStored<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS);
    const poIndex = pos.findIndex((p) => p.id === poId);
    if (poIndex === -1) return false;

    const po = pos[poIndex];
    if (po.status === 'received') return true;

    // Receive all items & increment inventory stock
    for (const item of po.details) {
      await this.adjustStock(
        item.productId,
        userId,
        userName,
        'stock_in',
        item.quantityOrdered,
        `Received Purchase Order ${po.poNumber}`,
        po.poNumber
      );
      item.quantityReceived = item.quantityOrdered;
    }

    po.status = 'received';
    po.receivedDate = new Date().toISOString().split('T')[0];
    setStored(STORAGE_KEYS.PURCHASE_ORDERS, pos);

    return true;
  },

  // USERS (ADMIN)
  async getUsers(): Promise<User[]> {
    return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  async updateUserRole(userId: number, role: User['role']): Promise<boolean> {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const uIdx = users.findIndex((u) => u.id === userId);
    if (uIdx !== -1) {
      users[uIdx].role = role;
      setStored(STORAGE_KEYS.USERS, users);
      return true;
    }
    return false;
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    return getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  // METRICS & ANALYTICS
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const products = await this.getProducts();
    const inventory = await this.getInventory();
    const pos = await this.getPurchaseOrders();

    const totalInventoryValue = inventory.reduce((sum, item) => {
      const prod = products.find((p) => p.id === item.productId);
      return sum + item.quantityOnHand * (prod?.unitPrice || 0);
    }, 0);

    const lowStockAlertsCount = inventory.filter(
      (item) => item.stockStatus === 'LOW_STOCK' || item.stockStatus === 'OUT_OF_STOCK'
    ).length;

    const pendingPOsCount = pos.filter((po) => po.status === 'pending' || po.status === 'approved').length;

    const monthlyProcurementSpend = pos
      .filter((po) => po.status === 'received' || po.status === 'approved')
      .reduce((sum, po) => sum + po.totalAmount, 0);

    return {
      totalInventoryValue,
      totalProducts: products.length,
      lowStockAlertsCount,
      pendingPOsCount,
      monthlyProcurementSpend,
    };
  },
};
