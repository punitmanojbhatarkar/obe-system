import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function SubjectSelect() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/context/my').then(r => setContexts(r.data)).catch(() => toast.error('Failed to load subjects')).finally(() => setLoading(false));
  }, []);

  const getProgress = (ctx) => {
    const total = 10;
    const done = (ctx.completedSteps || []).length;
    return Math.round((done / total) * 100);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-100)' }}>
      {/* Header */}
      <div style={{ background: 'var(--primary)', color: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>OBE Management System</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>MIT Academy of Engineering, Pune</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
            <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'capitalize' }}>{user?.designation} | {user?.role}</div>
          </div>
          <button className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', fontSize: 12 }} onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: 32 }}>
        <div style={{ marginBottom: 28 }}>
          <h2 className="section-title">📚 My Assigned Subjects</h2>
          <p className="section-subtitle">Select a subject to manage its OBE course file</p>
        </div>

        {loading ? (
          <div className="flex-center" style={{ height: 200 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
        ) : contexts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <h3 style={{ color: 'var(--gray-700)', marginBottom: 8 }}>No subjects assigned yet</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>Please contact the admin to get subjects assigned to your account.</p>
          </div>
        ) : (
          <div className="grid-3">
            {contexts.map(ctx => {
              const progress = getProgress(ctx);
              const myRole = user.assignedSubjects?.find(s => s.contextId === ctx._id || s.contextId?._id === ctx._id)?.role || user.role;
              return (
                <div key={ctx._id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', borderTop: '4px solid var(--primary)' }}
                  onClick={() => navigate(`/subject/${ctx._id}`)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontSize: 32 }}>📘</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className={`badge badge-${myRole === 'champion' ? 'info' : 'gray'}`}>{myRole}</span>
                    </div>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)', marginBottom: 4, lineHeight: 1.3 }}>{ctx.subjectName}</h3>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Code: {ctx.subjectCode}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 12 }}>{ctx.branch} | Sem {ctx.semester} | {ctx.academicYear}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>
                    <span>Divisions: {ctx.divisions?.join(', ') || '-'}</span>
                    <span>|</span>
                    <span>Batches: {ctx.batches?.join(', ') || '-'}</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>
                      <span>Completion</span><span>{progress}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? 'var(--success)' : 'var(--accent)', borderRadius: 3, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
