import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [role, setRole] = useState('champion');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(employeeId, password, role);
      toast.success(`Welcome, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else navigate('/subjects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { key: 'admin', label: 'Admin', icon: '🛡️', desc: 'Manage faculty & subjects' },
    { key: 'champion', label: 'Champion', icon: '🏆', desc: 'Course champion with full access' },
    { key: 'instructor', label: 'Instructor', icon: '👨‍🏫', desc: 'Course instructor access' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5282 50%, #1a365d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32, color: 'white' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>OBE Management System</h1>
          <p style={{ opacity: 0.8, fontSize: 13 }}>MIT Academy of Engineering, Pune</p>
        </div>

        <div className="card" style={{ borderRadius: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginBottom: 20 }}>Sign In</h2>

          {/* Role selector */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-label">Select Role</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {roles.map(r => (
                <div key={r.key} onClick={() => setRole(r.key)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: `2px solid ${role === r.key ? 'var(--primary)' : 'var(--gray-200)'}`,
                    background: role === r.key ? 'var(--accent-light)' : 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s'
                  }}>
                  <div style={{ fontSize: 20 }}>{r.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: role === r.key ? 'var(--primary)' : 'var(--gray-700)', marginTop: 2 }}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input
                className="form-input"
                placeholder="e.g. MIT2024001"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 18,
                    color: 'var(--gray-500)',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? <><span className="spinner" />Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--gray-500)' }}>
            New faculty?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register here</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
          NAAC Accredited | Pune University OBE Compliant
        </div>
      </div>
    </div>
  );
}