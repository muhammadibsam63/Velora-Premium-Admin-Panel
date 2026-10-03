import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminAddProduct() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', categoryId: '', stock: '0', sku: '', brand: '', status: 'active', featured: false, imageUrl: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get('/categories').then((d) => setCategories(d.categories || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      await api.postForm('/products', fd, { token });
      toast.success('Product created');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Add Product</h2>
      <form className="form-admin" onSubmit={handleSubmit}>
        <label>Name *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label>Description</label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label>Price *</label>
        <input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <label>Category</label>
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          <option value="">Select</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label>Stock</label>
        <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <label>SKU</label>
        <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        <label>Brand</label>
        <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        <label>Status</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
        <label><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
        <label>Image URL</label>
        <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
        <label>Or upload image</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Product'}</button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
