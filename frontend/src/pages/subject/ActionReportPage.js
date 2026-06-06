import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function ActionReportPage() {
  const { contextId } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState({ highAttainment: [], lowAttainment: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isChampion = user.role === 'champion' || user.role === 'admin';

  useEffect(() => {
    API.get(`/action-report/${contextId}`).then(r => setReport(r.data)).finally(() => setLoading(false));
  }, [contextId]);

  const updateRow = (type, idx, field, value) => {
    setReport(prev => {
      const arr = [...(prev[type] || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [type]: arr };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try { await API.post(`/action-report/${contextId}`, report); toast.success('Action report saved!'); }
    catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  const Section = ({ type, title, color, emoji }) => (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 10, height: 10, background: color, borderRadius: '50%' }} />
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{emoji} {title}</h3>
        <span className="badge" style={{ background: color, color: 'white' }}>{report[type]?.length || 0} POs</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(report[type] || []).length === 0
          ? <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>No {title.toLowerCase()} POs found. Calculate attainment first.</p>
          : (report[type] || []).map((row, idx) => (
            <div key={idx} style={{ padding: 16, border: '1px solid var(--gray-200)', borderRadius: 8, borderLeft: `4px solid ${color}` }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15, minWidth: 50 }}>{row.poNo}</span>
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>COs: {row.cosMapped?.join(', ') || '—'}</span>
              </div>
              <div className="grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Action Taken</label>
                  <textarea className="form-input form-textarea" style={{ minHeight: 60 }}
                    value={row.actionTaken || ''} disabled={!isChampion}
                    onChange={e => updateRow(type, idx, 'actionTaken', e.target.value)}
                    placeholder="Describe what action was taken..." />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Plan for Next Year</label>
                  <textarea className="form-input form-textarea" style={{ minHeight: 60 }}
                    value={row.planNextYear || ''} disabled={!isChampion}
                    onChange={e => updateRow(type, idx, 'planNextYear', e.target.value)}
                    placeholder="Plan to maintain/improve..." />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Justification</label>
                  <input className="form-input" value={row.justification || ''} disabled={!isChampion}
                    onChange={e => updateRow(type, idx, 'justification', e.target.value)}
                    placeholder="Reason for this attainment level..." />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Proof Drive Link</label>
                  <input className="form-input" value={row.driveLink || ''} disabled={!isChampion}
                    onChange={e => updateRow(type, idx, 'driveLink', e.target.value)}
                    placeholder="https://drive.google.com/..." />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">⚡ Action Taken Report</h2>
          <p className="section-subtitle">Format: ACAD/DI/14C — Document actions for high and low PO attainment</p>
        </div>
        {isChampion && <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Report'}
        </button>}
      </div>

      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        💡 This section is auto-populated from attainment results. Calculate attainment first, then fill in the action details.
      </div>

      <Section type="highAttainment" title="High Attainment POs (≥75%)" color="#22c55e" emoji="✅" />
      <Section type="lowAttainment" title="Low Attainment POs (&lt;75%)" color="#ef4444" emoji="⚠️" />

      {isChampion && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Action Report'}
          </button>
        </div>
      )}
    </div>
  );
}
