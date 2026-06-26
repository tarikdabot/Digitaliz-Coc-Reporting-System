import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCandidates } from '../context/CandidatesContext';
import { useSettings } from '../context/SettingsContext';
import StatusBadge from '../components/StatusBadge';
import CandidateModal from '../components/CandidateModal';
import { showToast } from '../utils/toast';
import { exportCandidates } from '../utils/excelExport';

// Status groupings per view
const ASSESSED_STATUSES     = ['Assessed', 'Competent', 'Non-Competent'];
const NON_ASSESSED_STATUSES = ['Registered', 'NotAssessed']; // both mean "not yet assessed"

export default function StatusPage() {
  const { type } = useParams(); // Assessed | Registered | Competent | Non-Competent
  const { candidates, fetchCandidates, updateStatus, bulkUpdateStatus } = useCandidates();
  const { settings } = useSettings();
  const [deptFilter, setDeptFilter] = useState('All');
  const [selected, setSelected]     = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);
  useEffect(() => { setSelected(new Set()); setDeptFilter('All'); }, [type]);

  const isAssessedView    = type === 'Assessed';
  const isNonAssessedView = type === 'Registered'; // URL param for Non-Assessed List

  // Filter candidates based on view type
  const filtered = candidates.filter((c) => {
    const matchDept = deptFilter === 'All' || c.dept === deptFilter;
    let matchStatus;
    if (isAssessedView) {
      matchStatus = ASSESSED_STATUSES.includes(c.status);
    } else if (isNonAssessedView) {
      // Non-Assessed List = Registered (default) + NotAssessed (explicitly marked)
      matchStatus = NON_ASSESSED_STATUSES.includes(c.status);
    } else {
      matchStatus = c.status === type;
    }
    return matchDept && matchStatus;
  });

  const toggleOne = (id) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = (checked) => setSelected(checked ? new Set(filtered.map(c => c._id)) : new Set());

  const applyBulk = async () => {
    if (!bulkStatus || selected.size === 0) { showToast('Select a status and candidates.', 'danger'); return; }
    const [status, failType] = bulkStatus.includes('|') ? bulkStatus.split('|') : [bulkStatus, ''];
    await bulkUpdateStatus([...selected], status, failType);
    setSelected(new Set()); setBulkStatus('');
    showToast(`${selected.size} candidates updated.`);
  };

  const handleInlineStatus = async (id, val) => {
    const [status, failType] = val.includes('|') ? val.split('|') : [val, ''];
    await updateStatus(id, status, failType);
    showToast('Status updated.');
  };

  const pageTitle = {
    Assessed: 'Assessed List',
    Registered: 'Non-Assessed List',
    Competent: 'Competent List',
    'Non-Competent': 'Non-Competent List',
  }[type] || type;

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{pageTitle}</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', width: 240 }}>
            <option value="All">All Departments</option>
            {(settings.departments || []).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button onClick={() => exportCandidates(filtered, `${type}_List`)}
            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-file-excel" /> Export
          </button>
        </div>
      </div>

      {/* Bulk action bar — Assessed view AND Non-Assessed view */}
      {(isAssessedView || isNonAssessedView) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, flexWrap: 'wrap' }}>
          <i className="fa-solid fa-list-check" style={{ color: '#0284c7' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0284c7', minWidth: 100 }}>{selected.size} selected</span>
          <span style={{ color: '#93c5fd' }}>|</span>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>Change status to:</label>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}
            style={{ padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, background: '#fff', cursor: 'pointer' }}>
            <option value="">— Choose status —</option>
            {isNonAssessedView && <option value="Registered">Registered (default)</option>}
            {isNonAssessedView && <option value="NotAssessed">Not Assessed (did not take exam)</option>}
            <option value="Assessed">Assessed (took exam — pending result)</option>
            {isAssessedView && <option value="Competent">Competent (Pass)</option>}
            {isAssessedView && <option value="Non-Competent|Only Knowledge">NYC: Knowledge Only</option>}
            {isAssessedView && <option value="Non-Competent|Only Practice">NYC: Practice Only</option>}
            {isAssessedView && <option value="Non-Competent|Both">NYC: Both Sections</option>}
          </select>
          <button onClick={applyBulk} style={{ padding: '7px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <i className="fa-solid fa-check" /> Apply
          </button>
          <button onClick={() => setSelected(new Set())} style={{ padding: '7px 12px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fa-solid fa-xmark" /> Clear
          </button>
          <span style={{ fontSize: 12, color: '#64748b' }}>☑ Check rows to select &nbsp;·&nbsp; Header checkbox = select all</span>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {(isAssessedView || isNonAssessedView) && (
                <th style={{ width: 46, textAlign: 'center', background: '#f8fafc', padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                  <input type="checkbox"
                    checked={filtered.length > 0 && filtered.every(c => selected.has(c._id))}
                    ref={el => { if (el) el.indeterminate = !filtered.every(c => selected.has(c._id)) && filtered.some(c => selected.has(c._id)); }}
                    onChange={(e) => toggleAll(e.target.checked)}
                    style={{ accentColor: '#2563eb', width: 15, height: 15, cursor: 'pointer' }} />
                </th>
              )}
              {['#','Name','Sex','Occupation','Status','Reg. Date',
                isAssessedView ? 'Set Result' : null,
                'Actions'
              ].filter(Boolean).map(h => (
                <th key={h} style={{ background: '#f8fafc', padding: '12px 18px', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>No candidates found.</td></tr>
            ) : filtered.map((c, idx) => (
              <tr key={c._id} style={{ background: selected.has(c._id) ? '#eff6ff' : idx % 2 === 0 ? '#fff' : '#fafafa', transition: 'background .1s' }}>
                {(isAssessedView || isNonAssessedView) && (
                  <td style={{ textAlign: 'center', padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>
                    <input type="checkbox" checked={selected.has(c._id)} onChange={() => toggleOne(c._id)}
                      style={{ accentColor: '#2563eb', width: 15, height: 15, cursor: 'pointer' }} />
                  </td>
                )}
                <td style={{ padding: '12px 18px', fontSize: 14, borderBottom: '1px solid #e2e8f0' }}>{idx + 1}</td>
                <td style={{ padding: '12px 18px', fontSize: 14, borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>{c.name || [c.firstName, c.middleName, c.lastName].filter(Boolean).join(' ')}</td>
                <td style={{ padding: '12px 18px', fontSize: 14, borderBottom: '1px solid #e2e8f0' }}>{c.sex}</td>
                <td style={{ padding: '12px 18px', fontSize: 14, borderBottom: '1px solid #e2e8f0' }}>{c.occupation || '-'}</td>
                <td style={{ padding: '12px 18px', fontSize: 14, borderBottom: '1px solid #e2e8f0' }}><StatusBadge status={c.status} /></td>
                <td style={{ padding: '12px 18px', fontSize: 14, borderBottom: '1px solid #e2e8f0' }}>{c.regDate || '-'}</td>
                {isAssessedView && (
                  <td style={{ padding: '12px 18px', fontSize: 14, borderBottom: '1px solid #e2e8f0' }}>
                    <select onChange={(e) => e.target.value && handleInlineStatus(c._id, e.target.value)} defaultValue=""
                      style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: '#fff', minWidth: 140 }}>
                      <option value="">— Set Result —</option>
                      <option value="Competent">Competent</option>
                      <option value="Non-Competent|Only Knowledge">NYC: Knowledge</option>
                      <option value="Non-Competent|Only Practice">NYC: Practice</option>
                      <option value="Non-Competent|Both">NYC: Both</option>
                    </select>
                  </td>
                )}
                <td style={{ padding: '12px 18px', fontSize: 14, borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setViewId(c._id)} style={{ padding: '5px 10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}><i className="fa-solid fa-eye" /></button>
                    <button onClick={() => setEditId(c._id)} style={{ padding: '5px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}><i className="fa-solid fa-pen-to-square" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewId && <CandidateModal id={viewId} mode="view" onClose={() => setViewId(null)} onEdit={(id) => { setViewId(null); setEditId(id); }} />}
      {editId && <CandidateModal id={editId} mode="edit" onClose={() => setEditId(null)} />}
    </div>
  );
}
