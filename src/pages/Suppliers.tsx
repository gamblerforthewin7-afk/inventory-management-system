import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Supplier, Product } from '../types';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Plus,
  Mail,
  Phone,
  Clock,
  Star,
  Building,
  Package,
  MapPin,
} from 'lucide-react';

export const Suppliers: React.FC = () => {
  const { hasRole } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    leadTimeDays: 7,
    rating: 5.0,
  });

  const loadData = async () => {
    try {
      const [sups, prods] = await Promise.all([api.getSuppliers(), api.getProducts()]);
      setSuppliers(sups);
      setProducts(prods);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addSupplier({
        ...formData,
        code: formData.code || `SUP-${Date.now().toString().slice(-4)}`,
        status: 'active',
      });
      setIsAddModalOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setFormData({
      code: `SUP-${Date.now().toString().slice(-4)}`,
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      leadTimeDays: 7,
      rating: 4.8,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Supplier Directory</h1>
          <p className="text-xs text-text-secondary mt-1">
            Vendor profiles, delivery lead times, reliability ratings, and procurement contacts.
          </p>
        </div>

        {hasRole(['admin', 'manager']) && (
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-red-glow transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        )}
      </div>

      {/* Supplier Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((sup) => {
          const supProducts = products.filter((p) => p.supplierId === sup.id);
          return (
            <div
              key={sup.id}
              className="bg-dark-card border border-dark-border hover:border-zinc-700 rounded-xl p-5 shadow-dark-card flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-red-400 uppercase tracking-wider">{sup.code}</span>
                    <h3 className="text-base font-bold text-text-primary mt-0.5">{sup.companyName}</h3>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-400 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{sup.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Info Fields */}
                <div className="space-y-2 text-xs text-zinc-300 mb-4">
                  <div className="flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Contact: <strong className="text-text-primary">{sup.contactPerson}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <a href={`mailto:${sup.email}`} className="text-zinc-300 hover:text-red-400 transition-colors">{sup.email}</a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="truncate">{sup.address}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Metrics */}
              <div className="pt-3 border-t border-dark-border flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span>Lead Time: <strong className="text-text-primary">{sup.leadTimeDays} days</strong></span>
                </div>

                <button
                  onClick={() => setSelectedSupplier(sup)}
                  className="px-2.5 py-1 rounded bg-dark-panel border border-dark-border hover:border-red-600/60 text-zinc-300 hover:text-white font-semibold transition-colors flex items-center space-x-1"
                >
                  <Package className="w-3 h-3 text-red-400" />
                  <span>{supProducts.length} Products</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Vendor Supplier"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Supplier Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. SUP-1005"
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Company Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Acme Industrial Supplies"
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Contact Person</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Jane Doe"
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. orders@acme.com"
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.leadTimeDays}
                onChange={(e) => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full physical facility address..."
              className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-dark-border">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-dark-panel border border-dark-border rounded-lg text-xs font-semibold text-zinc-300 hover:bg-dark-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-red-glow"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier Products List Modal */}
      {selectedSupplier && (
        <Modal
          isOpen={!!selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          title={`Products Supplied by ${selectedSupplier.companyName}`}
        >
          <div className="space-y-3 text-xs">
            {products.filter((p) => p.supplierId === selectedSupplier.id).length === 0 ? (
              <p className="text-zinc-500 py-4 text-center">No catalog items assigned to this supplier yet.</p>
            ) : (
              products
                .filter((p) => p.supplierId === selectedSupplier.id)
                .map((p) => (
                  <div key={p.id} className="p-3 bg-dark-panel border border-dark-border rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-mono text-red-400 font-bold mr-2">{p.sku}</span>
                      <span className="font-semibold text-text-primary">{p.name}</span>
                    </div>
                    <span className="font-mono font-bold text-zinc-300">${p.costPrice.toFixed(2)}</span>
                  </div>
                ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
