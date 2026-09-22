import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Category, Product, Supplier } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  Boxes,
  Eye,
} from 'lucide-react';

export const Products: React.FC = () => {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: 1,
    supplierId: 1,
    costPrice: 0,
    unitPrice: 0,
    minStockLevel: 10,
    reorderQuantity: 50,
    unitOfMeasure: 'Units',
    locationBin: 'A-01',
    quantityOnHand: 0,
  });

  const loadData = async () => {
    try {
      const [prods, cats, sups] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSuppliers(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setSuppliers(sups);
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
      const cat = categories.find((c) => c.id === Number(formData.categoryId));
      const sup = suppliers.find((s) => s.id === Number(formData.supplierId));

      await api.addProduct({
        ...formData,
        categoryId: Number(formData.categoryId),
        categoryName: cat?.name || 'Uncategorized',
        supplierId: Number(formData.supplierId),
        supplierName: sup?.companyName || 'Supplier',
        costPrice: Number(formData.costPrice),
        unitPrice: Number(formData.unitPrice),
        minStockLevel: Number(formData.minStockLevel),
        reorderQuantity: Number(formData.reorderQuantity),
        status: 'active',
      });
      setIsAddModalOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.deleteProduct(id);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      sku: `PROD-${Date.now().toString().slice(-4)}`,
      name: '',
      description: '',
      categoryId: categories[0]?.id || 1,
      supplierId: suppliers[0]?.id || 1,
      costPrice: 0,
      unitPrice: 0,
      minStockLevel: 10,
      reorderQuantity: 50,
      unitOfMeasure: 'Units',
      locationBin: 'A-01',
      quantityOnHand: 10,
    });
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || p.categoryId.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Product Master Catalog</h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage SKUs, unit costs, selling prices, location bins, and minimum stock rules.
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
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by SKU or Product Name..."
            className="w-full bg-dark-panel border border-dark-border rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-dark-panel border border-dark-border px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-text-primary font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-dark-card">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-dark-card">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-dark-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-panel border-b border-dark-border text-zinc-400 font-medium">
              <tr>
                <th className="p-4">SKU / Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Location Bin</th>
                <th className="p-4">Cost Price</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-text-muted">
                    No products match your search query.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const qty = prod.quantityOnHand || 0;
                  const isLow = qty <= prod.minStockLevel;
                  return (
                    <tr key={prod.id} className="hover:bg-dark-panel/50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono text-red-400 font-bold">{prod.sku}</div>
                        <div className="text-text-primary font-semibold text-xs mt-0.5">{prod.name}</div>
                      </td>
                      <td className="p-4 text-zinc-300">{prod.categoryName}</td>
                      <td className="p-4 text-zinc-300">{prod.supplierName}</td>
                      <td className="p-4 font-mono text-zinc-400">{prod.locationBin}</td>
                      <td className="p-4 text-zinc-300">${prod.costPrice.toFixed(2)}</td>
                      <td className="p-4 font-bold text-text-primary">${prod.unitPrice.toFixed(2)}</td>
                      <td className="p-4">
                        <Badge variant={qty === 0 ? 'danger' : isLow ? 'warning' : 'success'}>
                          {qty} {prod.unitOfMeasure}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedProduct(prod)}
                            className="p-1.5 rounded bg-dark-panel hover:bg-zinc-700 text-zinc-300 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {hasRole(['admin', 'manager']) && (
                            <button
                              onClick={() => handleDelete(prod.id)}
                              className="p-1.5 rounded bg-dark-panel hover:bg-red-950 text-red-400 border border-red-900/50 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Catalog Product"
        maxWidth="xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">SKU Number</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. PROD-IND-99"
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Servo Motor Drive 5kW"
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Primary Supplier</label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: Number(e.target.value) })}
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Selling Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Location Bin</label>
              <input
                type="text"
                value={formData.locationBin}
                onChange={(e) => setFormData({ ...formData, locationBin: e.target.value })}
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Min Stock Threshold</label>
              <input
                type="number"
                required
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Initial Stock Count</label>
              <input
                type="number"
                required
                value={formData.quantityOnHand}
                onChange={(e) => setFormData({ ...formData, quantityOnHand: Number(e.target.value) })}
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
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
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Product Specs — ${selectedProduct.sku}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <div className="text-zinc-400">Product Title</div>
              <div className="text-base font-bold text-text-primary">{selectedProduct.name}</div>
            </div>
            <div className="p-3 bg-dark-panel border border-dark-border rounded-lg text-zinc-300">
              {selectedProduct.description || 'No detailed technical specification description.'}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-dark-base border border-dark-border rounded-lg">
                <span className="text-zinc-400">Cost Price:</span>
                <span className="font-semibold text-text-primary ml-2">${selectedProduct.costPrice.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-dark-base border border-dark-border rounded-lg">
                <span className="text-zinc-400">Retail Price:</span>
                <span className="font-bold text-red-400 ml-2">${selectedProduct.unitPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-dark-base border border-dark-border rounded-lg">
                <span className="text-zinc-400">Min Safety Level:</span>
                <span className="font-mono text-text-primary ml-2">{selectedProduct.minStockLevel}</span>
              </div>
              <div className="p-3 bg-dark-base border border-dark-border rounded-lg">
                <span className="text-zinc-400">Location Bin:</span>
                <span className="font-mono text-zinc-200 ml-2">{selectedProduct.locationBin}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
