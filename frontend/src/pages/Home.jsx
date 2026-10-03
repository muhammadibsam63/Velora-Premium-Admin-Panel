import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { api } from '../utils/api';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);

  useEffect(() => {
    api.get('/products?featured=true&limit=6')
      .then((d) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.6, delay: 0.2 });
      gsap.from('.hero-title span', { opacity: 0, y: 40, stagger: 0.12, duration: 0.7, delay: 0.4 });
      gsap.from('.hero-desc', { opacity: 0, y: 20, duration: 0.6, delay: 0.8 });
      gsap.from('.hero-cta', { opacity: 0, y: 15, stagger: 0.1, duration: 0.5, delay: 1 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="home">
      <section className="hero" ref={heroRef}>
        <div className="hero-bg" />
        <div className="container hero-content">
          <p className="hero-eyebrow">PREMIUM COLLECTION 2026</p>
          <h1 className="hero-title">
            <span>Elevate</span> <span>your</span> <span>space.</span>
          </h1>
          <p className="hero-desc">
            Discover curated products designed for those who demand excellence.
            Velora brings luxury and technology together.
          </p>
          <div className="hero-cta">
            <Link to="/products" className="btn-primary">
              Shop now <ArrowRight size={18} />
            </Link>
            <Link to="/categories" className="btn-secondary">Explore categories</Link>
          </div>
        </div>
      </section>

      <section className="section products-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products">View all →</Link>
          </div>
          {loading ? (
            <div className="skeleton-grid">
              {[1,2,3,4].map((i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products yet</h3>
              <p>Products will appear here once added by admin.</p>
            </div>
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
      </section>
    </div>
  );
}
