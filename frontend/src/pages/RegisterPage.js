import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1=check, 2=new register, 3=success
  const [employeeId, setEmployeeId] = useState('');
  const [checking, setChecking] = useState(false);
  const [form, setForm] = useState({ name: '', employeeId: '', email: '', phone: '', department: '', designation: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkEmployee = async () => {
    if (!employeeId.trim()) return toast.error('Enter your Employee ID');
    setChecking(true);
    try {
      const res = await API.get(`/auth/check/${employeeId}`);
      if (res.data.exists && res.data.isActivated) {
        toast.success('Account found! Please login.');
        navigate('/login');
      } else if (res.data.exists && !res.data.isActivated) {
        toast('Registration pending admin approval. Contact admin.', { icon: '⏳' });
      } else {
        setForm(f => ({ ...f, employeeId }));
        setStep(2);
      }
    } catch {
      toast.error('Error checking employee');
    } finally { setChecking(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/register', form);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f, #2d5282)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 24, color: 'white' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎓</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Faculty Registration</h1>
          <p style={{ opacity: 0.8, fontSize: 13 }}>OBE System — MITAOE</p>
        </div>

        <div className="card" style={{ borderRadius: 16 }}>
          {step === 1 && (
            <>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>Are you an existing faculty?</h2>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>Enter your Employee ID to check if you already have an account.</p>
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input className="form-input" placeholder="e.g. MIT2024001" value={employeeId} onChange={e => setEmployeeId(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkEmployee()} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={checkEmployee} disabled={checking}>
                {checking ? <><span className="spinner" />Checking...</> : 'Check & Continue'}
              </button>
              <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--gray-500)' }}>
                Already activated? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Login here</Link>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>New Faculty Registration</h2>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>Fill your details. Admin will review and assign your role.</p>
              <form onSubmit={handleRegister}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. / Prof. Full Name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employee ID *</label>
                    <input className="form-input" required value={form.employeeId} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="faculty@mitaoe.ac.in" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit number" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select className="form-input form-select" required value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                      <option value="">Select Department</option>
                      <option>Computer Engineering</option>
                      <option>Information Technology</option>
                      <option>Electronics & Telecommunication</option>
                      <option>Mechanical Engineering</option>
                      <option>Civil Engineering</option>
                      <option>Artificial Intelligence & Data Science</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation *</label>
                    <select className="form-input form-select" required value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}>
                      <option value="">Select Designation</option>
                      <option>Assistant Professor</option>
                      <option>Associate Professor</option>
                      <option>Professor</option>
                      <option>HOD</option>
                      <option>Dean</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                    {loading ? <><span className="spinner" />Submitting...</> : 'Submit Registration'}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)', marginBottom: 8 }}>Registration Submitted!</h2>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 24 }}>Your registration is pending admin approval. The admin will assign your role and provide login credentials.</p>
              <Link to="/login" className="btn btn-primary">Go to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
