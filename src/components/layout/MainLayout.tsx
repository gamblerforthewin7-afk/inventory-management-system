import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { api } from '../../services/api';
import { InventoryItem } from '../../types';
import { AlertTriangle, ArrowRight, ShoppingCart } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [lowStockAlerts, setLowStockAlerts] = useState<InventoryItem[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadAlerts = async () => {
    try {
      const alerts = await api.getLowStockAlerts();
      setLowStockAlerts(alerts);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-dark-base text-text-primary">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          lowStockCount={lowStockAlerts.length}
          onOpenLowStockModal={() => setIsAlertModalOpen(true)}
        />

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet context={{ refreshAlerts: loadAlerts }} />
        </main>
      </div>

      {/* Low Stock Alerts Modal */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={`Automated Reorder Alerts (${lowStockAlerts.length})`}
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center space-x-3 text-red-300 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 animate-bounce" />
            <p>
              The following inventory items have dropped below their minimum safety thresholds and require immediate reorder from suppliers.
            </p>
          </div>

          <div className="divide-y divide-dark-border max-h-96 overflow-y-auto pr-1">
            {lowStockAlerts.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">All inventory stock levels are healthy.</p>
            ) : (
              lowStockAlerts.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-red-400">{item.sku}</span>
                      <span className="text-sm font-semibold text-text-primary">{item.productName}</span>
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">
                      Supplier: <span className="text-zinc-300">{item.supplierName}</span> | Location: <span className="font-mono">{item.locationBin}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-zinc-400">Stock:</span>
                      <Badge variant={item.quantityOnHand === 0 ? 'danger' : 'warning'}>
                        {item.quantityOnHand} / {item.minStockLevel} Min
                      </Badge>
                    </div>
                    <button
                      onClick={() => {
                        setIsAlertModalOpen(false);
                        navigate('/purchase-orders', { state: { autoFillProduct: item } });
                      }}
                      className="mt-1 text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center ml-auto"
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Create PO <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
