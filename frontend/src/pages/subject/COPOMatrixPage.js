import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const PO_LIST = ['PO1','PO2','PO3','PO4','PO5','PO6','PO7','PO8','PO9','PO10','PO11','PSO1','PSO2','PSO3'];
const CO_LIST = ['CO1','CO2','CO3','CO4','CO5','CO6'];

const cellBg = (val) => {
  if (val === 3) return '#dcfce7';
  if (val === 2) return '#fef9c3';
  if (val === 1) return '#ffedd5';
  return '#f9fafb';
};

export default function COPOMatrixPage() {
  const { contextId } = useParams();
  const { user } = useAuth();
  const [matrix, setMatrix] = useState(() =>
    CO_LIST.map(coNo => { const row = { coNo }; PO_LIST.forEach(p => row[p] = null); return row; })
  );
  const [averages, setAverages] = useState({});
  const [cos, setCOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isChampion = user.role === 'champion' || user.role === 'admin';

  useEffect(() => {
    Promise.all([
      API.get(`/copo-matrix/${contextId}`),
      API.get(`/cos/${contextId}`)
    ]).then(([matRes, coRes]) => {
      if (matRes.data.matrix?.length) setMatrix(matRes.data.matrix);
      if (matRes.data.averages) setAverages(matRes.data.averages);
      if (coRes.data.cos) setCOs(coRes.data.cos.filter(c => c.isActive));
    }).finally(() => setLoading(false));
  }, [contextId]);

  const updateCell = (coIdx, po, val) => {
    setMatrix(prev => prev.map((row, i) => i === coIdx ? { ...row, [po]: val } : row));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.post(`/copo-matrix/${contextId}`, { matrix });
      setAverages(res.data.averages || {});
      toast.success('CO-PO Matrix saved!');
    } catch (err) {
      toast.error('Failed to save');
    } finally { setSaving(false); }
  };

  const recalcFromPI = async () => {
    try {
      const res = await API.get(`/pi-mapping/${contextId}`);
      if (!res.data.mappings?.length) return toast.error('PI Mapping not done yet');
      await API.post(`/pi-mapping/${contextId}`, { mappings: res.data.mappings });
      const updated = await API.get(`/copo-matrix/${contextId}`);
      setMatrix(updated.data.matrix);
      setAverages(updated.data.averages || {});
      toast.success('Matrix refreshed from PI Mapping!');
    } catch { toast.error('Failed to recalculate'); }
  };

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">📊 CO-PO Mapping Matrix</h2>
          <p className="section-subtitle">Course Articulation Matrix — correlation values: 1=Low, 2=Medium, 3=High</p>
        </div>
        <div className="flex-gap">
          {isChampion && <>
            <button className="btn btn-outline" onClick={recalcFromPI}>🔄 Refresh from PI</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" />Saving...</> : '💾 Save Matrix'}
            </button>
          </>}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['3 - High',cellBg(3)],['2 - Medium',cellBg(2)],['1 - Low',cellBg(1)],['Blank - Not Mapped',cellBg(null)]].map(([label, bg]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 16, height: 16, background: bg, border: '1px solid var(--gray-200)', borderRadius: 3 }} />
            <span style={{ color: 'var(--gray-700)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 70, textAlign: 'left', paddingLeft: 12 }}>CO</th>
                {PO_LIST.map(po => <th key={po} style={{ width: 52 }}>{po}</th>)}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, coIdx) => {
                const coInfo = cos.find(c => c.coNo === row.coNo);
                if (!coInfo && row.coNo) {
                  // Still show row even if CO not defined
                }
                return (
                  <tr key={row.coNo}>
                    <td className="td-left" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13, paddingLeft: 12 }}>
                      {row.coNo}
                      {coInfo && <div style={{ fontSize: 10, color: 'var(--gray-500)', fontWeight: 400, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{coInfo.bloomsLevel}</div>}
                    </td>
                    {PO_LIST.map(po => (
                      <td key={po} style={{ background: cellBg(row[po]), padding: '4px 2px', textAlign: 'center' }}>
                        {isChampion ? (
                          <select value={row[po] || ''} onChange={e => updateCell(coIdx, po, e.target.value ? Number(e.target.value) : null)}
                            style={{ width: 44, border: 'none', background: 'transparent', textAlign: 'center', fontSize: 13, fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                            <option value="">—</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                          </select>
                        ) : (
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{row[po] || '—'}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {/* Averages row */}
              <tr style={{ background: '#f0f4f8', borderTop: '2px solid var(--primary)' }}>
                <td className="td-left" style={{ fontWeight: 700, fontSize: 12, paddingLeft: 12, color: 'var(--primary)' }}>AVG</td>
                {PO_LIST.map(po => (
                  <td key={po} style={{ fontWeight: 700, fontSize: 12, color: 'var(--primary)' }}>
                    {averages[po] ? averages[po].toFixed(2) : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CO statements reference */}
      {cos.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>CO Reference</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cos.map(co => (
              <div key={co.coNo} style={{ display: 'flex', gap: 12, fontSize: 12, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 6, borderLeft: '3px solid var(--primary)' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{co.coNo}</span>
                <span style={{ color: 'var(--gray-700)' }}>{co.statement}</span>
                <span className="badge badge-info" style={{ flexShrink: 0 }}>{co.bloomsLevel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isChampion && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" />Saving...</> : '💾 Save CO-PO Matrix'}
          </button>
        </div>
      )}
    </div>
  );
}
