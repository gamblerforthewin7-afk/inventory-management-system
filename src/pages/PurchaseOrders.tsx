import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { Product, PurchaseOrder, Supplier } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  Plus,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Trash2,
  PackageCheck,
  Building,
  Calendar,
} from 'lucide-react';

export const PurchaseOrders: React.FC = () => {
  const { user, hasRole } = useAuth();
  const location = useLocation();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // PO Creation Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(1);
  const [expectedDate, setExpectedDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [lineItems, setLineItems] = useState<
    { productId: number; quantity: number; unitCost: number }[]
  >([
    { productId: 1, quantity: 10, unitCost: 450.00 }
  ]);

  const loadData = async () => {
    try {
      const [pos, sups, prods] = await Promise.all([
        api.getPurchaseOrders(),
        api.getSuppliers(),
        api.getProducts(),
      ]);
      setPurchaseOrders(pos);
      setSuppliers(sups);
      setProducts(prods);

      // Handle autofill state from location state (Low Stock Reorder)
      if (location.state?.autoFillProduct) {
        const autoProd: Product = location.state.autoFillProduct;
        setSelectedSupplierId(autoProd.supplierId);
        setLineItems([
          {
            productId: autoProd.id,
            quantity: autoProd.reorderQuantity || 20,
            unitCost: autoProd.costPrice,
          },
        ]);
        setIsCreateModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [location.state]);

  const handleAddLineItem = () => {
    if (products.length > 0) {
      setLineItems([
        ...lineItems,
        { productId: products[0].id, quantity: 5, unitCost: products[0].costPrice },
      ]);
    }
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    if (field === 'productId') {
      const pId = Number(value);
      const prod = products.find((p) => p.id === pId);
      updated[index] = {
        productId: pId,
        quantity: updated[index].quantity,
        unitCost: prod ? prod.costPrice : 0,
      };
    } else {
      updated[index] = { ...updated[index], [field]: Number(value) };
    }
    setLineItems(updated);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const sup = suppliers.find((s) => s.id === Number(selectedSupplierId));
      await api.createPurchaseOrder({
        supplierId: Number(selectedSupplierId),
        supplierName: sup?.companyName || 'Supplier',
        createdByUserId: user.id,
        createdByName: user.fullName,
        status: 'pending',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: expectedDate,
        notes,
        details: [],
        items: lineItems,
      });

      setIsCreateModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (poId: number, status: PurchaseOrder['status']) => {
    if (!user) return;
    if (status === 'received') {
      if (confirm('Receiving this PO will automatically update product stock levels in the warehouse. Proceed?')) {
        await api.receivePO(poId, user.id, user.fullName);
        loadData();
      }
    } else {
      await api.updatePOStatus(poId, status);
      loadData();
    }
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Purchase Orders & Procurement</h1>
          <p className="text-xs text-text-secondary mt-1">
            Generate PO headers, assign order line items, manage vendor approvals, and receive stock.
          </p>
        </div>

        {hasRole(['admin', 'manager']) && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-red-glow transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        )}
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-dark-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-panel border-b border-dark-border text-zinc-400 font-medium">
              <tr>
                <th className="p-4">PO Number</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Order Date</th>
                <th className="p-4">Expected Delivery</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Created By</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-dark-panel/50 transition-colors">
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedPO(po)}
                      className="font-mono text-red-400 font-bold hover:underline"
                    >
                      {po.poNumber}
                    </button>
                  </td>
                  <td className="p-4 font-semibold text-text-primary">{po.supplierName}</td>
                  <td className="p-4 text-zinc-400 font-mono">{po.orderDate}</td>
                  <td className="p-4 text-zinc-400 font-mono">{po.expectedDeliveryDate}</td>
                  <td className="p-4 font-bold text-text-primary">${po.totalAmount.toFixed(2)}</td>
                  <td className="p-4 text-zinc-300">{po.createdByName}</td>
                  <td className="p-4">
                    <Badge
                      variant={
                        po.status === 'received'
                          ? 'success'
                          : po.status === 'approved'
                          ? 'info'
                          : po.status === 'pending'
                          ? 'warning'
                          : po.status === 'cancelled'
                          ? 'danger'
                          : 'neutral'
                      }
                    >
                      {po.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedPO(po)}
                        className="p-1.5 rounded bg-dark-panel border border-dark-border hover:border-zinc-600 text-zinc-300 transition-colors"
                        title="View Line Items"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {po.status === 'pending' && hasRole(['admin', 'manager']) && (
                        <button
                          onClick={() => handleStatusChange(po.id, 'approved')}
                          className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-900 transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      )}

                      {po.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(po.id, 'received')}
                          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold shadow-red-glow transition-all flex items-center space-x-1"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Receive PO</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate New Purchase Order"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Select Supplier</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName} (Lead Time: {s.leadTimeDays}d)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Expected Delivery Date</label>
              <input
                type="date"
                required
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
          </div>

          {/* Line Items Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-text-primary">Order Line Items (OrderDetails Entity)</span>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {lineItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-dark-panel border border-dark-border rounded-lg grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-6">
                    <label className="block text-[10px] text-zinc-500 mb-0.5">Product Item</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      className="w-full bg-dark-base border border-dark-border rounded px-2 py-1 text-xs text-text-primary focus:border-red-600 outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] text-zinc-500 mb-0.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full bg-dark-base border border-dark-border rounded px-2 py-1 text-xs text-text-primary font-mono focus:border-red-600 outline-none"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] text-zinc-500 mb-0.5">Unit Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                      className="w-full bg-dark-base border border-dark-border rounded px-2 py-1 text-xs text-text-primary font-mono focus:border-red-600 outline-none"
                    />
                  </div>

                  <div className="col-span-1 text-right pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Notes & Special Instructions</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Expedited freight shipping required..."
              className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
            />
          </div>

          <div className="p-3 bg-dark-base border border-dark-border rounded-lg flex items-center justify-between">
            <span className="text-zinc-400 font-medium">Total Calculated PO Cost:</span>
            <span className="text-lg font-bold text-red-400">${calculateTotal().toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-dark-border">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-dark-panel border border-dark-border rounded-lg text-xs font-semibold text-zinc-300 hover:bg-dark-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-red-glow"
            >
              Issue Purchase Order
            </button>
          </div>
        </form>
      </Modal>

      {/* PO View Detail Modal */}
      {selectedPO && (
        <Modal
          isOpen={!!selectedPO}
          onClose={() => setSelectedPO(null)}
          title={`Purchase Order Invoice — ${selectedPO.poNumber}`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 bg-dark-panel border border-dark-border rounded-xl">
              <div>
                <div className="text-zinc-400">Supplier:</div>
                <div className="text-sm font-bold text-text-primary">{selectedPO.supplierName}</div>
                <div className="text-zinc-500 mt-1">Order Date: {selectedPO.orderDate}</div>
              </div>
              <div className="text-right">
                <div className="text-zinc-400">Total PO Value:</div>
                <div className="text-lg font-bold text-red-400">${selectedPO.totalAmount.toFixed(2)}</div>
                <Badge variant={selectedPO.status === 'received' ? 'success' : 'warning'}>
                  {selectedPO.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div>
              <div className="font-semibold text-text-primary mb-2">Line Items Breakdown</div>
              <div className="border border-dark-border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-dark-panel border-b border-dark-border text-zinc-400">
                    <tr>
                      <th className="p-2.5">SKU / Product</th>
                      <th className="p-2.5">Qty</th>
                      <th className="p-2.5">Unit Cost</th>
                      <th className="p-2.5 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {selectedPO.details?.map((d) => (
                      <tr key={d.id}>
                        <td className="p-2.5">
                          <span className="font-mono text-red-400 font-bold mr-2">{d.sku}</span>
                          <span className="text-zinc-200">{d.productName}</span>
                        </td>
                        <td className="p-2.5 font-mono">{d.quantityOrdered}</td>
                        <td className="p-2.5 font-mono">${d.unitCost.toFixed(2)}</td>
                        <td className="p-2.5 font-mono font-bold text-right text-text-primary">${d.lineTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
