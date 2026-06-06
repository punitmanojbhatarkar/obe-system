import React, { useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const STEPS_INFO = [
  { key: 'vision', label: 'Vision & Mission', icon: '🏛️' },
  { key: 'cos', label: 'Course Outcomes', icon: '🎯' },
  { key: 'pi', label: 'PI Mapping', icon: '🗺️' },
  { key: 'copo', label: 'CO-PO Matrix', icon: '📊' },
  { key: 'activities', label: 'Activities Defined', icon: '📋' },
  { key: 'students', label: 'Students Uploaded', icon: '👥' },
  { key: 'marks', label: 'Marks Entered', icon: '📝' },
  { key: 'survey', label: 'Exit Survey', icon: '📣' },
  { key: 'attainment', label: 'Attainment Calculated', icon: '📈' },
  { key: 'action', label: 'Action Report', icon: '⚡' },
];

export default function ReportPage() {
  const { contextId } = useParams();
  const { context } = useOutletContext();
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const completedSteps = context?.completedSteps || [];
  const allDone = STEPS_INFO.every(s => completedSteps.includes(s.key));
  const completedCount = STEPS_INFO.filter(s => completedSteps.includes(s.key)).length;

  const handleGenerate = async () => {
    if (!allDone) {
      if (!window.confirm('Some steps are incomplete. Generate PDF anyway?')) return;
    }
    setGenerating(true);
    try {
      const res = await API.get(`/pdf/${contextId}/generate`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CourseFile_${context?.subjectCode}_${context?.academicYear}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('PDF generation failed. Ensure all data is saved.');
    } finally { setGenerating(false); }
  };

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      const token = localStorage.getItem('obe_token');
      window.open(`${process.env.REACT_APP_API_URL || '/api'}/pdf/${contextId}/preview?token=${token}`, '_blank');
    } catch { toast.error('Preview failed'); }
    finally { setPreviewing(false); }
  };

  const progress = Math.round((completedCount / STEPS_INFO.length) * 100);

  return (
    <div className="page-container">
      <div style={{ marginBottom: 20 }}>
        <h2 className="section-title">📄 Generate PDF Course File</h2>
        <p className="section-subtitle">Format: ACAD/INST/1 to INST/16 — Complete NAAC-compliant course file</p>
      </div>

      {/* Progress card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>Course File Completion</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{completedCount} of {STEPS_INFO.length} steps completed</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: allDone ? 'var(--success)' : 'var(--primary)' }}>{progress}%</div>
        </div>
        <div style={{ height: 10, background: 'var(--gray-200)', borderRadius: 5, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: allDone ? 'var(--success)' : 'var(--accent)', borderRadius: 5, transition: 'width 0.3s' }} />
        </div>

        {/* Steps checklist */}
        <div className="grid-2" style={{ gap: 8 }}>
          {STEPS_INFO.map(step => {
            const done = completedSteps.includes(step.key);
            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: done ? '#f0fdf4' : '#fafafa', border: `1px solid ${done ? '#bbf7d0' : 'var(--gray-200)'}` }}>
                <span style={{ fontSize: 18 }}>{step.icon}</span>
                <span style={{ fontSize: 13, flex: 1, color: done ? 'var(--gray-900)' : 'var(--gray-500)' }}>{step.label}</span>
                {done
                  ? <span style={{ color: 'var(--success)', fontSize: 18 }}>✅</span>
                  : <span style={{ color: 'var(--gray-300)', fontSize: 18 }}>○</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* PDF Contents */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>📑 PDF Will Include:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, fontSize: 12, color: 'var(--gray-700)' }}>
          {['Cover Page', 'Index', '1A - Vision/Mission Institute', '1B - Dept Vision/Mission + PEOs', '1C - POs & PSOs', '6A - PI Mapping Matrix', '6B - Course Description', '6C - CO-PO Matrix', 'CO Statements', '14A - CO Attainment', '14B - PO Attainment', '14C - Action Report'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
              <span style={{ color: 'var(--success)' }}>✓</span> {item}
            </div>
          ))}
        </div>
      </div>

      {/* Subject info summary */}
      {context && (
        <div className="card" style={{ marginBottom: 20, background: 'var(--accent-light)', border: '1px solid #bee3f8' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>📋 Course File Details</h3>
          <div className="grid-2" style={{ fontSize: 13, gap: 6 }}>
            {[
              ['Subject', context.subjectName],
              ['Code', context.subjectCode],
              ['Branch', context.branch],
              ['Semester', context.semester],
              ['Academic Year', context.academicYear],
              ['Class', context.class || '-'],
              ['Divisions', context.divisions?.join(', ') || '-'],
              ['Champion', '-'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--gray-500)', minWidth: 100 }}>{label}:</span>
                <span style={{ fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button className="btn btn-outline btn-lg" onClick={handlePreview} disabled={previewing}>
          {previewing ? 'Opening...' : '👁️ Preview in Browser'}
        </button>
        <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={generating}
          style={{ background: allDone ? 'var(--success)' : 'var(--primary)' }}>
          {generating ? <><span className="spinner" />Generating PDF...</> : '📥 Download PDF Course File'}
        </button>
      </div>

      {!allDone && (
        <div className="alert alert-warning" style={{ marginTop: 16 }}>
          ⚠️ <strong>{STEPS_INFO.length - completedCount} steps incomplete.</strong> Complete all steps for a full course file. You can still generate a partial PDF.
        </div>
      )}
    </div>
  );
}
