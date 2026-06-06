// VisionMissionPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export function VisionMissionPage() {
  const { contextId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState({ institute: { vision:'', mission:'', qualityPolicy:'' }, department: { vision:'', mission:'', PEOs:[{no:1,statement:''},{no:2,statement:''},{no:3,statement:''}] } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isChampion = user.role === 'champion' || user.role === 'admin';

  useEffect(() => {
    API.get(`/vision/${contextId}`).then(r => { if (r.data && r.data._id) setData(r.data); }).finally(() => setLoading(false));
  }, [contextId]);

  const handleSave = async () => {
    setSaving(true);
    try { await API.post(`/vision/${contextId}`, data); toast.success('Vision & Mission saved!'); }
    catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex-center" style={{ height:300 }}><div className="spinner" style={{ width:36, height:36 }} /></div>;

  const field = (section, key, label, textarea=false) => (
    <div className="form-group" key={key}>
      <label className="form-label">{label}</label>
      {textarea
        ? <textarea className="form-input form-textarea" value={data[section]?.[key] || ''} onChange={e => setData(d => ({ ...d, [section]: { ...d[section], [key]: e.target.value } }))} disabled={!isChampion} />
        : <input className="form-input" value={data[section]?.[key] || ''} onChange={e => setData(d => ({ ...d, [section]: { ...d[section], [key]: e.target.value } }))} disabled={!isChampion} />}
    </div>
  );

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom:20 }}>
        <div><h2 className="section-title">🏛️ Vision & Mission</h2><p className="section-subtitle">Format: ACAD/DI/1A and ACAD/DI/1B</p></div>
        {isChampion && <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '💾 Save'}</button>}
      </div>
      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--primary)', marginBottom:16 }}>🏫 Institute (1A)</h3>
          {field('institute','vision','Vision of Institute',true)}
          {field('institute','mission','Mission of Institute',true)}
          {field('institute','qualityPolicy','Quality Policy',true)}
        </div>
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--primary)', marginBottom:16 }}>🏢 Department (1B)</h3>
          {field('department','vision','Vision of Department',true)}
          {field('department','mission','Mission of Department',true)}
          <div style={{ marginTop:8 }}>
            <label className="form-label">Program Educational Objectives (PEOs)</label>
            {(data.department?.PEOs || []).map((peo, i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
                <span style={{ fontWeight:700, color:'var(--primary)', fontSize:13, minWidth:40 }}>PEO {peo.no}</span>
                <input className="form-input" value={peo.statement} onChange={e => { const PEOs = [...(data.department?.PEOs||[])]; PEOs[i] = { ...PEOs[i], statement: e.target.value }; setData(d => ({ ...d, department: { ...d.department, PEOs } })); }} disabled={!isChampion} placeholder={`PEO ${peo.no} statement`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {isChampion && <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}><button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '💾 Save Vision & Mission'}</button></div>}
    </div>
  );
}

export default VisionMissionPage;
