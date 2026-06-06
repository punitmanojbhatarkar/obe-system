import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [assignForm, setAssignForm] = useState({ role: 'champion', contextId: '', password: '' });
  const [resetForm, setResetForm] = useState({ userId: null, password: '' });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = () => Promise.all([API.get('/admin/faculty'), API.get('/admin/contexts')]).then(([f, c]) => { setFaculty(f.data); setContexts(c.data); }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAssign = async () => {
    if (!assignForm.password) return toast.error('Password is required');
    try {
      await API.post('/admin/faculty/assign-role', { userId: selectedFaculty._id, ...assignForm });
      toast.success('Role assigned successfully!');
      setSelectedFaculty(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReset = async () => {
    if (!resetForm.password) return toast.error('Enter new password');
    try {
      await API.post('/admin/faculty/reset-password', { userId: resetForm.userId, newPassword: resetForm.password });
      toast.success('Password reset!');
      setResetForm({ userId: null, password: '' });
    } catch { toast.error('Failed'); }
  };

  const filtered = faculty.filter(f => {
    const matchFilter = filter === 'all' || (filter === 'pending' && !f.isRegistered) || (filter === 'active' && f.isRegistered);
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.employeeId.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const roleColor = { champion: '#3182ce', instructor: '#805ad5', admin: '#e53e3e' };

  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-100)' }}>
      {/* Sidebar same as dashboard */}
      <div style={{ width: 220, background: 'var(--primary)', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 20 }}>🛡️</div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Admin Panel</div>
        </div>
        <nav style={{ padding: '8px 0' }}>
          {[{to:'/admin',label:'Dashboard',icon:'📊'},{to:'/admin/faculty',label:'Faculty',icon:'👩‍🏫'},{to:'/admin/subjects',label:'Subjects',icon:'📚'},{to:'/admin/settings',label:'Settings',icon:'⚙️'}].map(item => (
            <Link key={item.to} to={item.to} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 16px',color:'rgba(255,255,255,0.8)',textDecoration:'none',fontSize:13 }}>{item.icon} {item.label}</Link>
          ))}
        </nav>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ background: 'white', padding: '16px 24px', boxShadow: 'var(--shadow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>👩‍🏫 Faculty Management</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-warning">{faculty.filter(f => !f.isRegistered).length} Pending</span>
            <span className="badge badge-success">{faculty.filter(f => f.isRegistered).length} Active</span>
          </div>
        </div>

        <div className="page-container">
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input className="form-input" style={{ width: 240 }} placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
            {['all','pending','active'].map(f => (
              <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-outline'}`} onClick={() => setFilter(f)} style={{ textTransform:'capitalize' }}>{f}</button>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead><tr><th style={{ textAlign:'left', paddingLeft:16 }}>Name</th><th>Employee ID</th><th>Department</th><th>Designation</th><th>Status</th><th>Role</th><th>Subjects</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={8} style={{ padding:24, color:'var(--gray-500)' }}>No faculty found</td></tr>
                    : filtered.map(f => (
                    <tr key={f._id}>
                      <td className="td-left" style={{ paddingLeft:16, fontWeight:600, fontSize:13 }}>{f.name}</td>
                      <td style={{ fontFamily:'monospace', fontSize:12 }}>{f.employeeId}</td>
                      <td style={{ fontSize:12 }}>{f.department || '—'}</td>
                      <td style={{ fontSize:12 }}>{f.designation || '—'}</td>
                      <td><span className={`badge ${f.isRegistered?'badge-success':'badge-warning'}`}>{f.isRegistered?'Active':'Pending'}</span></td>
                      <td>{f.role ? <span style={{ background:roleColor[f.role], color:'white', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>{f.role}</span> : <span style={{ color:'var(--gray-400)', fontSize:12 }}>Not Assigned</span>}</td>
                      <td style={{ fontSize:11 }}>{f.assignedSubjects?.length || 0} subjects</td>
                      <td>
                        <div className="flex-gap" style={{ justifyContent:'center' }}>
                          <button className="btn btn-sm btn-accent" onClick={() => { setSelectedFaculty(f); setAssignForm({ role:'champion', contextId:'', password:'' }); }}>
                            {f.isRegistered ? '✏️ Edit' : '✅ Assign'}
                          </button>
                          <button className="btn btn-sm btn-outline" onClick={() => setResetForm({ userId: f._id, password: '' })}>🔑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Role Modal */}
      {selectedFaculty && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ fontSize:16, fontWeight:700, color:'var(--primary)' }}>Assign Role: {selectedFaculty.name}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedFaculty(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ padding:'12px', background:'var(--gray-50)', borderRadius:8, marginBottom:16 }}>
                <div style={{ fontSize:12, color:'var(--gray-600)' }}><strong>ID:</strong> {selectedFaculty.employeeId} | <strong>Dept:</strong> {selectedFaculty.department} | <strong>Designation:</strong> {selectedFaculty.designation}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign Role *</label>
                <select className="form-input form-select" value={assignForm.role} onChange={e => setAssignForm(f=>({...f,role:e.target.value}))}>
                  <option value="champion">Champion</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assign to Subject (optional)</label>
                <select className="form-input form-select" value={assignForm.contextId} onChange={e => setAssignForm(f=>({...f,contextId:e.target.value}))}>
                  <option value="">— Select Subject —</option>
                  {contexts.map(c => <option key={c._id} value={c._id}>{c.subjectName} ({c.subjectCode}) | {c.academicYear} | Sem {c.semester}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Set Password *</label>
                <input className="form-input" type="password" placeholder="Set login password for faculty" value={assignForm.password} onChange={e => setAssignForm(f=>({...f,password:e.target.value}))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedFaculty(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssign}>✅ Assign Role & Activate</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetForm.userId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header"><h3 style={{ fontSize:16, fontWeight:700, color:'var(--primary)' }}>🔑 Reset Password</h3><button className="btn btn-ghost btn-icon" onClick={()=>setResetForm({userId:null,password:''})}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={resetForm.password} onChange={e=>setResetForm(f=>({...f,password:e.target.value}))} placeholder="Enter new password" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setResetForm({userId:null,password:''})}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReset}>Reset Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
