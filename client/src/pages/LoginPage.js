import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#eff6ff,#f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 16, width: '100%', maxWidth: 400,
        boxShadow: '0 10px 40px rgba(37,99,235,.12)', border: '1px solid #e2e8f0' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <i className="fa-solid fa-graduation-cap" style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>SMS Portal</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>CoC Reporting System — Sign in to continue</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b',
            padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 18, display: 'flex', gap: 8, alignItems: 'center' }}>
            <i className="fa-solid fa-circle-exclamation" />
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
              Username
            </label>
            <input name="username" value={form.username} onChange={handle} required autoFocus
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8,
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color .15s' }}
              onFocus={e  => e.target.style.borderColor = '#2563eb'}
              onBlur={e   => e.target.style.borderColor = '#e2e8f0'}
              placeholder="admin" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input name="password" type="password" value={form.password} onChange={handle} required
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8,
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color .15s' }}
              onFocus={e  => e.target.style.borderColor = '#2563eb'}
              onBlur={e   => e.target.style.borderColor = '#e2e8f0'}
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px 0', background: loading ? '#93c5fd' : '#2563eb',
              color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" /> Signing in...</>
              : <><i className="fa-solid fa-right-to-bracket" /> Sign In</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 20 }}>
          Default: <b>admin</b> / <b>admin123</b>
        </p>
      </div>
    </div>
  );
}
