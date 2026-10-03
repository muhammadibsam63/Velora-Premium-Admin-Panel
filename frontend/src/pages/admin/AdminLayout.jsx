import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/products/add', icon: Plus, label: 'Add Product' },
    { to: '/admin/categories', icon: Tags, label: 'Categories' },
    { to: '/admin/categories/add', icon: Plus, label: 'Add Category' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="logo-mark">V</span>
          <span>Admin</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((l) => {
            const active = l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to) && (l.to !== '/admin' || location.pathname === '/admin');
            return (
              <Link key={l.to} to={l.to} className={`sidebar-link ${active ? 'active' : ''}`}>
                <l.icon size={18} />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button className="sidebar-logout" onClick={() => { logout(); navigate('/'); }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>Welcome, {user?.fullName}</h1>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
