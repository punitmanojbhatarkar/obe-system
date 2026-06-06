import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const TYPES = ['CO_CHANGE','MAPPING_CHANGE','ATTAINMENT_LEVEL','MARKS_CORRECTION','OTHER'];

export default function SuggestionsPage() {
  const { contextId } = useParams();
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'CO_CHANGE', description: '' });
  const [reviewForm, setReviewForm] = useState({});
  const isChampion = user.role === 'champion' || user.role === 'admin';
  const isInstructor = user.role === 'instructor';

  const load = () => API.get(`/suggestions/${contextId}`).then(r => setSuggestions(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [contextId]);

  const handleSubmit = async () => {
    if (!form.description.trim()) return toast.error('Please describe the suggestion');
    try {
      await API.post(`/suggestions/${contextId}`, form);
      toast.success('Suggestion submitted!');
      setShowForm(false);
      setForm({ type: 'CO_CHANGE', description: '' });
      load();
    } catch { toast.error('Failed to submit'); }
  };

  const handleReview = async (id, status) => {
    const comment = reviewForm[id] || '';
    try {
      await API.patch(`/suggestions/${contextId}/${id}`, { status, championComment: comment });
      toast.success(`Suggestion ${status}`);
      load();
    } catch { toast.error('Failed to review'); }
  };

  const statusColors = { pending: '#eab308', approved: '#22c55e', rejected: '#ef4444' };
  const typeLabels = { CO_CHANGE: 'CO Change', MAPPING_CHANGE: 'Mapping Change', ATTAINMENT_LEVEL: 'Attainment Level', MARKS_CORRECTION: 'Marks Correction', OTHER: 'Other' };

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  const pending = suggestions.filter(s => s.status === 'pending');
  const reviewed = suggestions.filter(s => s.status !== 'pending');

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">💬 Suggestions</h2>
          <p className="section-subtitle">Instructors can suggest changes; Champion reviews and approves/rejects</p>
        </div>
        <div className="flex-gap">
          {pending.length > 0 && <span className="badge badge-warning">{pending.length} Pending</span>}
          {isInstructor && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Suggestion</button>}
        </div>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12 }}>⏳ Pending Review ({pending.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pending.map(s => (
              <div key={s._id} className="card" style={{ padding: 16, borderLeft: '4px solid #eab308' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge badge-warning">{typeLabels[s.type]}</span>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>by {s.instructorId?.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-800)', marginBottom: 12, lineHeight: 1.6 }}>{s.description}</p>
                {isChampion && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <input className="form-input" placeholder="Add comment (optional)"
                        value={reviewForm[s._id] || ''}
                        onChange={e => setReviewForm(f => ({ ...f, [s._id]: e.target.value }))} />
                    </div>
                    <button className="btn btn-success btn-sm" onClick={() => handleReview(s._id, 'approved')}>✓ Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleReview(s._id, 'rejected')}>✕ Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12 }}>📋 Reviewed ({reviewed.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reviewed.map(s => (
              <div key={s._id} className="card" style={{ padding: 14, borderLeft: `4px solid ${statusColors[s.status]}`, opacity: 0.9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <span className="badge" style={{ background: statusColors[s.status], color: 'white' }}>{s.status}</span>
                      <span className="badge badge-gray">{typeLabels[s.type]}</span>
                      <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>by {s.instructorId?.name}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 4 }}>{s.description}</p>
                    {s.championComment && <p style={{ fontSize: 12, color: 'var(--gray-500)', fontStyle: 'italic' }}>Champion: "{s.championComment}"</p>}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)', flexShrink: 0, marginLeft: 12 }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
          <h3 style={{ color: 'var(--gray-700)', marginBottom: 8 }}>No suggestions yet</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>Instructors can submit suggestions for the Champion to review.</p>
        </div>
      )}

      {/* Add Suggestion Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>New Suggestion</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Type of Change</label>
                <select className="form-input form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-input form-textarea" style={{ minHeight: 100 }}
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe exactly what you want to change and why..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Submit Suggestion</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
