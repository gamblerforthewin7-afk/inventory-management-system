import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { InventoryItem, Product, Supplier } from '../types';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import {
  BarChart3,
  Download,
  PieChart as PieIcon,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  Truck,
  DollarSign,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Reports: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    const load = async () => {
      const [p, i, s] = await Promise.all([
        api.getProducts(),
        api.getInventory(),
        api.getSuppliers(),
      ]);
      setProducts(p);
      setInventory(i);
      setSuppliers(s);
    };
    load();
  }, []);

  const totalCostValuation = inventory.reduce((sum, item) => {
    const p = products.find((prod) => prod.id === item.productId);
    return sum + item.quantityOnHand * (p?.costPrice || 0);
  }, 0);

  const totalRetailValuation = inventory.reduce((sum, item) => {
    const p = products.find((prod) => prod.id === item.productId);
    return sum + item.quantityOnHand * (p?.unitPrice || 0);
  }, 0);

  const profitMargin = totalRetailValuation - totalCostValuation;

  const handleExportCSV = () => {
    const headers = 'SKU,Product Name,Category,Quantity On Hand,Cost Price,Unit Price,Total Cost Valuation\n';
    const rows = inventory
      .map((item) => {
        const p = products.find((prod) => prod.id === item.productId);
        return `"${item.sku}","${item.productName}","${item.categoryName}",${item.quantityOnHand},${p?.costPrice || 0},${p?.unitPrice || 0},${item.quantityOnHand * (p?.costPrice || 0)}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Inventory_Valuation_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Executive Analytics & Reports</h1>
          <p className="text-xs text-text-secondary mt-1">
            Inventory valuation audits, margin analysis, and CSV export utilities.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-red-glow transition-all flex items-center space-x-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Valuation Report (CSV)</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Wholesale Asset Cost"
          value={`$${totalCostValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Capital tied in warehouse stock"
          icon={DollarSign}
        />

        <StatCard
          title="Total Retail Sales Potential"
          value={`$${totalRetailValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Gross revenue at current list price"
          icon={TrendingUp}
        />

        <StatCard
          title="Unrealized Gross Margin"
          value={`$${profitMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`Average Margin: ${((profitMargin / (totalRetailValuation || 1)) * 100).toFixed(1)}%`}
          icon={PieIcon}
          highlightRed={true}
        />
      </div>

      {/* Detailed Report Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
          <h3 className="text-sm font-bold text-text-primary flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>Asset Valuation Audit by SKU</span>
          </h3>
          <span className="text-xs font-mono text-zinc-400">{inventory.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-panel border-b border-dark-border text-zinc-400 font-medium">
              <tr>
                <th className="p-3">SKU</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Qty on Hand</th>
                <th className="p-3">Unit Cost</th>
                <th className="p-3">Wholesale Value</th>
                <th className="p-3 text-right">Retail Potential</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {inventory.map((item) => {
                const prod = products.find((p) => p.id === item.productId);
                const costVal = item.quantityOnHand * (prod?.costPrice || 0);
                const retailVal = item.quantityOnHand * (prod?.unitPrice || 0);

                return (
                  <tr key={item.id} className="hover:bg-dark-panel/50">
                    <td className="p-3 font-mono text-red-400 font-bold">{item.sku}</td>
                    <td className="p-3 font-semibold text-text-primary">{item.productName}</td>
                    <td className="p-3 text-zinc-400">{item.categoryName}</td>
                    <td className="p-3 font-bold font-mono text-zinc-200">{item.quantityOnHand}</td>
                    <td className="p-3 text-zinc-400">${(prod?.costPrice || 0).toFixed(2)}</td>
                    <td className="p-3 font-semibold text-zinc-300">${costVal.toFixed(2)}</td>
                    <td className="p-3 font-bold text-red-400 text-right">${retailVal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
