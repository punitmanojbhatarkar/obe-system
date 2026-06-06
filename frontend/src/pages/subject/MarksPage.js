import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function MarksPage() {
  const { contextId } = useParams();
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [marks, setMarks] = useState({});
  const [existingMarks, setExistingMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    Promise.all([API.get(`/activities/${contextId}`), API.get(`/students/${contextId}`)])
      .then(([actRes, stuRes]) => { setActivities(actRes.data.activities || []); setStudents(stuRes.data); })
      .finally(() => setLoading(false));
  }, [contextId]);

  useEffect(() => {
    if (!selectedActivity) return;
    API.get(`/marks/${contextId}/${selectedActivity._id}`).then(r => {
      setExistingMarks(r.data);
      const marksMap = {};
      r.data.forEach(m => {
        marksMap[m.studentId._id] = {};
        m.coMarks?.forEach(cm => { marksMap[m.studentId._id][cm.coNo] = cm.marksObtained; });
        m.questionMarks?.forEach(qm => { marksMap[m.studentId._id][`q_${qm.qNo}`] = qm.marksObtained; });
      });
      setMarks(marksMap);
    });
  }, [selectedActivity, contextId]);

  const updateMark = (studentId, key, value) => {
    setMarks(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [key]: value } }));
  };

  const handleSave = async () => {
    if (!selectedActivity) return;
    setSaving(true);
    try {
      const marksData = students.map(student => {
        const sm = marks[student._id] || {};
        let coMarks = [], questionMarks = [];
        if (selectedActivity.questions?.length > 0) {
          questionMarks = selectedActivity.questions.map(q => ({ qNo: q.qNo, marksObtained: parseFloat(sm[`q_${q.qNo}`] || 0), maxMarks: q.maxMarks, coMapped: q.coMapped }));
          // Aggregate to CO marks
          const coMap = {};
          questionMarks.forEach(qm => {
            if (!coMap[qm.coMapped]) coMap[qm.coMapped] = { obtained: 0, max: 0 };
            coMap[qm.coMapped].obtained += qm.marksObtained;
            coMap[qm.coMapped].max += qm.maxMarks;
          });
          coMarks = Object.entries(coMap).map(([coNo, d]) => ({ coNo, marksObtained: d.obtained, maxMarks: d.max }));
        } else {
          coMarks = (selectedActivity.cosMapped || []).map(coNo => {
            const maxPerCO = selectedActivity.maxMarks / (selectedActivity.cosMapped?.length || 1);
            return { coNo, marksObtained: parseFloat(sm[coNo] || 0), maxMarks: maxPerCO };
          });
        }
        return { studentId: student._id, activityType: selectedActivity.type, coMarks, questionMarks, totalMarks: coMarks.reduce((s,c)=>s+c.marksObtained,0) };
      });
      await API.post(`/marks/${contextId}/${selectedActivity._id}/bulk-save`, { marksData });
      toast.success('Marks saved!');
    } catch { toast.error('Failed to save marks'); } finally { setSaving(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedActivity) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post(`/marks/${contextId}/${selectedActivity._id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(res.data.message);
    } catch { toast.error('Upload failed'); }
  };

  const downloadTemplate = () => {
    if (!selectedActivity) return;
    window.open(`/api/marks/${contextId}/${selectedActivity._id}/template`);
  };

  const typeColor = (t) => ({ IA:'#3182ce', MSE:'#9f7aea', ESE:'#e53e3e', Assignment:'#38a169', Activity:'#dd6b20', CA:'#d69e2e' }[t]||'#718096');

  if (loading) return <div className="flex-center" style={{ height:300 }}><div className="spinner" style={{ width:36, height:36 }} /></div>;

  return (
    <div className="page-container">
      <div style={{ marginBottom:20 }}>
        <h2 className="section-title">📝 Upload / Enter Marks</h2>
        <p className="section-subtitle">Enter student marks activity-wise. Marks are mapped to COs automatically.</p>
      </div>

      <div className="grid-2" style={{ marginBottom:20 }}>
        <div className="card">
          <label className="form-label" style={{ marginBottom:8 }}>Select Assessment</label>
          <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:300, overflowY:'auto' }}>
            {activities.map(act => (
              <div key={act._id} onClick={() => setSelectedActivity(act)}
                style={{ padding:'10px 14px', borderRadius:8, border:`1.5px solid ${selectedActivity?._id===act._id?'var(--primary)':'var(--gray-200)'}`, background:selectedActivity?._id===act._id?'var(--accent-light)':'white', cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ background:typeColor(act.type), color:'white', padding:'2px 6px', borderRadius:4, fontSize:10, fontWeight:700, flexShrink:0 }}>{act.type}</span>
                <span style={{ fontSize:13, fontWeight:selectedActivity?._id===act._id?600:400 }}>{act.name}</span>
                <span style={{ fontSize:11, color:'var(--gray-500)', marginLeft:'auto' }}>{act.maxMarks}M</span>
              </div>
            ))}
          </div>
        </div>

        {selectedActivity && (
          <div className="card">
            <h3 style={{ fontSize:14, fontWeight:700, color:'var(--primary)', marginBottom:12 }}>Activity Details</h3>
            <div style={{ fontSize:12, color:'var(--gray-700)' }}>
              <div style={{ marginBottom:6 }}><strong>Name:</strong> {selectedActivity.name}</div>
              <div style={{ marginBottom:6 }}><strong>Type:</strong> {selectedActivity.type}</div>
              <div style={{ marginBottom:6 }}><strong>Max Marks:</strong> {selectedActivity.maxMarks}</div>
              <div style={{ marginBottom:12 }}><strong>COs:</strong> {selectedActivity.cosMapped?.join(', ')}</div>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={downloadTemplate}>📥 Download Template</button>
              <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()}>📤 Upload Excel</button>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display:'none' }} onChange={handleUpload} />
            </div>
          </div>
        )}
      </div>

      {selectedActivity && students.length > 0 && (
        <>
          <div className="card" style={{ padding:0, overflow:'hidden', marginBottom:16 }}>
            <div style={{ padding:'12px 16px', background:'var(--gray-50)', borderBottom:'1px solid var(--gray-200)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:14, fontWeight:600, color:'var(--primary)' }}>Enter Marks: {selectedActivity.name}</span>
              <span style={{ fontSize:12, color:'var(--gray-500)' }}>{students.length} students</span>
            </div>
            <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign:'left', paddingLeft:12 }}>#</th>
                    <th style={{ textAlign:'left' }}>PRN</th>
                    <th style={{ textAlign:'left' }}>Name</th>
                    <th>Batch</th>
                    {selectedActivity.questions?.length > 0
                      ? selectedActivity.questions.map(q => <th key={q.qNo}>Q{q.qNo} ({q.maxMarks})</th>)
                      : selectedActivity.cosMapped?.map(co => <th key={co}>{co} ({(selectedActivity.maxMarks/(selectedActivity.cosMapped?.length||1)).toFixed(1)})</th>)
                    }
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const sm = marks[s._id] || {};
                    const cols = selectedActivity.questions?.length > 0
                      ? selectedActivity.questions.map(q => `q_${q.qNo}`)
                      : selectedActivity.cosMapped || [];
                    const total = cols.reduce((sum, k) => sum + parseFloat(sm[k]||0), 0);
                    return (
                      <tr key={s._id}>
                        <td>{i+1}</td>
                        <td style={{ fontSize:11, fontFamily:'monospace' }}>{s.prn}</td>
                        <td className="td-left" style={{ fontSize:12, fontWeight:500 }}>{s.name}</td>
                        <td><span className="badge badge-gray">{s.batch}</span></td>
                        {cols.map(key => (
                          <td key={key}>
                            <input type="number" min="0" step="0.5"
                              max={selectedActivity.questions?.find(q=>`q_${q.qNo}`===key)?.maxMarks || (selectedActivity.maxMarks/(selectedActivity.cosMapped?.length||1))}
                              value={sm[key]??''} onChange={e => updateMark(s._id, key, e.target.value)}
                              style={{ width:60, padding:'4px 6px', border:'1px solid var(--gray-200)', borderRadius:4, textAlign:'center', fontSize:12 }} />
                          </td>
                        ))}
                        <td style={{ fontWeight:700, color:'var(--primary)' }}>{total.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" />Saving...</> : '💾 Save Marks'}
            </button>
          </div>
        </>
      )}

      {!selectedActivity && <div className="card" style={{ textAlign:'center', padding:40 }}><div style={{ fontSize:36, marginBottom:8 }}>👈</div><p style={{ color:'var(--gray-500)' }}>Select an activity from the left to enter marks</p></div>}
    </div>
  );
}
