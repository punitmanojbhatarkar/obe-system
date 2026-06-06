import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Sidebar = () => (
  <div style={{ width: 220, background: 'var(--primary)', flexShrink: 0 }}>
    <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ fontSize: 20 }}>🛡️</div><div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Admin Panel</div>
    </div>
    <nav style={{ padding: '8px 0' }}>
      {[{to:'/admin',label:'Dashboard',icon:'📊'},{to:'/admin/faculty',label:'Faculty',icon:'👩‍🏫'},{to:'/admin/subjects',label:'Subjects',icon:'📚'},{to:'/admin/settings',label:'Settings',icon:'⚙️'}].map(item => (
        <Link key={item.to} to={item.to} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 16px',color:'rgba(255,255,255,0.8)',textDecoration:'none',fontSize:13 }}>{item.icon} {item.label}</Link>
      ))}
    </nav>
  </div>
);

export function AdminSubjects() {
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ academicYear:'2025-26', branch:'Computer Engineering', semester:'V', subjectName:'', subjectCode:'', class:'', divisions:['A'], batches:['A1','A2'], examScheme:{ IA:30, MSE:20, ESE:50 } });

  const load = () => API.get('/admin/contexts').then(r => setContexts(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.subjectName || !form.subjectCode) return toast.error('Subject name and code required');
    try { await API.post('/admin/contexts', form); toast.success('Subject created!'); setShowForm(false); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex-center" style={{ height:'100vh' }}><div className="spinner" style={{ width:40, height:40 }} /></div>;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--gray-100)' }}>
      <Sidebar />
      <div style={{ flex:1, overflow:'auto' }}>
        <div style={{ background:'white', padding:'16px 24px', boxShadow:'var(--shadow)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{ fontSize:20, fontWeight:700, color:'var(--primary)' }}>📚 Subjects</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create Subject</button>
        </div>
        <div className="page-container">
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
              <table>
                <thead><tr><th style={{ textAlign:'left', paddingLeft:16 }}>Subject</th><th>Code</th><th>Branch</th><th>Year</th><th>Sem</th><th>Champion</th><th>Instructors</th><th>Divs</th><th>Steps</th></tr></thead>
                <tbody>
                  {contexts.length === 0
                    ? <tr><td colSpan={9} style={{ padding:24, color:'var(--gray-500)' }}>No subjects yet. Create one!</td></tr>
                    : contexts.map(c => (
                    <tr key={c._id}>
                      <td className="td-left" style={{ paddingLeft:16, fontWeight:600, fontSize:13 }}>{c.subjectName}</td>
                      <td style={{ fontFamily:'monospace', fontSize:11 }}>{c.subjectCode}</td>
                      <td style={{ fontSize:12 }}>{c.branch}</td>
                      <td style={{ fontSize:12 }}>{c.academicYear}</td>
                      <td>Sem {c.semester}</td>
                      <td style={{ fontSize:12 }}>{c.champion?.name || <span style={{ color:'var(--danger)', fontSize:11 }}>Not Assigned</span>}</td>
                      <td style={{ fontSize:12 }}>{c.instructors?.map(i=>i.name).join(', ') || '—'}</td>
                      <td><span className="badge badge-info">{c.divisions?.join(', ') || '—'}</span></td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <div style={{ width:60, height:6, background:'var(--gray-200)', borderRadius:3, overflow:'hidden' }}>
                            <div style={{ width:`${((c.completedSteps?.length||0)/10)*100}%`, height:'100%', background:'var(--success)', borderRadius:3 }} />
                          </div>
                          <span style={{ fontSize:11 }}>{c.completedSteps?.length||0}/10</span>
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

      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth:560 }}>
            <div className="modal-header"><h3 style={{ fontSize:16, fontWeight:700, color:'var(--primary)' }}>Create New Subject</h3><button className="btn btn-ghost btn-icon" onClick={()=>setShowForm(false)}>✕</button></div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Subject Name *</label><input className="form-input" value={form.subjectName} onChange={e=>setForm(f=>({...f,subjectName:e.target.value}))} placeholder="e.g. Exploratory Data Analysis" /></div>
                <div className="form-group"><label className="form-label">Subject Code *</label><input className="form-input" value={form.subjectCode} onChange={e=>setForm(f=>({...f,subjectCode:e.target.value}))} placeholder="e.g. 2304331T" /></div>
                <div className="form-group"><label className="form-label">Academic Year</label>
                  <select className="form-input form-select" value={form.academicYear} onChange={e=>setForm(f=>({...f,academicYear:e.target.value}))}>
                    {['2024-25','2025-26','2026-27'].map(y=><option key={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Branch</label>
                  <select className="form-input form-select" value={form.branch} onChange={e=>setForm(f=>({...f,branch:e.target.value}))}>
                    {['Computer Engineering','Information Technology','Electronics & Telecommunication','Mechanical Engineering','Artificial Intelligence & Data Science'].map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Semester</label>
                  <select className="form-input form-select" value={form.semester} onChange={e=>setForm(f=>({...f,semester:e.target.value}))}>
                    {['I','II','III','IV','V','VI','VII','VIII'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Class</label><input className="form-input" value={form.class} onChange={e=>setForm(f=>({...f,class:e.target.value}))} placeholder="e.g. TY BTech" /></div>
                <div className="form-group"><label className="form-label">Divisions (comma-separated)</label><input className="form-input" value={form.divisions?.join(',')} onChange={e=>setForm(f=>({...f,divisions:e.target.value.split(',').map(x=>x.trim())}))} placeholder="A,B" /></div>
                <div className="form-group"><label className="form-label">Batches (comma-separated)</label><input className="form-input" value={form.batches?.join(',')} onChange={e=>setForm(f=>({...f,batches:e.target.value.split(',').map(x=>x.trim())}))} placeholder="A1,A2,B1" /></div>
              </div>
              <div style={{ background:'var(--gray-50)', padding:12, borderRadius:8 }}>
                <div className="form-label" style={{ marginBottom:8 }}>Exam Scheme (marks)</div>
                <div style={{ display:'flex', gap:12 }}>
                  {['IA','MSE','ESE'].map(k => (
                    <label key={k} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
                      {k}: <input type="number" style={{ width:60, padding:'4px 8px', border:'1px solid var(--gray-200)', borderRadius:4 }} value={form.examScheme[k]} onChange={e=>setForm(f=>({...f,examScheme:{...f.examScheme,[k]:Number(e.target.value)}}))} />
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>✅ Create Subject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminSettings() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ academicYear:'2025-26', level1:65, level2:75, level3:85 });
  const [saving, setSaving] = useState(false);

  const load = () => API.get('/admin/attainment-config').then(r => setConfigs(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (form.level1 >= form.level2 || form.level2 >= form.level3) return toast.error('Level thresholds must be: Level1 < Level2 < Level3');
    setSaving(true);
    try { await API.post('/admin/attainment-config', form); toast.success('Config saved!'); load(); }
    catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--gray-100)' }}>
      <Sidebar />
      <div style={{ flex:1, overflow:'auto' }}>
        <div style={{ background:'white', padding:'16px 24px', boxShadow:'var(--shadow)' }}>
          <h1 style={{ fontSize:20, fontWeight:700, color:'var(--primary)' }}>⚙️ Attainment Settings</h1>
        </div>
        <div className="page-container">
          <div className="alert alert-info" style={{ marginBottom:20 }}>
            💡 Set attainment level thresholds per academic year. These apply globally to all subjects in that year.
          </div>
          <div className="grid-2">
            <div className="card">
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--primary)', marginBottom:16 }}>Set New Configuration</h3>
              <div className="form-group"><label className="form-label">Academic Year</label>
                <select className="form-input form-select" value={form.academicYear} onChange={e=>setForm(f=>({...f,academicYear:e.target.value}))}>
                  {['2024-25','2025-26','2026-27'].map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
              {[['level1','Level 1 (%)','Minimum threshold for Level 1 attainment'],['level2','Level 2 (%)','Threshold for Level 2 attainment'],['level3','Level 3 (%)','Threshold for Level 3 attainment']].map(([key,label,hint])=>(
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input type="number" className="form-input" min={0} max={100} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:Number(e.target.value)}))} />
                  <div style={{ fontSize:11, color:'var(--gray-500)', marginTop:3 }}>{hint}</div>
                </div>
              ))}
              <div style={{ padding:12, background:'var(--gray-50)', borderRadius:8, marginBottom:16, fontSize:12 }}>
                <div style={{ fontWeight:600, marginBottom:4 }}>Preview:</div>
                {[['Level 0','var(--danger)',`< ${form.level1}%`],['Level 1','var(--orange)',`≥ ${form.level1}%`],['Level 2','var(--warning)',`≥ ${form.level2}%`],['Level 3','var(--success)',`≥ ${form.level3}%`]].map(([label,color,range])=>(
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <div style={{ width:10, height:10, background:color, borderRadius:'50%' }} />
                    <span>{label}: {range}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width:'100%' }} onClick={handleSave} disabled={saving}>{saving?'Saving...':'💾 Save Configuration'}</button>
            </div>

            <div className="card">
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--primary)', marginBottom:16 }}>Existing Configurations</h3>
              {loading ? <div className="spinner" /> : configs.length === 0
                ? <p style={{ color:'var(--gray-500)', fontSize:13 }}>No configurations yet</p>
                : configs.map(c => (
                  <div key={c._id} style={{ padding:'12px 16px', border:'1px solid var(--gray-200)', borderRadius:8, marginBottom:8 }}>
                    <div style={{ fontWeight:700, color:'var(--primary)', marginBottom:6 }}>{c.academicYear}</div>
                    <div style={{ display:'flex', gap:16, fontSize:12 }}>
                      <span style={{ color:'var(--orange)' }}>L1: ≥{c.level1}%</span>
                      <span style={{ color:'var(--warning)' }}>L2: ≥{c.level2}%</span>
                      <span style={{ color:'var(--success)' }}>L3: ≥{c.level3}%</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSubjects;
