import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import './Home.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (category) q.set('category', category);
    q.set('limit', '24');
    api.get(`/products?${q}`)
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="section" style={{ paddingTop: '2rem' }}>
      <div className="container">
        <div className="section-header">
          <h2>All Products</h2>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="search"
            placeholder="Search products..."
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearchParams((p) => {
                  const n = new URLSearchParams(p);
                  if (e.target.value) n.set('search', e.target.value);
                  else n.delete('search');
                  return n;
                });
              }
            }}
            style={{
              width: '100%',
              maxWidth: 360,
              padding: '0.75rem 1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        {loading ? (
          <div className="skeleton-grid">{[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton-card" />)}</div>
        ) : products.length === 0 ? (
          <div className="empty-state"><h3>No products found</h3><p>Try a different search.</p></div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <Link to={`/products/${p.id}`} key={p.id} className="product-card">
                <div className="product-img">
                  <img src={p.imageUrl || 'https://placehold.co/400x400/1a2338/64748b?text=Velora'} alt={p.name} loading="lazy" />
                </div>
                <div className="product-info">
                  <span className="product-cat">{p.categoryName}</span>
                  <h3>{p.name}</h3>
                  <div className="product-meta">
                    <span className="product-price">${p.price.toFixed(2)}</span>
                    <span className={`stock-badge ${p.stock <= 10 ? 'low' : ''}`}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
