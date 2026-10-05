import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminAddCategory() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', slug: '', status: 'active', featured: false, imageUrl: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/categories', form, { token });
      toast.success('Category created');
      navigate('/admin/categories');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Add Category</h2>
      <form className="form-admin" onSubmit={handleSubmit}>
        <label>Name *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label>Description</label>
        <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label>Slug (optional)</label>
        <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if empty" />
        <label>Image URL</label>
        <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <label>Status</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <label><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Category'}</button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/categories')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
