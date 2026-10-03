import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import './Home.css';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section" style={{ paddingTop: '2rem' }}>
      <div className="container">
        <div className="section-header"><h2>Categories</h2></div>
        {loading ? (
          <div className="skeleton-grid">{[1,2,3].map((i) => <div key={i} className="skeleton-card" style={{ height: 120 }} />)}</div>
        ) : categories.length === 0 ? (
          <div className="empty-state"><h3>No categories</h3></div>
        ) : (
          <div className="product-grid">
            {categories.map((c) => (
              <Link key={c.id} to={`/products?category=${c.slug}`} className="product-card" style={{ padding: '1.5rem' }}>
                <h3>{c.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{c.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
