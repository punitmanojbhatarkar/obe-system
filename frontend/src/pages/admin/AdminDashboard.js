import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/faculty', label: 'Faculty', icon: '👩‍🏫' },
    { to: '/admin/subjects', label: 'Subjects', icon: '📚' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-100)' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: 'var(--primary)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🛡️</div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Admin Panel</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>OBE System</div>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {navItems.map(item => (
            <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 13, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{user?.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 10 }}>Administrator</div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.7)', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', width: '100%' }}>🚪 Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ background: 'white', padding: '16px 24px', boxShadow: 'var(--shadow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Admin Dashboard</h1>
          <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>MIT Academy of Engineering</span>
        </div>

        <div className="page-container">
          {loading ? <div className="flex-center" style={{ height: 200 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div> : (
            <>
              <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                  { label: 'Total Faculty', value: data?.totalFaculty || 0, icon: '👩‍🏫', color: 'var(--primary)' },
                  { label: 'Pending Approval', value: data?.pendingApproval || 0, icon: '⏳', color: data?.pendingApproval > 0 ? 'var(--warning)' : 'var(--success)' },
                  { label: 'Total Subjects', value: data?.totalSubjects || 0, icon: '📚', color: 'var(--accent)' },
                  { label: 'Completion Rate', value: `${data?.contexts?.length > 0 ? Math.round(data.contexts.filter(c => c.completedSteps?.length >= 8).length / data.contexts.length * 100) : 0}%`, icon: '📈', color: 'var(--success)' },
                ].map(stat => (
                  <div key={stat.label} className="stat-card" style={{ borderLeftColor: stat.color }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                      </div>
                      <span style={{ fontSize: 28 }}>{stat.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {data?.pendingApproval > 0 && (
                <div className="alert alert-warning" style={{ marginBottom: 20 }}>
                  ⚠️ <strong>{data.pendingApproval} faculty</strong> awaiting role assignment. <Link to="/admin/faculty" style={{ color: 'var(--warning)', fontWeight: 600 }}>Review now →</Link>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid-3" style={{ marginBottom: 24 }}>
                {[
                  { to: '/admin/faculty', label: 'Manage Faculty', desc: 'Approve, assign roles, reset passwords', icon: '👩‍🏫', color: 'var(--primary)' },
                  { to: '/admin/subjects', label: 'Manage Subjects', desc: 'Create and manage academic contexts', icon: '📚', color: 'var(--accent)' },
                  { to: '/admin/settings', label: 'Attainment Settings', desc: 'Set global thresholds per academic year', icon: '⚙️', color: 'var(--success)' },
                ].map(card => (
                  <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ cursor: 'pointer', borderTop: `4px solid ${card.color}`, transition: 'transform 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = ''}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>{card.label}</h3>
                      <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{card.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Subjects table */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>All Subjects — Status Overview</h3>
                  <Link to="/admin/subjects" className="btn btn-ghost btn-sm">View All →</Link>
                </div>
                <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                  <table>
                    <thead><tr><th style={{ textAlign:'left', paddingLeft:16 }}>Subject</th><th>Code</th><th>Branch</th><th>Semester</th><th>Champion</th><th>Steps Done</th><th>Status</th></tr></thead>
                    <tbody>
                      {(data?.contexts || []).slice(0, 10).map(ctx => {
                        const done = ctx.completedSteps?.length || 0;
                        return (
                          <tr key={ctx._id}>
                            <td className="td-left" style={{ paddingLeft:16, fontWeight:600, fontSize:13 }}>{ctx.subjectName}</td>
                            <td style={{ fontSize:11, fontFamily:'monospace' }}>{ctx.subjectCode || '-'}</td>
                            <td style={{ fontSize:12 }}>{ctx.branch}</td>
                            <td>Sem {ctx.semester}</td>
                            <td style={{ fontSize:12 }}>{ctx.champion?.name || <span style={{ color:'var(--danger)' }}>Not Assigned</span>}</td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ width:80, height:6, background:'var(--gray-200)', borderRadius:3, overflow:'hidden' }}>
                                  <div style={{ width:`${(done/10)*100}%`, height:'100%', background: done>=8?'var(--success)':done>=4?'var(--warning)':'var(--danger)', borderRadius:3 }} />
                                </div>
                                <span style={{ fontSize:11, color:'var(--gray-500)' }}>{done}/10</span>
                              </div>
                            </td>
                            <td><span className={`badge ${done>=8?'badge-success':done>=4?'badge-warning':'badge-danger'}`}>{done>=8?'Complete':done>=4?'In Progress':'Started'}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
