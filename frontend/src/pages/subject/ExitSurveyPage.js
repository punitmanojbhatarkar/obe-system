// ExitSurveyPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function ExitSurveyPage() {
  const { contextId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [cos, setCOs] = useState([]);

  useEffect(() => {
    Promise.all([API.get(`/exit-survey/${contextId}`), API.get(`/cos/${contextId}`)]).then(([sRes, cRes]) => {
      setSurvey(sRes.data._id ? sRes.data : null);
      if (sRes.data.questions) setQuestions(sRes.data.questions);
      const activeCOs = (cRes.data.cos || []).filter(c => c.isActive);
      setCOs(activeCOs);
      if (!sRes.data._id && activeCOs.length > 0) {
        setQuestions(activeCOs.flatMap((co, ci) => [
          { qNo: ci*2+1, statement: `The course helped me understand ${co.coNo} effectively.`, coMapped: co.coNo },
          { qNo: ci*2+2, statement: `I can apply the concepts of ${co.coNo} in real scenarios.`, coMapped: co.coNo },
        ]));
      }
    }).finally(() => setLoading(false));
  }, [contextId]);

  const setupSurvey = async () => {
    try { const r = await API.post(`/exit-survey/${contextId}/setup`, { questions }); setSurvey(r.data); toast.success('Survey created!'); }
    catch { toast.error('Failed to create survey'); }
  };

  const closeSurvey = async () => {
    if (!window.confirm('Close survey? Students cannot submit after this.')) return;
    try { await API.patch(`/exit-survey/${contextId}/close`); setSurvey(s => ({...s, isOpen: false})); toast.success('Survey closed'); }
    catch { toast.error('Failed'); }
  };

  const surveyURL = survey ? `${window.location.origin}/survey/${survey.surveyLink}` : '';

  if (loading) return <div className="flex-center" style={{ height:300 }}><div className="spinner" style={{ width:36, height:36 }} /></div>;

  return (
    <div className="page-container">
      <h2 className="section-title">📣 Course Exit Survey</h2>
      <p className="section-subtitle">Create a survey for students to provide indirect attainment feedback (5-point scale)</p>

      {survey ? (
        <>
          <div className={`alert ${survey.isOpen ? 'alert-success' : 'alert-warning'}`} style={{ marginBottom:16 }}>
            {survey.isOpen ? '🟢 Survey is OPEN — Students can submit responses' : '🔴 Survey is CLOSED'}
          </div>
          {survey.isOpen && (
            <div className="card" style={{ marginBottom:16 }}>
              <label className="form-label">Survey Link (share with students)</label>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input className="form-input" value={surveyURL} readOnly style={{ fontFamily:'monospace', fontSize:12 }} />
                <button className="btn btn-outline" onClick={() => { navigator.clipboard.writeText(surveyURL); toast.success('Copied!'); }}>📋 Copy</button>
                <button className="btn btn-danger" onClick={closeSurvey}>Close Survey</button>
              </div>
            </div>
          )}
          <div className="card" style={{ marginBottom:16 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'var(--primary)', marginBottom:12 }}>Responses: {survey.responses?.length || 0}</h3>
            {survey.coAverages?.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {survey.coAverages.map(ca => (
                  <div key={ca.coNo} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 12px', background:'var(--gray-50)', borderRadius:6 }}>
                    <span style={{ fontWeight:700, color:'var(--primary)', minWidth:40 }}>{ca.coNo}</span>
                    <div style={{ flex:1, height:8, background:'var(--gray-200)', borderRadius:4, overflow:'hidden' }}>
                      <div style={{ width:`${ca.avgPercent}%`, height:'100%', background: ca.avgPercent>=85?'#22c55e':ca.avgPercent>=75?'#eab308':'#f97316', borderRadius:4 }} />
                    </div>
                    <span style={{ fontSize:13, fontWeight:600, minWidth:60 }}>{ca.avgPercent?.toFixed(1)}%</span>
                    <span style={{ fontSize:12, color:'var(--gray-500)' }}>Level {ca.attainmentLevel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card" style={{ marginBottom:16 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'var(--primary)', marginBottom:12 }}>Survey Questions (auto-generated, editable)</h3>
          {questions.map((q, i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
              <span style={{ minWidth:30, fontSize:12, color:'var(--gray-500)' }}>Q{q.qNo}</span>
              <input className="form-input" value={q.statement} onChange={e => { const qs=[...questions]; qs[i]={...qs[i],statement:e.target.value}; setQuestions(qs); }} />
              <select className="form-input form-select" style={{ width:90 }} value={q.coMapped} onChange={e => { const qs=[...questions]; qs[i]={...qs[i],coMapped:e.target.value}; setQuestions(qs); }}>
                {cos.map(c => <option key={c.coNo}>{c.coNo}</option>)}
              </select>
            </div>
          ))}
          <button className="btn btn-primary" style={{ marginTop:12 }} onClick={setupSurvey}>🚀 Create & Open Survey</button>
        </div>
      )}
    </div>
  );
}
