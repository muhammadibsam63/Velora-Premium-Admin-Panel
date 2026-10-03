import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminEditProduct() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}`),
      api.get('/categories'),
    ]).then(([p, c]) => {
      const prod = p.product;
      setForm({
        name: prod.name || '',
        description: prod.description || '',
        price: prod.price || '',
        categoryId: prod.categoryId || '',
        stock: prod.stock ?? 0,
        sku: prod.sku || '',
        brand: prod.brand || '',
        status: prod.status || 'active',
        featured: prod.featured || false,
        imageUrl: prod.imageUrl || '',
      });
      setCategories(c.categories || []);
    }).catch(() => toast.error('Failed to load'));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      await api.putForm(`/products/${id}`, fd, { token });
      toast.success('Product updated');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <p>Loading...</p>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Edit Product</h2>
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
        <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <label>Or upload new image</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        {form.imageUrl && <img src={form.imageUrl} alt="" style={{ maxWidth: 120, marginBottom: 12, borderRadius: 8 }} />}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
