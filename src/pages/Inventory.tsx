import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { InventoryItem, StockLog } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  History,
  AlertTriangle,
  ShoppingCart,
  Plus,
  Minus,
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [activeTab, setActiveTab] = useState<'levels' | 'logs'>('levels');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Adjustment Form State
  const [adjustType, setAdjustType] = useState<'stock_in' | 'stock_out' | 'adjustment'>('stock_in');
  const [quantityChanged, setQuantityChanged] = useState<number>(10);
  const [reason, setReason] = useState<string>('Routine physical audit update');
  const [referenceNo, setReferenceNo] = useState<string>('');

  const loadData = async () => {
    try {
      const [inv, logs] = await Promise.all([api.getInventory(), api.getStockLogs()]);
      setInventory(inv);
      setStockLogs(logs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !user) return;

    try {
      await api.adjustStock(
        selectedItem.productId,
        user.id,
        user.fullName,
        adjustType,
        quantityChanged,
        reason,
        referenceNo || `ADJ-${Date.now().toString().slice(-4)}`
      );
      setIsAdjustModalOpen(false);
      setSelectedItem(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Stock Tracking & Auditing</h1>
          <p className="text-xs text-text-secondary mt-1">
            Real-time quantity on hand, reserved allocations, location bin tracking, and stock movement logs.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 bg-dark-card border border-dark-border p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'levels' ? 'bg-red-600 text-white shadow-red-glow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Stock Levels</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'logs' ? 'bg-red-600 text-white shadow-red-glow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Movement Audit Trail</span>
          </button>
        </div>
      </div>

      {activeTab === 'levels' ? (
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-dark-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-panel border-b border-dark-border text-zinc-400 font-medium">
                <tr>
                  <th className="p-4">SKU / Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Bin Location</th>
                  <th className="p-4">On Hand</th>
                  <th className="p-4">Reserved</th>
                  <th className="p-4">Available</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-panel/50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-red-400 font-bold">{item.sku}</div>
                      <div className="text-text-primary font-semibold text-xs mt-0.5">{item.productName}</div>
                    </td>
                    <td className="p-4 text-zinc-300">{item.categoryName}</td>
                    <td className="p-4 font-mono text-zinc-400">{item.locationBin}</td>
                    <td className="p-4 font-bold text-text-primary text-sm">{item.quantityOnHand}</td>
                    <td className="p-4 text-zinc-400">{item.quantityReserved}</td>
                    <td className="p-4 text-emerald-400 font-semibold">{item.quantityAvailable}</td>
                    <td className="p-4">
                      <Badge variant={item.stockStatus === 'OUT_OF_STOCK' ? 'danger' : item.stockStatus === 'LOW_STOCK' ? 'warning' : 'success'}>
                        {item.stockStatus.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setAdjustType('stock_in');
                            setQuantityChanged(10);
                            setIsAdjustModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-dark-panel border border-dark-border hover:border-red-600/60 text-zinc-300 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3 h-3 text-red-400" />
                          <span>Adjust</span>
                        </button>
                        {(item.stockStatus === 'LOW_STOCK' || item.stockStatus === 'OUT_OF_STOCK') && (
                          <button
                            onClick={() => navigate('/purchase-orders', { state: { autoFillProduct: item } })}
                            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors flex items-center space-x-1"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Reorder</span>
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
      ) : (
        /* Stock Audit Logs Table */
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-dark-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-panel border-b border-dark-border text-zinc-400 font-medium">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">SKU / Product</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Quantity Changed</th>
                  <th className="p-4">New Balance</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Reason / Ref #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {stockLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-dark-panel/50">
                    <td className="p-4 text-zinc-400 font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="font-mono text-red-400 font-bold mr-2">{log.sku}</span>
                      <span className="text-zinc-200">{log.productName}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.type === 'stock_in' || log.type === 'po_receipt'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {log.type === 'stock_in' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {log.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`p-4 font-mono font-bold ${log.quantityChanged > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                    </td>
                    <td className="p-4 font-mono text-text-primary font-semibold">{log.newQuantity}</td>
                    <td className="p-4 text-zinc-300">{log.userName}</td>
                    <td className="p-4 text-zinc-400">
                      <div>{log.reason}</div>
                      <div className="font-mono text-[10px] text-zinc-500">{log.referenceNo}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Record Stock Adjustment — ${selectedItem.sku}`}
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-dark-panel border border-dark-border rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-text-primary">{selectedItem.productName}</div>
                <div className="text-zinc-400 mt-0.5">Current Stock: <span className="font-bold text-red-400">{selectedItem.quantityOnHand}</span></div>
              </div>
              <Badge variant="neutral">Bin: {selectedItem.locationBin}</Badge>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Adjustment Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustType('stock_in')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-all flex items-center justify-center space-x-2 ${
                    adjustType === 'stock_in'
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-400 shadow-sm'
                      : 'bg-dark-base border-dark-border text-zinc-400'
                  }`}
                >
                  <Plus className="w-4 h-4 text-emerald-500" />
                  <span>Stock In (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('stock_out')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-all flex items-center justify-center space-x-2 ${
                    adjustType === 'stock_out'
                      ? 'bg-red-950/80 border-red-600 text-red-400 shadow-sm'
                      : 'bg-dark-base border-dark-border text-zinc-400'
                  }`}
                >
                  <Minus className="w-4 h-4 text-red-500" />
                  <span>Stock Out (-)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Quantity to Adjust</label>
              <input
                type="number"
                min="1"
                required
                value={quantityChanged}
                onChange={(e) => setQuantityChanged(Number(e.target.value))}
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none font-mono text-base font-bold"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Audit Reason / Justification</label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Received shipment, Damaged goods discard, Pick list dispatch"
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Reference Number (Optional)</label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. INV-9902"
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-dark-border">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 bg-dark-panel border border-dark-border rounded-lg text-xs font-semibold text-zinc-300 hover:bg-dark-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-red-glow"
              >
                Confirm Stock Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
