import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const statsRef = useRef(null);

  useEffect(() => {
    api.get('/dashboard/stats', { token })
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (data?.stats && statsRef.current) {
      const values = statsRef.current.querySelectorAll('.value');
      values.forEach((el) => {
        const target = parseInt(el.dataset.value, 10);
        gsap.fromTo(el, { textContent: 0 }, {
          textContent: target,
          duration: 1.2,
          ease: 'power2.out',
          snap: { textContent: 1 },
        });
      });
    }
  }, [data]);

  if (loading) return <div className="skeleton-grid"><div className="skeleton-card" style={{ height: 100 }} /><div className="skeleton-card" style={{ height: 100 }} /></div>;

  const s = data?.stats || {};

  return (
    <div>
      <div className="stats-grid" ref={statsRef}>
        <div className="stat-card"><div className="label">Total Products</div><div className="value" data-value={s.totalProducts || 0}>0</div></div>
        <div className="stat-card"><div className="label">Categories</div><div className="value" data-value={s.totalCategories || 0}>0</div></div>
        <div className="stat-card"><div className="label">Users</div><div className="value" data-value={s.totalUsers || 0}>0</div></div>
        <div className="stat-card"><div className="label">Low Stock</div><div className="value" data-value={s.lowStockProducts || 0}>0</div></div>
        <div className="stat-card"><div className="label">Featured</div><div className="value" data-value={s.featuredProducts || 0}>0</div></div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/admin/products/add" className="btn-primary">+ Add Product</Link>
        <Link to="/admin/categories/add" className="btn-secondary">+ Add Category</Link>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Recent Products</h3>
      {data?.recentProducts?.length ? (
        <table className="admin-table">
          <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
          <tbody>
            {data.recentProducts.map((p) => (
              <tr key={p.id}>
                <td><img src={p.imageUrl || 'https://placehold.co/40'} alt="" /></td>
                <td>{p.name}</td>
                <td>{p.categoryName}</td>
                <td>${p.price?.toFixed(2)}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p style={{ color: 'var(--text-muted)' }}>No products yet.</p>}
    </div>
  );
}
