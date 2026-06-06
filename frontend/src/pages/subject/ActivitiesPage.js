import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const TYPES = ['IA','MSE','ESE','Assignment','Activity','CA'];
const CO_LIST = ['CO1','CO2','CO3','CO4','CO5','CO6'];

const emptyActivity = { name:'', type:'IA', maxMarks:10, cosMapped:[], rbtLevel:'', tentativeDate:'', division:'ALL', questions:[] };

export default function ActivitiesPage() {
  const { contextId } = useParams();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState(emptyActivity);
  const isChampion = user.role === 'champion' || user.role === 'admin';

  useEffect(() => {
    API.get(`/activities/${contextId}`).then(r => setActivities(r.data.activities || [])).finally(() => setLoading(false));
  }, [contextId]);

  const openAdd = () => { setForm(emptyActivity); setEditIdx(null); setShowForm(true); };
  const openEdit = (idx) => { setForm({ ...activities[idx] }); setEditIdx(idx); setShowForm(true); };

  const handleSubmit = () => {
    if (!form.name || !form.type || !form.maxMarks) return toast.error('Fill required fields');
    if (editIdx !== null) {
      const updated = [...activities]; updated[editIdx] = form; setActivities(updated);
    } else {
      setActivities(a => [...a, form]);
    }
    setShowForm(false);
  };

  const handleDelete = (idx) => { if (window.confirm('Delete this activity?')) setActivities(a => a.filter((_,i) => i !== idx)); };

  const handleSave = async () => {
    setSaving(true);
    try { await API.post(`/activities/${contextId}`, { activities }); toast.success('Activities saved!'); }
    catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const toggleCO = (co) => {
    const mapped = form.cosMapped || [];
    setForm(f => ({ ...f, cosMapped: mapped.includes(co) ? mapped.filter(c => c !== co) : [...mapped, co] }));
  };

  const typeColor = (t) => ({ IA:'#3182ce', MSE:'#9f7aea', ESE:'#e53e3e', Assignment:'#38a169', Activity:'#dd6b20', CA:'#d69e2e' }[t] || '#718096');

  if (loading) return <div className="flex-center" style={{ height:300 }}><div className="spinner" style={{ width:36, height:36 }} /></div>;

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom:20 }}>
        <div><h2 className="section-title">📋 Activities & Assessments</h2><p className="section-subtitle">Define all course activities, assessments, and map them to COs</p></div>
        <div className="flex-gap">
          {isChampion && <><button className="btn btn-outline" onClick={openAdd}>+ Add Activity</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...':'💾 Save All'}</button></>}
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:48 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
          <h3 style={{ color:'var(--gray-700)', marginBottom:8 }}>No activities defined yet</h3>
          {isChampion && <button className="btn btn-primary" onClick={openAdd}>+ Add First Activity</button>}
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table>
              <thead><tr><th>Name</th><th>Type</th><th>Max Marks</th><th>COs Mapped</th><th>RBT Level</th><th>Date</th><th>Division</th>{isChampion&&<th>Actions</th>}</tr></thead>
              <tbody>
                {activities.map((act, idx) => (
                  <tr key={idx}>
                    <td className="td-left" style={{ fontWeight:600 }}>{act.name}</td>
                    <td><span style={{ background:typeColor(act.type), color:'white', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>{act.type}</span></td>
                    <td>{act.maxMarks}</td>
                    <td>{act.cosMapped?.map(co => <span key={co} className="badge badge-info" style={{ marginRight:2 }}>{co}</span>)}</td>
                    <td>{act.rbtLevel||'—'}</td>
                    <td>{act.tentativeDate||'—'}</td>
                    <td>{act.division||'ALL'}</td>
                    {isChampion&&<td>
                      <div className="flex-gap" style={{ justifyContent:'center' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(idx)}>✏️</button>
                        <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)' }} onClick={() => handleDelete(idx)}>🗑️</button>
                      </div>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header"><h3 style={{ fontSize:16, fontWeight:700, color:'var(--primary)' }}>{editIdx !== null ? 'Edit' : 'Add'} Activity</h3><button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button></div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Activity Name *</label><input className="form-input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Assignment 1, MSE Paper" /></div>
                <div className="form-group"><label className="form-label">Type *</label><select className="form-input form-select" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Max Marks *</label><input type="number" className="form-input" value={form.maxMarks} onChange={e => setForm(f=>({...f,maxMarks:Number(e.target.value)}))} /></div>
                <div className="form-group"><label className="form-label">RBT Level</label><input className="form-input" value={form.rbtLevel} onChange={e => setForm(f=>({...f,rbtLevel:e.target.value}))} placeholder="L1, L2, L3..." /></div>
                <div className="form-group"><label className="form-label">Tentative Date</label><input type="date" className="form-input" value={form.tentativeDate} onChange={e => setForm(f=>({...f,tentativeDate:e.target.value}))} /></div>
                <div className="form-group"><label className="form-label">Division</label><select className="form-input form-select" value={form.division} onChange={e => setForm(f=>({...f,division:e.target.value}))}><option value="ALL">All Divisions</option><option value="A">Division A</option><option value="B">Division B</option></select></div>
              </div>
              <div className="form-group">
                <label className="form-label">COs Mapped *</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {CO_LIST.map(co => (
                    <label key={co} style={{ display:'flex', alignItems:'center', gap:4, cursor:'pointer', padding:'4px 10px', borderRadius:6, border:`1.5px solid ${form.cosMapped?.includes(co)?'var(--primary)':'var(--gray-200)'}`, background:form.cosMapped?.includes(co)?'var(--accent-light)':'white', fontSize:13 }}>
                      <input type="checkbox" style={{ display:'none' }} checked={form.cosMapped?.includes(co)} onChange={() => toggleCO(co)} />{co}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>{editIdx !== null ? 'Update' : 'Add'} Activity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
