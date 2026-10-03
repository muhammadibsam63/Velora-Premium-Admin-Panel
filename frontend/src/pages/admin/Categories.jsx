import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/categories?status=active')
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`, { token });
      toast.success('Category deleted');
      load();
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2>Categories</h2>
        <Link to="/admin/categories/add" className="btn-primary">+ Add Category</Link>
      </div>
      {loading ? <p>Loading...</p> : (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Slug</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.status}</td>
                <td>{c.featured ? 'Yes' : 'No'}</td>
                <td>
                  <Link to={`/admin/categories/edit/${c.id}`} className="btn-sm btn-edit">Edit</Link>
                  <button className="btn-sm btn-delete" onClick={() => handleDelete(c.id, c.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
