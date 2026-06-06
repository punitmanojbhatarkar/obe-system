import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const BLOOMS = ['', 'Level 1 - Remember', 'Level 2 - Understand', 'Level 3 - Apply', 'Level 4 - Analyze', 'Level 5 - Evaluate', 'Level 6 - Create'];

const defaultCOs = ['CO1','CO2','CO3','CO4','CO5','CO6'].map(coNo => ({
  coNo, statement: '', bloomsLevel: '', targetPercent: 55,
  assessedIn: { IA: true, MSE: true, ESE: true }, isActive: false
}));

export default function CourseOutcomesPage() {
  const { contextId } = useParams();
  const { user } = useAuth();
  const { context } = useOutletContext();
  const [cos, setCOs] = useState(defaultCOs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isChampion = user.role === 'champion' || user.role === 'admin';

  useEffect(() => {
    API.get(`/cos/${contextId}`).then(r => {
      if (r.data.cos?.length) setCOs(r.data.cos);
    }).finally(() => setLoading(false));
  }, [contextId]);

  const update = (idx, field, value) => {
    setCOs(prev => prev.map((co, i) => i === idx ? { ...co, [field]: value } : co));
  };

  const updateAssessedIn = (idx, key, value) => {
    setCOs(prev => prev.map((co, i) => i === idx ? { ...co, assessedIn: { ...co.assessedIn, [key]: value } } : co));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post(`/cos/${contextId}`, { cos });
      toast.success('Course outcomes saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const activeCOCount = cos.filter(co => co.statement?.trim()).length;

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">🎯 Course Outcomes (COs)</h2>
          <p className="section-subtitle">Define up to 6 Course Outcomes with Bloom's taxonomy levels and assessment mapping</p>
        </div>
        <div className="flex-gap">
          <span className="badge badge-info">{activeCOCount} Active COs</span>
          {isChampion && <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" />Saving...</> : '💾 Save COs'}
          </button>}
        </div>
      </div>

      {!isChampion && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          👁️ View only mode. Only the Course Champion can edit Course Outcomes.
        </div>
      )}

      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        💡 <strong>Note:</strong> CO attainment target % is the threshold a student must reach to be counted as "attained" that CO. Default is 55%.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cos.map((co, idx) => (
          <div key={co.coNo} className="card" style={{ padding: 20, borderLeft: `4px solid ${co.statement?.trim() ? 'var(--primary)' : 'var(--gray-200)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: co.statement?.trim() ? 'var(--primary)' : 'var(--gray-200)', color: co.statement?.trim() ? 'white' : 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {co.coNo}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  className="form-input form-textarea"
                  style={{ minHeight: 60, fontSize: 13 }}
                  placeholder={`Enter ${co.coNo} statement... (e.g., "Analyze the prediction by hypothesis testing using data analysis tools.")`}
                  value={co.statement}
                  onChange={e => update(idx, 'statement', e.target.value)}
                  disabled={!isChampion}
                />
              </div>
            </div>

            <div className="grid-3" style={{ gap: 12, alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bloom's Taxonomy Level</label>
                <select className="form-input form-select" value={co.bloomsLevel} onChange={e => update(idx, 'bloomsLevel', e.target.value)} disabled={!isChampion}>
                  {BLOOMS.map(b => <option key={b} value={b}>{b || '— Select Level —'}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Attainment %</label>
                <input type="number" className="form-input" min={1} max={100} value={co.targetPercent}
                  onChange={e => update(idx, 'targetPercent', Number(e.target.value))} disabled={!isChampion} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assessed In</label>
                <div style={{ display: 'flex', gap: 12, paddingTop: 6 }}>
                  {['IA', 'MSE', 'ESE'].map(key => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: isChampion ? 'pointer' : 'default', fontSize: 13 }}>
                      <input type="checkbox" checked={co.assessedIn[key]} onChange={e => updateAssessedIn(idx, key, e.target.checked)} disabled={!isChampion} />
                      {key}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isChampion && (
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" />Saving...</> : '💾 Save All Course Outcomes'}
          </button>
        </div>
      )}
    </div>
  );
}
