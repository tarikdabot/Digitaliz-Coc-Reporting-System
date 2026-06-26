import React, { useEffect, useState } from 'react';
import { useCandidates } from '../context/CandidatesContext';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import CandidateModal from '../components/CandidateModal';
import { showToast } from '../utils/toast';
import { exportCandidates } from '../utils/excelExport';

const TH = { background: '#f8fafc', padding: '12px 18px', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0', textAlign: 'left', whiteSpace: 'nowrap' };
const TD = { padding: '12px 18px', fontSize: 14, borderBottom: '1px solid #e2e8f0' };

export default function StudentListPage() {
  const { candidates, fetchCandidates, bulkUpdateStatus, deleteCandidate } = useCandidates();
  const [selected,   setSelected]   = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [deleteId,   setDeleteId]   = useState(null);
  const [viewId,     setViewId]     = useState(null);
  const [editId,     setEditId]     = useState(null);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  // Only Registered / Assessed / NotAssessed rows are selectable.
  // Competent & Non-Competent are locked — must be changed via Assessed List.
  const selectable  = candidates.filter(c => ['Registered','Assessed','NotAssessed'].includes(c.status));
  const toggleOne   = id => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll   = checked => setSelected(checked ? new Set(selectable.map(c => c._id)) : new Set());
  const allChecked  = selectable.length > 0 && selectable.every(c => selected.has(c._id));
  const someChecked = !allChecked && selectable.some(c => selected.has(c._id));

  const applyBulk = async () => {
    if (!bulkStatus)         { showToast('Choose a status first.', 'danger'); return; }
    if (selected.size === 0) { showToast('Select at least one candidate.', 'danger'); return; }
    await bulkUpdateStatus([...selected], bulkStatus);
    showToast(`${selected.size} candidates updated to ${bulkStatus}.`);
    setSelected(new Set()); setBulkStatus('');
  };

  const confirmDelete = async () => {
    await deleteCandidate(deleteId);
    setDeleteId(null);
    showToast('Candidate deleted.', 'danger');
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>All Registered Students</h3>
        <button onClick={() => exportCandidates(candidates)}
          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="fa-solid fa-file-excel" /> Export Registry
        </button>
      </div>

      {/* ── Bulk action toolbar — identical pattern to Assessed List ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, flexWrap: 'wrap' }}>
        <i className="fa-solid fa-list-check" style={{ color: '#0284c7' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0284c7', minWidth: 100 }}>{selected.size} selected</span>
        <span style={{ color: '#93c5fd' }}>|</span>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>Change status to:</label>
        <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
          style={{ padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, background: '#fff', cursor: 'pointer' }}>
          <option value="">— Select new status —</option>
          <option value="Registered">Registered (default)</option>
          <option value="Assessed">Assessed (took exam — pending result)</option>
          <option value="NotAssessed">Not Assessed (did not take exam)</option>
        </select>
        <button onClick={applyBulk}
          style={{ padding: '7px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
          <i className="fa-solid fa-check" /> Apply
        </button>
        <button onClick={() => setSelected(new Set())}
          style={{ padding: '7px 12px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="fa-solid fa-xmark" /> Clear
        </button>
        <span style={{ fontSize: 12, color: '#64748b' }}>☑ Check rows to select &nbsp;·&nbsp; Header checkbox = select all eligible</span>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...TH, width: 50, textAlign: 'center' }}>
                <input type="checkbox" checked={allChecked}
                  ref={el => { if (el) el.indeterminate = someChecked; }}
                  onChange={e => toggleAll(e.target.checked)}
                  style={{ accentColor: '#2563eb', width: 15, height: 15, cursor: 'pointer' }}
                  title="Select all eligible rows" />
              </th>
              {['#','Full Name','Sex','Institution','Department','Status','Actions'].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr><td colSpan={8} style={{ ...TD, textAlign: 'center', color: '#64748b', padding: 36 }}>No candidates yet.</td></tr>
            ) : candidates.map((c, idx) => {
              const locked = ['Competent','Non-Competent'].includes(c.status);
              const isSel  = selected.has(c._id);
              const name   = c.name || [c.firstName, c.middleName, c.lastName].filter(Boolean).join(' ');
              return (
                <tr key={c._id} style={{ background: isSel ? '#eff6ff' : idx % 2 === 0 ? '#fff' : '#fafafa', transition: 'background .1s' }}>
                  <td style={{ ...TD, textAlign: 'center', width: 50 }}>
                    {locked ? (
                      <span style={{ fontSize: 12, color: '#94a3b8' }} title="Final result — change via Assessed List">{idx + 1}</span>
                    ) : (
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleOne(c._id)}
                          style={{ accentColor: '#2563eb', width: 15, height: 15, cursor: 'pointer' }} />
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{idx + 1}</span>
                      </label>
                    )}
                  </td>
                  <td style={TD}>{idx + 1}</td>
                  <td style={{ ...TD, fontWeight: 600 }}>{name}</td>
                  <td style={TD}>{c.sex}</td>
                  <td style={TD}>{c.institution}</td>
                  <td style={{ ...TD, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.dept}>{c.dept}</td>
                  <td style={TD}><StatusBadge status={c.status} /></td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button onClick={() => setViewId(c._id)} style={{ padding: '5px 10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}><i className="fa-solid fa-eye" /></button>
                      <button onClick={() => setEditId(c._id)} style={{ padding: '5px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}><i className="fa-solid fa-pen-to-square" /></button>
                      <button onClick={() => setDeleteId(c._id)} style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}><i className="fa-solid fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal isOpen={!!deleteId} danger title="Confirm Deletion"
        message="Permanently delete this candidate? This cannot be undone."
        confirmLabel="Delete Permanently" onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      {viewId && <CandidateModal id={viewId} mode="view" onClose={() => setViewId(null)} onEdit={id => { setViewId(null); setEditId(id); }} />}
      {editId && <CandidateModal id={editId} mode="edit" onClose={() => setEditId(null)} />}
    </div>
  );
}
