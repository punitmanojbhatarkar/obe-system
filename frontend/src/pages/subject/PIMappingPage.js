import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const CO_LIST = ['CO1','CO2','CO3','CO4','CO5','CO6'];

export default function PIMappingPage() {
  const { contextId } = useParams();
  const { user } = useAuth();
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState('PO1');
  const isChampion = user.role === 'champion' || user.role === 'admin';

  useEffect(() => {
    API.get(`/pi-mapping/${contextId}`).then(r => setMappings(r.data.mappings || [])).finally(() => setLoading(false));
  }, [contextId]);

  const toggleMapping = (idx, co) => {
    setMappings(prev => prev.map((m, i) => {
      if (i !== idx) return m;
      return { ...m, coMapping: { ...m.coMapping, [co]: m.coMapping[co] === 'Y' ? 'N' : 'Y' } };
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post(`/pi-mapping/${contextId}`, { mappings });
      toast.success('PI Mapping saved! CO-PO matrix auto-updated.');
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const poGroups = [...new Set(mappings.map(m => m.poNo))];
  const filteredMappings = mappings.filter(m => m.poNo === activeGroup);

  const getYCount = (poNo, co) => mappings.filter(m => m.poNo === poNo && m.coMapping[co] === 'Y').length;
  const getTotalIndicators = (poNo) => mappings.filter(m => m.poNo === poNo).length;

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">🗺️ Performance Indicator (PI) Mapping</h2>
          <p className="section-subtitle">Format: ACAD/DI/6A — Map Y/N for each indicator per CO. Auto-calculates CO-PO matrix.</p>
        </div>
        {isChampion && <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <><span className="spinner" />Saving...</> : '💾 Save & Update CO-PO Matrix'}
        </button>}
      </div>

      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        💡 Select Y/N for each Performance Indicator. The CO-PO Matrix will be <strong>automatically recalculated</strong>:
        <br />≥67% Y → 3 (High) | 34-66% Y → 2 (Medium) | 1-33% Y → 1 (Low) | 0% → Blank
      </div>

      {/* PO Group Tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20 }}>
        {poGroups.map(po => {
          const total = getTotalIndicators(po);
          const hasMappings = CO_LIST.some(co => getYCount(po, co) > 0);
          return (
            <button key={po} onClick={() => setActiveGroup(po)}
              style={{ padding: '6px 12px', borderRadius: 20, border: `1.5px solid ${activeGroup === po ? 'var(--primary)' : 'var(--gray-200)'}`,
                background: activeGroup === po ? 'var(--primary)' : hasMappings ? 'var(--accent-light)' : 'white',
                color: activeGroup === po ? 'white' : 'var(--gray-700)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {po} {hasMappings && '✓'}
            </button>
          );
        })}
      </div>

      {/* Summary row for active PO */}
      <div className="card" style={{ padding: 12, marginBottom: 12, background: 'var(--accent-light)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{activeGroup} Summary:</span>
          {CO_LIST.map(co => {
            const yCount = getYCount(activeGroup, co);
            const total = getTotalIndicators(activeGroup);
            const ratio = total > 0 ? yCount / total : 0;
            const level = ratio === 0 ? '—' : ratio <= 0.33 ? '1' : ratio <= 0.66 ? '2' : '3';
            return (
              <div key={co} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                <span style={{ fontWeight: 600 }}>{co}:</span>
                <span style={{ color: 'var(--gray-600)' }}>{yCount}/{total}</span>
                <span style={{ background: level==='3'?'#dcfce7':level==='2'?'#fef9c3':level==='1'?'#ffedd5':'var(--gray-100)', padding:'1px 6px', borderRadius:4, fontSize:11, fontWeight:700, color:level==='3'?'#166534':level==='2'?'#854d0e':level==='1'?'#9a3412':'var(--gray-500)' }}>→{level}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicator table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', paddingLeft: 12, width: 60 }}>No.</th>
                <th style={{ textAlign: 'left', width: 160 }}>Sub-Competency</th>
                <th style={{ textAlign: 'left' }}>Performance Indicator</th>
                {CO_LIST.map(co => <th key={co} style={{ width: 60 }}>{co}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredMappings.length === 0
                ? <tr><td colSpan={9} style={{ padding: 24, color: 'var(--gray-500)' }}>No indicators for {activeGroup}</td></tr>
                : filteredMappings.map((m, i) => {
                  const realIdx = mappings.findIndex(x => x === m);
                  return (
                    <tr key={i}>
                      <td style={{ fontSize: 11, color: 'var(--gray-500)', paddingLeft: 12 }}>{m.subCompetencyNo}</td>
                      <td style={{ fontSize: 11, color: 'var(--gray-600)', textAlign: 'left', lineHeight: 1.4 }}>{m.subCompetencyDesc}</td>
                      <td style={{ fontSize: 12, textAlign: 'left', lineHeight: 1.4 }}>{m.indicator}</td>
                      {CO_LIST.map(co => (
                        <td key={co}>
                          <button onClick={() => isChampion && toggleMapping(realIdx, co)}
                            style={{ width: 32, height: 32, borderRadius: 6, border: `2px solid ${m.coMapping[co]==='Y'?'var(--success)':'var(--gray-200)'}`,
                              background: m.coMapping[co]==='Y'?'var(--success)':'white', color: m.coMapping[co]==='Y'?'white':'var(--gray-300)',
                              fontWeight: 700, fontSize: 13, cursor: isChampion?'pointer':'default' }}>
                            {m.coMapping[co]==='Y'?'Y':'N'}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {isChampion && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save PI Mapping & Update CO-PO Matrix'}
          </button>
        </div>
      )}
    </div>
  );
}
