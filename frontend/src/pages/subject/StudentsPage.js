import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const { contextId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ prn:'', name:'', division:'A', batch:'A1', rollNo:'' });
  const [filter, setFilter] = useState({ batch:'', division:'' });
  const fileRef = useRef();

  const load = () => API.get(`/students/${contextId}`).then(r => setStudents(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [contextId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await API.post(`/students/${contextId}`, form); toast.success('Student added!'); setShowForm(false); setForm({ prn:'', name:'', division:'A', batch:'A1', rollNo:'' }); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete student?')) return;
    try { await API.delete(`/students/${contextId}/${id}`); load(); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post(`/students/${contextId}/bulk`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(res.data.message);
      load();
    } catch { toast.error('Upload failed'); }
  };

  const filtered = students.filter(s => (!filter.batch || s.batch === filter.batch) && (!filter.division || s.division === filter.division));
  const batches = [...new Set(students.map(s => s.batch).filter(Boolean))];
  const divisions = [...new Set(students.map(s => s.division).filter(Boolean))];

  if (loading) return <div className="flex-center" style={{ height:300 }}><div className="spinner" style={{ width:36, height:36 }} /></div>;

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom:20 }}>
        <div>
          <h2 className="section-title">👥 Students</h2>
          <p className="section-subtitle">Manage enrolled students — add individually or bulk upload via Excel</p>
        </div>
        <div className="flex-gap">
          <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()}>📤 Bulk Upload (Excel)</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display:'none' }} onChange={handleBulkUpload} />
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Add Student</button>
        </div>
      </div>

      {/* Excel template hint */}
      <div className="alert alert-info" style={{ marginBottom:16 }}>
        📋 Excel template columns: <strong>PRN, Name, Division, Batch, RollNo</strong>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[['Total',students.length,'👥'],['Divisions',divisions.length,'📂'],['Batches',batches.length,'📦'],].map(([label,val,icon]) => (
          <div className="stat-card" key={label}><div className="stat-value">{icon} {val}</div><div className="stat-label">{label}</div></div>
        ))}
        <div className="stat-card" style={{ borderLeftColor:'var(--success)' }}><div className="stat-value" style={{ color:'var(--success)' }}>{filtered.length}</div><div className="stat-label">Filtered</div></div>
      </div>

      {/* Filters */}
      <div className="flex-gap" style={{ marginBottom:16, flexWrap:'wrap' }}>
        <select className="form-input form-select" style={{ width:140 }} value={filter.division} onChange={e => setFilter(f=>({...f,division:e.target.value}))}>
          <option value="">All Divisions</option>{divisions.map(d => <option key={d}>{d}</option>)}
        </select>
        <select className="form-input form-select" style={{ width:140 }} value={filter.batch} onChange={e => setFilter(f=>({...f,batch:e.target.value}))}>
          <option value="">All Batches</option>{batches.map(b => <option key={b}>{b}</option>)}
        </select>
        {(filter.batch||filter.division) && <button className="btn btn-ghost btn-sm" onClick={() => setFilter({ batch:'', division:'' })}>✕ Clear</button>}
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
          <table>
            <thead><tr><th>#</th><th>Roll No</th><th>PRN</th><th>Name</th><th>Division</th><th>Batch</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:24, color:'var(--gray-500)' }}>No students found</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s._id}>
                  <td>{i+1}</td>
                  <td>{s.rollNo}</td>
                  <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.prn}</td>
                  <td className="td-left" style={{ fontWeight:600 }}>{s.name}</td>
                  <td><span className="badge badge-info">{s.division}</span></td>
                  <td><span className="badge badge-gray">{s.batch}</span></td>
                  <td><button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)' }} onClick={() => handleDelete(s._id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&setShowForm(false)}>
          <div className="modal" style={{ maxWidth:400 }}>
            <div className="modal-header"><h3 style={{ fontSize:16, fontWeight:700, color:'var(--primary)' }}>Add Student</h3><button className="btn btn-ghost btn-icon" onClick={()=>setShowForm(false)}>✕</button></div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">PRN *</label><input className="form-input" required value={form.prn} onChange={e=>setForm(f=>({...f,prn:e.target.value}))} placeholder="Student PRN" /></div>
                <div className="form-group"><label className="form-label">Name *</label><input className="form-input" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full Name" /></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Roll No</label><input className="form-input" value={form.rollNo} onChange={e=>setForm(f=>({...f,rollNo:e.target.value}))} /></div>
                  <div className="form-group"><label className="form-label">Division</label><select className="form-input form-select" value={form.division} onChange={e=>setForm(f=>({...f,division:e.target.value}))}><option>A</option><option>B</option><option>C</option></select></div>
                  <div className="form-group"><label className="form-label">Batch</label><input className="form-input" value={form.batch} onChange={e=>setForm(f=>({...f,batch:e.target.value}))} placeholder="A1, A2, B1..." /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
