import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function SurveyFillPage() {
  const { token } = useParams();
  const [survey, setSurvey] = useState(null);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prn, setPRN] = useState('');
  const [prnVerified, setPRNVerified] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    API.get(`/exit-survey/view/${token}`)
      .then(r => { setSurvey(r.data.survey); setContext(r.data.context); })
      .catch(() => toast.error('Survey not found or closed'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    if (!prn.trim()) return toast.error('Please enter your PRN');
    const allAnswered = survey.questions.every(q => answers[q.qNo]);
    if (!allAnswered) return toast.error('Please answer all questions');
    setSubmitting(true);
    try {
      const ans = survey.questions.map(q => ({ qNo: q.qNo, coMapped: q.coMapped, score: answers[q.qNo] }));
      await API.post(`/exit-survey/submit/${token}`, { studentPRN: prn, answers: ans });
      setSubmitted(true);
      toast.success('Survey submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const SCALE = [
    { val: 1, label: 'Strongly Disagree', color: '#ef4444' },
    { val: 2, label: 'Disagree', color: '#f97316' },
    { val: 3, label: 'Neutral', color: '#eab308' },
    { val: 4, label: 'Agree', color: '#22c55e' },
    { val: 5, label: 'Strongly Agree', color: '#16a34a' },
  ];

  if (loading) return (
    <div className="flex-center" style={{ height: '100vh', background: '#f0f4f8' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--gray-500)' }}>Loading survey...</p>
      </div>
    </div>
  );

  if (!survey) return (
    <div className="flex-center" style={{ height: '100vh', background: '#f0f4f8' }}>
      <div className="card" style={{ textAlign: 'center', padding: 48, maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
        <h2 style={{ color: 'var(--danger)', marginBottom: 8 }}>Survey Not Found</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>This survey is either closed or does not exist.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="flex-center" style={{ height: '100vh', background: 'linear-gradient(135deg, #1e3a5f, #2d5282)' }}>
      <div className="card" style={{ textAlign: 'center', padding: 48, maxWidth: 420 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: 'var(--success)', marginBottom: 8 }}>Thank You!</h2>
        <p style={{ color: 'var(--gray-700)', fontSize: 14, marginBottom: 4 }}>Your course exit survey has been submitted successfully.</p>
        <p style={{ color: 'var(--gray-500)', fontSize: 12 }}>Your feedback helps us improve the course for future students.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Header */}
      <div style={{ background: 'var(--primary)', color: 'white', padding: '16px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 2 }}>MIT Academy of Engineering, Pune</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Course Exit Survey</div>
        {context && <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{context.subjectName} ({context.subjectCode}) | Sem {context.semester} | {context.academicYear}</div>}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        {/* PRN Entry */}
        {!prnVerified ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎓</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>Enter Your PRN</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 24 }}>Please enter your Permanent Registration Number to begin the survey.</p>
            <div style={{ maxWidth: 300, margin: '0 auto' }}>
              <input className="form-input" placeholder="e.g. 12220XXXX" value={prn}
                onChange={e => setPRN(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && prn.trim() && setPRNVerified(true)}
                style={{ textAlign: 'center', fontSize: 16, marginBottom: 12 }} />
              <button className="btn btn-primary" style={{ width: '100%' }}
                onClick={() => prn.trim() && setPRNVerified(true)} disabled={!prn.trim()}>
                Start Survey →
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              📋 <strong>Instructions:</strong> Rate each statement on a scale of 1 (Strongly Disagree) to 5 (Strongly Agree). Answer all questions honestly.
            </div>

            {/* Scale legend */}
            <div className="card" style={{ padding: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                {SCALE.map(s => (
                  <div key={s.val} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <div style={{ width: 24, height: 24, background: s.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12 }}>{s.val}</div>
                    <span style={{ color: 'var(--gray-700)' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {survey.questions.map((q, idx) => (
                <div key={q.qNo} className="card" style={{ padding: 20, borderLeft: `4px solid ${answers[q.qNo] ? 'var(--success)' : 'var(--gray-200)'}` }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <span style={{ width: 28, height: 28, background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{q.qNo}</span>
                    <div>
                      <p style={{ fontSize: 14, color: 'var(--gray-900)', marginBottom: 4, lineHeight: 1.5 }}>{q.statement}</p>
                      <span className="badge badge-info" style={{ fontSize: 10 }}>{q.coMapped}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {SCALE.map(s => (
                      <button key={s.val} onClick={() => setAnswers(a => ({ ...a, [q.qNo]: s.val }))}
                        style={{ width: 52, height: 52, borderRadius: 10, border: `2px solid ${answers[q.qNo] === s.val ? s.color : 'var(--gray-200)'}`,
                          background: answers[q.qNo] === s.val ? s.color : 'white', color: answers[q.qNo] === s.val ? 'white' : 'var(--gray-700)',
                          fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'all 0.15s' }}>
                        {s.val}
                      </button>
                    ))}
                  </div>
                  {answers[q.qNo] && (
                    <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--gray-500)' }}>
                      {SCALE.find(s => s.val === answers[q.qNo])?.label}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>
                <span>Progress</span>
                <span>{Object.keys(answers).length} / {survey.questions.length} answered</span>
              </div>
              <div style={{ height: 8, background: 'var(--gray-200)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(Object.keys(answers).length / survey.questions.length) * 100}%`, background: 'var(--success)', borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
            </div>

            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><span className="spinner" />Submitting...</> : '✅ Submit Survey'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
