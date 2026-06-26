import React, { useEffect, useState } from 'react';
import { useCandidates } from '../context/CandidatesContext';
import { useSettings } from '../context/SettingsContext';
import StatusBadge from '../components/StatusBadge';
import CandidateModal from '../components/CandidateModal';
import { showToast } from '../utils/toast';
import { exportCandidates } from '../utils/excelExport';

const TH = { background: '#f8fafc', padding: '12px 18px', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0', textAlign: 'left', whiteSpace: 'nowrap' };
const TD = { padding: '12px 18px', fontSize: 14, borderBottom: '1px solid #e2e8f0' };

export default function ByDeptPage() {
  const { candidates, fetchCandidates, bulkUpdateStatus } = useCandidates();
  const { settings } = useSettings();
  const [dept,       setDept]       = useState('');
  const [selected,   setSelected]   = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [viewId,     setViewId]     = useState(null);
  const [editId,     setEditId]     = useState(null);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);
  useEffect(() => {
    if (!dept && settings.departments && settings.departments.length > 0)
      setDept(settings.departments[0]);
  }, [settings.departments, dept]);

  const filtered    = candidates.filter(c => c.dept === dept);
  const selectable  = filtered.filter(c => ['Registered','Assessed','NotAssessed'].includes(c.status));
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

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Filter by Department</label>
          <select value={dept} onChange={e => { setDept(e.target.value); setSelected(new Set()); setBulkStatus(''); }}
            style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', minWidth: 280 }}>
            {(settings.departments || []).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button onClick={() => exportCandidates(filtered, 'Department_Report')}
          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="fa-solid fa-file-excel" /> Export Department List
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
              {['#','Full Name','Sex','Institution','Status','Actions'].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ ...TD, textAlign: 'center', color: '#64748b', padding: 36 }}>No candidates in this department.</td></tr>
            ) : filtered.map((c, idx) => {
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
                  <td style={TD}><StatusBadge status={c.status} /></td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button onClick={() => setViewId(c._id)} style={{ padding: '5px 10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}><i className="fa-solid fa-eye" /></button>
                      <button onClick={() => setEditId(c._id)} style={{ padding: '5px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}><i className="fa-solid fa-pen-to-square" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {viewId && <CandidateModal id={viewId} mode="view" onClose={() => setViewId(null)} onEdit={id => { setViewId(null); setEditId(id); }} />}
      {editId && <CandidateModal id={editId} mode="edit" onClose={() => setEditId(null)} />}
    </div>
  );
}
