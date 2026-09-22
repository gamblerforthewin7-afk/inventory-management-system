import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardMetrics, InventoryItem, PurchaseOrder } from '../types';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Boxes,
  Truck,
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

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<InventoryItem[]>([]);
  const [recentPOs, setRecentPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [m, alerts, pos] = await Promise.all([
          api.getDashboardMetrics(),
          api.getLowStockAlerts(),
          api.getPurchaseOrders(),
        ]);
        setMetrics(m);
        setLowStockAlerts(alerts);
        setRecentPOs(pos.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const categoryChartData = [
    { name: 'Ind Machinery', value: 45000 },
    { name: 'Electronics', value: 32000 },
    { name: 'Raw Metals', value: 28000 },
    { name: 'Safety PPE', value: 12000 },
    { name: 'Hydraulics', value: 19000 },
  ];

  const pieData = [
    { name: 'Healthy Stock', value: 6, color: '#10B981' },
    { name: 'Low Stock', value: 3, color: '#F59E0B' },
    { name: 'Out of Stock', value: 1, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Executive Dashboard</h1>
            <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800/60 text-red-400 text-[10px] font-mono font-semibold uppercase">
              Live Monitoring
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Real-time stock valuation, automated reorder alerts, and supplier fulfillment metrics.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/inventory')}
            className="px-3.5 py-2 bg-dark-card border border-dark-border hover:border-zinc-600 rounded-lg text-xs font-semibold text-text-primary transition-colors flex items-center space-x-1.5"
          >
            <Boxes className="w-3.5 h-3.5 text-zinc-400" />
            <span>Stock Adjust</span>
          </button>
          <button
            onClick={() => navigate('/purchase-orders')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-red-glow transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Inventory Valuation"
          value={`$${metrics?.totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`}
          subtitle="Calculated at current unit retail prices"
          icon={DollarSign}
          trend={{ value: '12.4%', isPositive: true }}
        />

        <StatCard
          title="Active SKUs / Products"
          value={metrics?.totalProducts || 0}
          subtitle="Cataloged across 5 categories"
          icon={Package}
        />

        <StatCard
          title="Low Stock Alerts"
          value={metrics?.lowStockAlertsCount || 0}
          subtitle="Items below reorder thresholds"
          icon={AlertTriangle}
          highlightRed={true}
        />

        <StatCard
          title="Pending Procurement Spend"
          value={`$${metrics?.monthlyProcurementSpend.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`}
          subtitle={`${metrics?.pendingPOsCount || 0} POs awaiting delivery`}
          icon={ShoppingCart}
        />
      </div>

      {/* Charts & Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Valuation Bar Chart */}
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-5 shadow-dark-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>Inventory Valuation by Category</span>
              </h3>
              <p className="text-xs text-text-muted">Breakdown of asset capitalization ($ USD)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" stroke="#71717A" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Valuation']}
                />
                <Bar dataKey="value" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Health Donut Chart */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-dark-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Stock Level Distribution</span>
            </h3>
            <p className="text-xs text-text-muted">Proportion of inventory status</p>

            <div className="h-44 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', color: '#FFF', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 border-t border-dark-border pt-3">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: d.color }}></span>
                  {d.name}
                </span>
                <span className="font-semibold text-text-primary">{d.value} SKUs</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Alert Feed + Recent Purchase Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Warning Feed */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-800/60 text-red-500">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">Automated Reorder Feed</h3>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center"
            >
              View Inventory <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3">
            {lowStockAlerts.length === 0 ? (
              <p className="text-xs text-text-muted py-6 text-center">No critical stock warnings.</p>
            ) : (
              lowStockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-dark-panel border border-red-950/60 rounded-lg flex items-center justify-between hover:border-red-600/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-red-400 font-bold">{alert.sku}</span>
                      <span className="text-xs font-semibold text-text-primary">{alert.productName}</span>
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Min: {alert.minStockLevel} | Bin: <span className="font-mono text-zinc-300">{alert.locationBin}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge variant={alert.quantityOnHand === 0 ? 'danger' : 'warning'}>
                      {alert.quantityOnHand} On Hand
                    </Badge>
                    <button
                      onClick={() => navigate('/purchase-orders', { state: { autoFillProduct: alert } })}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold rounded transition-colors"
                    >
                      Reorder
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Purchase Orders Table */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-dark-panel text-zinc-400">
                <Truck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">Recent Procurement Orders</h3>
            </div>
            <button
              onClick={() => navigate('/purchase-orders')}
              className="text-xs text-zinc-400 hover:text-white font-semibold flex items-center"
            >
              All Orders <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-dark-border font-medium">
                  <th className="pb-2">PO #</th>
                  <th className="pb-2">Supplier</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {recentPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-dark-panel/60">
                    <td className="py-2.5 font-mono text-red-400 font-semibold">{po.poNumber}</td>
                    <td className="py-2.5 text-zinc-200">{po.supplierName}</td>
                    <td className="py-2.5 font-semibold text-text-primary">${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5">
                      <Badge
                        variant={
                          po.status === 'received'
                            ? 'success'
                            : po.status === 'approved'
                            ? 'info'
                            : po.status === 'pending'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {po.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
