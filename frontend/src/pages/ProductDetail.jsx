import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import './Home.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((d) => setProduct(d.product))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="section container"><div className="skeleton-card" style={{ height: 400, maxWidth: 600 }} /></div>;
  if (error || !product) return (
    <div className="section container empty-state">
      <h3>Product not found</h3>
      <p>{error || 'This product does not exist.'}</p>
      <Link to="/products" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Back to products</Link>
    </div>
  );

  return (
    <div className="section" style={{ paddingTop: '2rem' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
        <div className="product-img" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <img src={product.imageUrl || 'https://placehold.co/600x600/1a2338/64748b?text=Velora'} alt={product.name} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover' }} />
        </div>
        <div>
          <span className="product-cat">{product.categoryName}</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', margin: '0.5rem 0 1rem' }}>{product.name}</h1>
          <p style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem' }}>${product.price.toFixed(2)}</p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>{product.description}</p>
          <p style={{ marginBottom: '0.5rem' }}>SKU: {product.sku || '—'}</p>
          <p style={{ marginBottom: '1.5rem' }}>
            Stock: <span className={product.stock <= 10 ? 'stock-badge low' : 'stock-badge'}>{product.stock > 0 ? product.stock : 'Out of stock'}</span>
          </p>
          {product.brand && <p style={{ marginBottom: '1.5rem' }}>Brand: {product.brand}</p>}
          <Link to="/products" className="btn-secondary">← Back to products</Link>
        </div>
      </div>
    </div>
  );
}
