import React, { useState } from 'react';
import { useCandidates } from '../context/CandidatesContext';
import { useSettings } from '../context/SettingsContext';
import { showToast } from '../utils/toast';

const inp = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', color: '#0f172a', background: '#fff' };

export default function CandidateModal({ id, mode, onClose, onEdit }) {
  const { candidates, updateCandidate } = useCandidates();
  const { settings } = useSettings();
  const c = candidates.find((x) => x._id === id);
  const [form, setForm] = useState(c ? { ...c } : {});
  const [saving, setSaving] = useState(false);

  if (!c) return null;

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCandidate(id, form);
      showToast('Candidate updated successfully.');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'danger');
    } finally { setSaving(false); }
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' };
  const box = { background: '#fff', padding: 30, borderRadius: 12, width: '100%', maxWidth: mode === 'view' ? 700 : 800, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,.1)', border: '1px solid #e2e8f0' };

  const row = (label, value) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: 14.5, fontWeight: 500, color: '#0f172a' }}>{value || '-'}</span>
    </div>
  );

  const secTitle = (label, icon) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.04em', margin: '22px 0 12px', paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
      <i className={icon} />{label}
    </div>
  );

  const fld = (label, children, full = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: full ? '1 / -1' : undefined }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{label}</label>
      {children}
    </div>
  );

  const sel = (name, opts) => (
    <select name={name} value={form[name] || ''} onChange={handle} style={inp}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
  );

  const name = c.name || [c.firstName, c.middleName, c.lastName].filter(Boolean).join(' ');

  return (
    <div style={overlay}>
      <div style={box}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{mode === 'view' ? <><i className="fa-solid fa-id-badge" /> Candidate Profile</> : <><i className="fa-solid fa-pen-to-square" /> Edit Candidate</>}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>&times;</button>
        </div>

        {mode === 'view' ? (
          <>
            {secTitle('Personal Information', 'fa-solid fa-id-card')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px 22px' }}>
              {row('Registration Date', c.regDate)}
              <div style={{ gridColumn: '1 / -1' }}>{row('Full Name', name)}</div>
              {row('Sex', c.sex)} {row('Age', c.age)} {row('Occupation', c.occupation)} {row('Level', c.occLevel)}
              {row('Region', c.region)} {row('Zone', c.zone)} {row('Wereda', c.wereda)} {row('Mobile', c.mobile)}
            </div>
            {secTitle('Education & Training', 'fa-solid fa-graduation-cap')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px 22px' }}>
              <div style={{ gridColumn: '1 / -1' }}>{row('Institution', c.institution)}</div>
              <div style={{ gridColumn: '1 / -1' }}>{row('Department', c.dept)}</div>
              {row('Ownership', c.owner)} {row('Program', c.prog)}
            </div>
            {secTitle('Employment & Assessment', 'fa-solid fa-briefcase')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px 22px' }}>
              {row('Employment', c.emp)} {row('Type', c.empType)} {row('Enterprise Size', c.enterpriseSize)}
              {row('Assessment Type', c.assessmentType)} {row('Status', c.status + (c.failType ? ` (${c.failType})` : ''))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 25, borderTop: '1px solid #e2e8f0', paddingTop: 15 }}>
              <button onClick={onClose} style={{ padding: '10px 18px', background: '#4b5563', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>Close</button>
              {onEdit && <button onClick={() => onEdit(id)} style={{ padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}><i className="fa-solid fa-pen-to-square" /> Edit</button>}
            </div>
          </>
        ) : (
          <form onSubmit={save}>
            {secTitle('Personal Information', 'fa-solid fa-id-card')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px 22px' }}>
              {fld('Reg. Date', <input type="date" name="regDate" value={form.regDate || ''} onChange={handle} style={inp} />)}
              {fld('First Name',  <input type="text" name="firstName"  value={form.firstName  || ''} onChange={handle} style={inp} />)}
              {fld('Middle Name', <input type="text" name="middleName" value={form.middleName || ''} onChange={handle} style={inp} />)}
              {fld('Last Name',   <input type="text" name="lastName"   value={form.lastName   || ''} onChange={handle} style={inp} />)}
              {fld('Sex', sel('sex', [['Male','Male'],['Female','Female']]))}
              {fld('Age', <input type="number" name="age" value={form.age || ''} onChange={handle} min={1} style={inp} />)}
              {fld('Occupation', <input type="text" name="occupation" value={form.occupation || ''} onChange={handle} style={inp} />)}
              {fld('Level', <input type="text" name="occLevel" value={form.occLevel || ''} onChange={handle} style={inp} />)}
              {fld('Region', <input type="text" name="region" value={form.region || ''} onChange={handle} style={inp} />)}
              {fld('Zone',   <input type="text" name="zone"   value={form.zone   || ''} onChange={handle} style={inp} />)}
              {fld('Wereda', <input type="text" name="wereda" value={form.wereda || ''} onChange={handle} style={inp} />)}
              {fld('Mobile', <input type="tel"  name="mobile" value={form.mobile || ''} onChange={handle} style={inp} />)}
            </div>
            {secTitle('Education & Training', 'fa-solid fa-graduation-cap')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px 22px' }}>
              {fld('Institution', <input type="text" name="institution" value={form.institution || ''} onChange={handle} style={inp} />, true)}
              {fld('Inst. Address', <input type="text" name="institutionAddress" value={form.institutionAddress || ''} onChange={handle} style={inp} />, true)}
              {fld('Department', sel('dept', (settings.departments || []).map(d => [d, d])), true)}
              {fld('Ownership', sel('owner', [['Government','Government'],['Private','Private'],['NGO','NGO']]))}
              {fld('Program',   sel('prog',  [['Regular','Regular'],['Extension','Extension'],['Distance','Distance']]))}
            </div>
            {secTitle('Employment & Assessment', 'fa-solid fa-briefcase')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px 22px' }}>
              {fld('Employment', sel('emp', [['Government','Government'],['Private Sector','Private Sector'],['Self Employment','Self-Employed'],['Unemployment','Unemployed']]))}
              {fld('Emp. Type', sel('empType', [['','N/A'],['Government trainer','Government trainer'],['Private trainer','Private trainer'],['Level Teacher','Level Teacher']]))}
              {fld('Enterprise', sel('enterpriseSize', [['','N/A'],['Micro & Small Enterprise','Micro & Small Enterprise'],['Medium & Large Industry','Medium & Large Industry']]))}
              {fld('Asmt. Type', sel('assessmentType', [['First Time','First Time'],['Re-assessment','Re-assessment']]))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 25, borderTop: '1px solid #e2e8f0', paddingTop: 15 }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 18px', background: '#4b5563', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                <i className="fa-solid fa-cloud-arrow-up" /> {saving ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
