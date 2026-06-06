import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const STEPS = [
  { key: 'vision', label: 'Vision & Mission', icon: '🏛️', path: 'vision' },
  { key: 'cos', label: 'Course Outcomes', icon: '🎯', path: 'cos' },
  { key: 'pi', label: 'PI Mapping', icon: '🗺️', path: 'pi-mapping' },
  { key: 'copo', label: 'CO-PO Matrix', icon: '📊', path: 'copo-matrix' },
  { key: 'activities', label: 'Activities', icon: '📋', path: 'activities' },
  { key: 'students', label: 'Students', icon: '👥', path: 'students' },
  { key: 'marks', label: 'Upload Marks', icon: '📝', path: 'marks' },
  { key: 'survey', label: 'Exit Survey', icon: '📣', path: 'exit-survey' },
  { key: 'attainment', label: 'Attainment', icon: '📈', path: 'attainment' },
  { key: 'action', label: 'Action Report', icon: '⚡', path: 'action-report' },
  { key: 'suggestions', label: 'Suggestions', icon: '💬', path: 'suggestions' },
  { key: 'report', label: 'Generate PDF', icon: '📄', path: 'report' },
];

export default function SubjectLayout() {
  const { contextId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [context, setContext] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    API.get(`/context/${contextId}`).then(r => setContext(r.data)).catch(() => navigate('/subjects'));
  }, [contextId]);

  const currentPath = location.pathname.split('/').pop();
  const completedSteps = context?.completedSteps || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-100)' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 240 : 60, background: 'var(--primary)', transition: 'width 0.2s', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Logo */}
        <div style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>🎓</span>
            {sidebarOpen && <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>OBE System</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>MITAOE</div>
            </div>}
          </div>
        </div>

        {/* Subject info */}
        {sidebarOpen && context && (
          <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.08)', margin: '8px 8px 0', borderRadius: 8 }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, marginBottom: 2 }}>SUBJECT</div>
            <div style={{ color: 'white', fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{context.subjectName}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 }}>{context.subjectCode} | Sem {context.semester}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{context.academicYear}</div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0', marginTop: 8 }}>
          {STEPS.map((step, i) => {
            const isActive = currentPath === step.path;
            const isDone = completedSteps.includes(step.key);
            return (
              <Link key={step.key} to={`/subject/${contextId}/${step.path}`}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid white' : '3px solid transparent',
                  textDecoration: 'none', transition: 'all 0.15s', cursor: 'pointer' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{step.icon}</span>
                {sidebarOpen && <>
                  <span style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: isActive ? 600 : 400, flex: 1 }}>{step.label}</span>
                  {isDone && <span style={{ color: '#22c55e', fontSize: 14 }}>✓</span>}
                </>}
              </Link>
            );
          })}
        </nav>

        {/* Back + Logout */}
        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => navigate('/subjects')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 12, borderRadius: 6 }}>
            <span>←</span>{sidebarOpen && 'My Subjects'}
          </button>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 12, borderRadius: 6 }}>
            <span>🚪</span>{sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ background: 'white', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(o => !o)}>☰</button>
            {context && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--gray-500)' }}>{context.branch}</span>
                <span style={{ color: 'var(--gray-300)' }}>›</span>
                <span style={{ color: 'var(--gray-500)' }}>Sem {context.semester}</span>
                <span style={{ color: 'var(--gray-300)' }}>›</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{context.subjectName}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet context={{ context, setContext }} />
        </div>
      </div>
    </div>
  );
}
