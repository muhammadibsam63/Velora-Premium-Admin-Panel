import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminEditCategory() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    api.get(`/categories/${id}`)
      .then((d) => {
        const c = d.category;
        setForm({
          name: c.name || '',
          description: c.description || '',
          slug: c.slug || '',
          status: c.status || 'active',
          featured: c.featured || false,
          imageUrl: c.imageUrl || '',
        });
      })
      .catch(() => toast.error('Failed to load'));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/categories/${id}`, form, { token });
      toast.success('Category updated');
      navigate('/admin/categories');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <p>Loading...</p>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Edit Category</h2>
      <form className="form-admin" onSubmit={handleSubmit}>
        <label>Name *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label>Description</label>
        <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label>Slug</label>
        <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <label>Image URL</label>
        <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <label>Status</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <label><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/categories')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
