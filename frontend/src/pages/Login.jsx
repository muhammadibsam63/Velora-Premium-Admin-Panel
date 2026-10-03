import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Zap, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const DEMO = {
  admin: { email: 'admin@velora.com', password: 'Admin@12345' },
  user: { email: 'user@velora.com', password: 'User@12345' },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successFlash, setSuccessFlash] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  const glowRef = useRef(null);
  const particlesRef = useRef(null);
  const pageRef = useRef(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      const dest = isAdmin ? '/admin' : (location.state?.from?.pathname || '/');
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (reducedMotion.current) {
      gsap.set(['.auth-bg', '.auth-logo', '.auth-eyebrow', '.auth-heading', '.auth-desc',
        '.feature-card', '.auth-form-panel', '.form-label-top', '.form-title', '.form-subtitle',
        '.form-field', '.auth-btn', '.demo-section'], { opacity: 1 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.auth-bg', { opacity: 0 }, { opacity: 1, duration: 1 })
      .fromTo('.auth-grid', { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0)
      .fromTo('.auth-glow-orb', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.4 }, 0.1)
      .fromTo('.auth-logo', { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.7 }, 0.25)
      .fromTo('.auth-eyebrow', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0.4)
      .fromTo('.auth-heading .line', { opacity: 0, y: 36 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.75 }, 0.5)
      .fromTo('.auth-desc', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55 }, 0.85)
      .fromTo('.feature-card', { opacity: 0, y: 28, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, stagger: 0.14, duration: 0.55 }, 0.95)
      .fromTo('.auth-form-panel', { opacity: 0, x: 48 }, { opacity: 1, x: 0, duration: 0.8 }, 0.35)
      .fromTo('.form-label-top', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 0.7)
      .fromTo('.form-title', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 0.8)
      .fromTo('.form-subtitle', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.95)
      .fromTo('.form-field', { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.45 }, 1.0)
      .fromTo('.auth-btn', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45 }, 1.25)
      .fromTo('.auth-switch', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.4)
      .fromTo('.demo-section', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6 }, 1.5)
      .fromTo('.demo-card', { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.5 }, 1.65);

    return () => tl.kill();
  }, []);

  useEffect(() => {
    if (reducedMotion.current || !particlesRef.current) return;
    const container = particlesRef.current;
    const particles = [];
    for (let i = 0; i < 28; i++) {
      const el = document.createElement('span');
      el.className = 'particle';
      const size = 1 + Math.random() * 2.5;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.left = Math.random() * 100 + '%';
      el.style.top = Math.random() * 100 + '%';
      el.style.opacity = 0.15 + Math.random() * 0.35;
      container.appendChild(el);
      particles.push(el);
      gsap.to(el, {
        y: -40 - Math.random() * 80,
        x: (Math.random() - 0.5) * 40,
        opacity: 0,
        duration: 6 + Math.random() * 8,
        repeat: -1,
        delay: Math.random() * 5,
        ease: 'none',
        onRepeat: () => {
          gsap.set(el, {
            y: 0, x: 0,
            left: Math.random() * 100 + '%',
            top: 60 + Math.random() * 40 + '%',
            opacity: 0.15 + Math.random() * 0.35,
          });
        },
      });
    }
    return () => particles.forEach((p) => p.remove());
  }, []);

  useEffect(() => {
    if (reducedMotion.current || !glowRef.current) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const glow = glowRef.current;
    const xTo = gsap.quickTo(glow, 'x', { duration: 0.9, ease: 'power3.out' });
    const yTo = gsap.quickTo(glow, 'y', { duration: 0.9, ease: 'power3.out' });
    const onMove = (e) => {
      const rect = pageRef.current?.getBoundingClientRect();
      if (!rect) return;
      xTo(e.clientX - rect.left - 200);
      yTo(e.clientY - rect.top - 200);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const validate = useCallback(() => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [email, password]);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      if (!reducedMotion.current && formRef.current) {
        gsap.fromTo(formRef.current, { x: -6 }, { x: 0, duration: 0.45, ease: 'elastic.out(1, 0.45)' });
      }
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const data = await login(email.trim(), password);
      setSuccessFlash(true);
      toast.success(data.message || 'Welcome back');
      setTimeout(() => {
        const role = data.user?.role;
        navigate(role === 'ADMIN' ? '/admin' : (location.state?.from?.pathname || '/'), { replace: true });
      }, 450);
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
      if (!reducedMotion.current && formRef.current) {
        gsap.fromTo(formRef.current, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    const creds = DEMO[type];
    setEmail(creds.email);
    setPassword(creds.password);
    setErrors({});
    if (!reducedMotion.current) {
      gsap.fromTo('.form-field input', { boxShadow: '0 0 0 0 rgba(59,130,246,0)' }, {
        boxShadow: '0 0 0 3px rgba(59,130,246,0.35)',
        duration: 0.35, yoyo: true, repeat: 1,
      });
    }
    toast.success((type === 'admin' ? 'Admin' : 'User') + ' credentials filled — click Sign in');
  };

  return (
    <div className="auth-page" ref={pageRef}>
      <div className="auth-bg" />
      <div className="auth-grid" />
      <div className="auth-glow-orb" />
      <div className="auth-cursor-glow" ref={glowRef} />
      <div className="auth-particles" ref={particlesRef} />
      <div className="auth-noise" />
      <div className="auth-beam" />

      <div className="auth-left">
        <div className="auth-logo">
          <span className="logo-mark">V</span>
          <span className="logo-text">VELORA</span>
        </div>
        <p className="auth-eyebrow">PREMIUM EXPERIENCE</p>
        <h1 className="auth-heading">
          <span className="line">Everything</span>{' '}
          <span className="line">is ready.</span>
        </h1>
        <p className="auth-desc">
          Welcome back to your world. Sign in to continue your journey.
          Your account, preferences and everything you need are waiting for you.
        </p>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon"><Shield size={18} /></div>
            <div>
              <strong>Secure by design</strong>
              <p>Your account stays protected.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Zap size={18} /></div>
            <div>
              <strong>Fast &amp; seamless</strong>
              <p>Get where you need to be faster.</p>
            </div>
          </div>
        </div>
        <p className="auth-footer-left">© 2026 Velora · Private. Secure. Simple.</p>
      </div>

      <div className="auth-right">
        <div className={'auth-form-panel' + (successFlash ? ' success-flash' : '')}>
          <form className="auth-form" ref={formRef} onSubmit={handleSubmit} noValidate>
            <p className="form-label-top">WELCOME BACK</p>
            <h2 className="form-title">Sign in to Velora.</h2>
            <p className="form-subtitle">Access your personal Velora space.</p>

            <div className={'form-field' + (errors.email ? ' error' : '')}>
              <Mail size={18} className="field-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className={'form-field' + (errors.password ? ' error' : '')}>
              <Lock size={18} className="field-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                autoComplete="current-password"
                disabled={loading}
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)} aria-label="Toggle password" tabIndex={-1}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : successFlash ? (
                <><CheckCircle2 size={18} /> Welcome back</>
              ) : (
                <>Sign in <ArrowRight size={18} className="btn-arrow" /></>
              )}
            </button>

            <p className="auth-switch">
              Don&apos;t have an account? <Link to="/signup">Create account →</Link>
            </p>
          </form>

          <div className="demo-section">
            <p className="demo-heading">Demo Access</p>
            <div className="demo-cards">
              <div className="demo-card demo-admin">
                <div className="demo-badge admin">ADMIN</div>
                <div className="demo-creds">
                  <span className="demo-label">Email</span>
                  <span className="demo-value">{DEMO.admin.email}</span>
                  <span className="demo-label">Password</span>
                  <span className="demo-value">{DEMO.admin.password}</span>
                </div>
                <button type="button" className="demo-btn" onClick={() => fillDemo('admin')}>
                  Use Admin Account
                </button>
              </div>
              <div className="demo-card demo-user">
                <div className="demo-badge user">USER</div>
                <div className="demo-creds">
                  <span className="demo-label">Email</span>
                  <span className="demo-value">{DEMO.user.email}</span>
                  <span className="demo-label">Password</span>
                  <span className="demo-value">{DEMO.user.password}</span>
                </div>
                <button type="button" className="demo-btn" onClick={() => fillDemo('user')}>
                  Use User Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
