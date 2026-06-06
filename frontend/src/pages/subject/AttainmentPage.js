import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const levelColor = (level) => {
  if (!level && level !== 0) return 'var(--gray-200)';
  if (level >= 3) return '#22c55e';
  if (level >= 2) return '#eab308';
  if (level >= 1) return '#f97316';
  return '#ef4444';
};

const levelLabel = (level) => {
  if (!level && level !== 0) return '—';
  if (level >= 3) return `${level.toFixed ? level.toFixed(4) : level} ✓`;
  if (level >= 2) return level.toFixed ? level.toFixed(4) : level;
  if (level >= 1) return level.toFixed ? level.toFixed(4) : level;
  return level.toFixed ? level.toFixed(4) : level;
};

export default function AttainmentPage() {
  const { contextId } = useParams();
  const { user } = useAuth();
  const [attainment, setAttainment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [weights, setWeights] = useState({ direct: 0.8, indirect: 0.2 });
  const [activeTab, setActiveTab] = useState('co');
  const isChampion = user.role === 'champion' || user.role === 'admin';

  useEffect(() => {
    API.get(`/attainment/${contextId}`)
      .then(r => { setAttainment(r.data); setWeights({ direct: r.data.directWeight, indirect: r.data.indirectWeight }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contextId]);

  const calculate = async () => {
    setCalculating(true);
    try {
      const res = await API.post(`/attainment/${contextId}/calculate`);
      setAttainment(res.data);
      setWeights({ direct: res.data.directWeight, indirect: res.data.indirectWeight });
      toast.success('Attainment calculated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally { setCalculating(false); }
  };

  const saveWeights = async () => {
    try {
      await API.patch(`/attainment/${contextId}/weights`, { directWeight: weights.direct, indirectWeight: weights.indirect });
      toast.success('Weights saved. Recalculate to apply.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  const coData = attainment?.coAttainment || [];
  const poData = attainment?.poAttainment?.filter(p => p.target !== null) || [];
  const thresholds = attainment?.thresholds || { level1: 65, level2: 75, level3: 85 };

  const chartData = coData.map(co => ({
    name: co.coNo,
    'Direct Level': co.directLevel || 0,
    'Indirect Level': co.indirectLevel || 0,
    'Final Level': co.finalLevel || 0,
  }));

  const radarData = poData.map(po => ({
    po: po.poNo,
    achieved: parseFloat((po.achieved || 0).toFixed(2)),
    target: parseFloat((po.target || 0).toFixed(2)),
  }));

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">📈 CO & PO Attainment</h2>
          <p className="section-subtitle">Calculate and view course outcome attainment levels</p>
        </div>
        {isChampion && (
          <button className="btn btn-primary btn-lg" onClick={calculate} disabled={calculating}>
            {calculating ? <><span className="spinner" />Calculating...</> : '⚙️ Calculate Attainment'}
          </button>
        )}
      </div>

      {/* Thresholds info */}
      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>ATTAINMENT THRESHOLDS</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[['Level 1', thresholds.level1, '#f97316'], ['Level 2', thresholds.level2, '#eab308'], ['Level 3', thresholds.level3, '#22c55e']].map(([label, val, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, background: color, borderRadius: 2 }} />
                  <span style={{ fontSize: 12, color: 'var(--gray-700)' }}>{label}: ≥{val}%</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--gray-200)', paddingLeft: 24 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>WEIGHTAGE</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label style={{ fontSize: 12 }}>Direct: <input type="number" step="0.1" min="0" max="1" value={weights.direct}
                onChange={e => setWeights(w => ({ ...w, direct: parseFloat(e.target.value), indirect: parseFloat((1 - e.target.value).toFixed(1)) }))}
                disabled={!isChampion}
                style={{ width: 60, padding: '2px 6px', border: '1px solid var(--gray-200)', borderRadius: 4, fontSize: 12 }} /></label>
              <label style={{ fontSize: 12 }}>Indirect: <input type="number" step="0.1" min="0" max="1" value={weights.indirect}
                onChange={e => setWeights(w => ({ ...w, indirect: parseFloat(e.target.value), direct: parseFloat((1 - e.target.value).toFixed(1)) }))}
                disabled={!isChampion}
                style={{ width: 60, padding: '2px 6px', border: '1px solid var(--gray-200)', borderRadius: 4, fontSize: 12 }} /></label>
              {isChampion && <button className="btn btn-sm btn-outline" onClick={saveWeights}>Save Weights</button>}
            </div>
          </div>
        </div>
      </div>

      {!attainment ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔢</div>
          <h3 style={{ color: 'var(--gray-700)', marginBottom: 8 }}>No attainment data yet</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 20 }}>Make sure students, marks, and exit survey are uploaded, then click Calculate.</p>
          {isChampion && <button className="btn btn-primary" onClick={calculate} disabled={calculating}>
            {calculating ? 'Calculating...' : '⚙️ Calculate Now'}
          </button>}
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="tabs">
            <div className={`tab ${activeTab === 'co' ? 'active' : ''}`} onClick={() => setActiveTab('co')}>CO Attainment</div>
            <div className={`tab ${activeTab === 'po' ? 'active' : ''}`} onClick={() => setActiveTab('po')}>PO Attainment</div>
            <div className={`tab ${activeTab === 'charts' ? 'active' : ''}`} onClick={() => setActiveTab('charts')}>Charts</div>
            {attainment.batchWise?.length > 0 && <div className={`tab ${activeTab === 'batch' ? 'active' : ''}`} onClick={() => setActiveTab('batch')}>Batch-wise</div>}
          </div>

          {activeTab === 'co' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>CO</th>
                      <th>Target %</th>
                      <th>IA %</th>
                      <th>MSE %</th>
                      <th>CIE %</th>
                      <th>CIE Level</th>
                      <th>ESE %</th>
                      <th>ESE Level</th>
                      <th>Direct Avg%</th>
                      <th>Direct Level</th>
                      <th>Survey %</th>
                      <th>Indirect Level</th>
                      <th style={{ background: '#1a365d' }}>Final Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coData.map(co => (
                      <tr key={co.coNo}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{co.coNo}</td>
                        <td>55%</td>
                        <td>{co.iaPercent?.toFixed(2) ?? '—'}</td>
                        <td>{co.msePercent?.toFixed(2) ?? '—'}</td>
                        <td>{co.ciePercent?.toFixed(2) ?? '—'}</td>
                        <td><span style={{ background: levelColor(co.cieLevel), color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12 }}>{co.cieLevel ?? '—'}</span></td>
                        <td>{co.esePercent?.toFixed(2) ?? '—'}</td>
                        <td><span style={{ background: levelColor(co.eseLevel), color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12 }}>{co.eseLevel ?? '—'}</span></td>
                        <td>{co.directAvgPercent?.toFixed(2) ?? '—'}</td>
                        <td><span style={{ background: levelColor(co.directLevel), color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12 }}>{co.directLevel}</span></td>
                        <td>{co.surveyPercent?.toFixed(2) ?? '—'}</td>
                        <td><span style={{ background: levelColor(co.indirectLevel), color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12 }}>{co.indirectLevel}</span></td>
                        <td><span style={{ background: levelColor(co.finalLevel), color: 'white', padding: '3px 10px', borderRadius: 4, fontWeight: 700, fontSize: 13 }}>{co.finalLevel?.toFixed(4) ?? '—'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'po' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>PO / PSO</th>
                      <th>Target</th>
                      <th>Achieved</th>
                      <th>% Achievement</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poData.map(po => {
                      const pct = po.percentAchievement || 0;
                      return (
                        <tr key={po.poNo}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{po.poNo}</td>
                          <td>{po.target?.toFixed(2) ?? '—'}</td>
                          <td>{po.achieved?.toFixed(2) ?? '—'}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 8, background: 'var(--gray-200)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 85 ? '#22c55e' : pct >= 75 ? '#eab308' : pct >= 65 ? '#f97316' : '#ef4444', borderRadius: 4 }} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600, minWidth: 50 }}>{pct.toFixed(2)}%</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${pct >= 75 ? 'badge-success' : 'badge-danger'}`}>
                              {pct >= 75 ? 'Attained' : 'Not Attained'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>CO Attainment Levels</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 3]} ticks={[0,1,2,3]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Direct Level" fill="#3182ce" radius={[4,4,0,0]} />
                    <Bar dataKey="Indirect Level" fill="#9f7aea" radius={[4,4,0,0]} />
                    <Bar dataKey="Final Level" fill="#22c55e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {radarData.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>PO Attainment Radar</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="po" tick={{ fontSize: 11 }} />
                      <Radar name="Achieved" dataKey="achieved" stroke="#3182ce" fill="#3182ce" fillOpacity={0.4} />
                      <Radar name="Target" dataKey="target" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {activeTab === 'batch' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {attainment.batchWise?.map(bw => (
                <div key={bw.batch} className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Batch: {bw.batch}</h3>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {bw.coAttainment?.map(co => (
                      <div key={co.coNo} style={{ padding: '8px 16px', borderRadius: 8, background: levelColor(co.finalLevel), color: 'white', textAlign: 'center', minWidth: 80 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{co.coNo}</div>
                        <div style={{ fontSize: 12 }}>Level {co.finalLevel?.toFixed ? co.finalLevel.toFixed(2) : co.finalLevel}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--gray-500)' }}>
            Last calculated: {attainment.calculatedAt ? new Date(attainment.calculatedAt).toLocaleString() : '—'}
          </div>
        </>
      )}
    </div>
  );
}
