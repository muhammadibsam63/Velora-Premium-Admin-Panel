import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield, Zap, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successFlash, setSuccessFlash] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const glowRef = useRef(null);
  const particlesRef = useRef(null);
  const pageRef = useRef(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (reducedMotion.current) {
      gsap.set(['.auth-bg', '.auth-logo', '.auth-eyebrow', '.auth-heading', '.auth-desc',
        '.feature-card', '.auth-form-panel', '.form-field', '.auth-btn'], { opacity: 1 });
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
      .fromTo('.feature-card', { opacity: 0, y: 28 }, { opacity: 1, y: 0, stagger: 0.14, duration: 0.55 }, 0.95)
      .fromTo('.auth-form-panel', { opacity: 0, x: 48 }, { opacity: 1, x: 0, duration: 0.8 }, 0.35)
      .fromTo('.form-label-top', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 0.7)
      .fromTo('.form-title', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 0.8)
      .fromTo('.form-field', { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.4 }, 0.95)
      .fromTo('.auth-btn', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, 1.3);
    return () => tl.kill();
  }, []);

  useEffect(() => {
    if (reducedMotion.current || !particlesRef.current) return;
    const container = particlesRef.current;
    const particles = [];
    for (let i = 0; i < 24; i++) {
      const el = document.createElement('span');
      el.className = 'particle';
      const size = 1 + Math.random() * 2.5;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.left = Math.random() * 100 + '%';
      el.style.top = Math.random() * 100 + '%';
      el.style.opacity = 0.15 + Math.random() * 0.3;
      container.appendChild(el);
      particles.push(el);
      gsap.to(el, {
        y: -50 - Math.random() * 70,
        x: (Math.random() - 0.5) * 30,
        opacity: 0,
        duration: 7 + Math.random() * 7,
        repeat: -1,
        delay: Math.random() * 4,
        ease: 'none',
        onRepeat: () => {
          gsap.set(el, {
            y: 0, x: 0,
            left: Math.random() * 100 + '%',
            top: 50 + Math.random() * 50 + '%',
            opacity: 0.15 + Math.random() * 0.3,
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

  const strength = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const strengthScore = [strength.length, strength.upper, strength.lower, strength.number].filter(Boolean).length;

  const validate = useCallback(() => {
    const e = {};
    if (!fullName.trim() || fullName.trim().length < 2) e.fullName = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (strengthScore < 4) e.password = 'Password does not meet requirements';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [fullName, email, password, confirm, strengthScore]);

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
      const data = await signup(fullName.trim(), email.trim(), password);
      setSuccessFlash(true);
      toast.success(data.message || 'Account created');
      setTimeout(() => navigate('/', { replace: true }), 450);
    } catch (err) {
      toast.error(err.message || 'Signup failed');
      if (!reducedMotion.current && formRef.current) {
        gsap.fromTo(formRef.current, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      }
    } finally {
      setLoading(false);
    }
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
            <p className="form-label-top">CREATE ACCOUNT</p>
            <h2 className="form-title">Create your account.</h2>
            <p className="form-subtitle">Build your personal Velora space.</p>

            <div className={'form-field' + (errors.fullName ? ' error' : '')}>
              <User size={18} className="field-icon" />
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                disabled={loading}
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className={'form-field' + (errors.email ? ' error' : '')}>
              <Mail size={18} className="field-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)} aria-label="Toggle password" tabIndex={-1}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="password-reqs">
              <span className={strength.length ? 'met' : ''}>• 8+ characters</span>
              <span className={strength.upper ? 'met' : ''}>• Uppercase letter</span>
              <span className={strength.lower ? 'met' : ''}>• Lowercase letter</span>
              <span className={strength.number ? 'met' : ''}>• One number</span>
            </div>

            {/* Strength meter */}
            <div className="strength-meter" style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background: i <= strengthScore
                      ? (strengthScore <= 1 ? '#ef4444' : strengthScore <= 2 ? '#f59e0b' : strengthScore <= 3 ? '#22d3ee' : '#22c55e')
                      : 'rgba(255,255,255,0.08)',
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>

            <div className={'form-field' + (errors.confirm ? ' error' : '')}>
              <Lock size={18} className="field-icon" />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
              <button type="button" className="toggle-pass" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm" tabIndex={-1}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : successFlash ? (
                <><CheckCircle2 size={18} /> Account created</>
              ) : (
                <>Create account <ArrowRight size={18} className="btn-arrow" /></>
              )}
            </button>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in →</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
