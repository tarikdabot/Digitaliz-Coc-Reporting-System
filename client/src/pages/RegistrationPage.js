import React, { useState } from 'react';
import { useCandidates } from '../context/CandidatesContext';
import { useSettings } from '../context/SettingsContext';
import { showToast } from '../utils/toast';
import * as XLSX from 'xlsx';
import { downloadBulkTemplate } from '../utils/excelExport';
import { useNavigate } from 'react-router-dom';

const fld = (label, children, full = false) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: full ? '1 / -1' : undefined }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{label}</label>
    {children}
  </div>
);

const inp = (extra = {}) => ({
  width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
  borderRadius: 8, fontSize: 14, outline: 'none', color: '#0f172a', background: '#fff', ...extra,
});

const BLANK = {
  firstName: '', middleName: '', lastName: '', sex: 'Male', age: '', occupation: '', occLevel: '',
  regDate: new Date().toISOString().slice(0, 10),
  region: '', zone: '', wereda: '', mobile: '',
  institution: 'SHEWA BIRHAN COLLEGE', institutionAddress: '', dept: 'WEB DEVELOPMENT AND DATABASE ADMINSTRATION',
  owner: 'Private', prog: 'Regular', emp: 'Unemployment', empType: '', enterpriseSize: '', assessmentType: 'First Time',
};

export default function RegistrationPage() {
  const [tab, setTab]   = useState('single');
  const [form, setForm] = useState(BLANK);
  const [agreed, setAgreed] = useState(false);
  const { createCandidate, bulkCreate } = useCandidates();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!agreed) { showToast('Please accept the agreement checkbox.', 'danger'); return; }
    try {
      await createCandidate({ ...form, institution: form.institution.toUpperCase() });
      showToast('Candidate successfully registered.');
      setForm({ ...BLANK, regDate: new Date().toISOString().slice(0, 10) });
      setAgreed(false);
      navigate('/students');
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed.', 'danger');
    }
  };

  const handleExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

        // helper: get value trying multiple possible column name variants
        const get = (r, ...keys) => {
          for (const k of keys) {
            if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return String(r[k]).trim();
          }
          return '';
        };

        const mapped = rows
          .filter(r => {
            const fn = get(r, 'First Name *', 'First Name', 'FIRST NAME', 'firstName');
            return fn.length > 0 && !fn.startsWith('(');
          })
          .map((r) => {
            const sexRaw = get(r, 'Sex *', 'Sex', 'SEX').toUpperCase();
            const sex = sexRaw === 'F' || sexRaw.startsWith('FEM') ? 'Female' : 'Male';
            return {
              firstName:  get(r, 'First Name *', 'First Name', 'FIRST NAME'),
              middleName: get(r, 'Middle Name', 'MIDDLE NAME'),
              lastName:   get(r, 'Last Name *', 'Last Name', 'LAST NAME'),
              sex,
              age:        get(r, 'Age', 'AGE'),
              occupation: get(r, 'Occupation', 'OCCUPATION'),
              occLevel:   get(r, 'Level', 'LEVEL', 'Occ Level'),
              regDate:    get(r, 'Registration Date', 'REGISTRATION DATE').slice(0, 10),
              region:     get(r, 'Region', 'REGION'),
              zone:       get(r, 'Zone', 'ZONE'),
              wereda:     get(r, 'Wereda', 'WEREDA'),
              mobile:     get(r, 'Mobile No', 'MOBILE NO', 'Mobile', 'Phone'),
              institution: (get(r, 'Name of Institution', 'Institution', 'INSTITUTION') || 'SHEWA BIRHAN COLLEGE').toUpperCase(),
              institutionAddress: get(r, 'Address of Institution'),
              dept:        get(r, 'Department', 'DEPARTMENT', 'Dept') || 'WEB DEVELOPMENT AND DATABASE ADMINSTRATION',
              owner:       get(r, 'Institution Ownership', 'Ownership') || 'Private',
              prog:        get(r, 'Training Program', 'Program') || 'Regular',
              emp:         get(r, 'Employment Status', 'Employment') || 'Unemployment',
              empType:     get(r, 'Trainer/Completer Type', 'Emp Type'),
              enterpriseSize: get(r, 'Enterprise Size'),
              assessmentType: get(r, 'Assessment Type') || 'First Time',
              status: 'Registered',
            };
          });

        if (mapped.length === 0) {
          showToast('No valid rows found. Make sure the "First Name" column has data.', 'danger');
          return;
        }
        const result = await bulkCreate(mapped);
        showToast(`${result.inserted} candidates imported successfully.`);
        navigate('/students');
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Unknown error';
        showToast(`Import failed: ${msg}`, 'danger');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const sec = (title, icon, children) => (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '22px 24px', marginBottom: 20, background: '#fcfdfe' }}>
      <h4 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}><i className={icon} /></span>
        {title}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px 20px' }}>{children}</div>
    </div>
  );

  const sel = (name, opts, value) => (
    <select name={name} value={value} onChange={handle} style={inp()}>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 6, borderRadius: 10, marginBottom: 28, width: 'fit-content' }}>
        {[['single', 'Single Registration'], ['bulk', 'Bulk Registration (Excel)']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '10px 22px', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 8, transition: 'all .15s',
            color: tab === k ? '#2563eb' : '#64748b', background: tab === k ? '#fff' : 'transparent',
            boxShadow: tab === k ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
          }}>{l}</button>
        ))}
      </div>

      {tab === 'single' && (
        <form onSubmit={submit}>
          {sec('Personal Information', 'fa-solid fa-id-card', <>
            {fld('Registration Date', <input type="date" name="regDate" value={form.regDate} onChange={handle} required style={inp()} />)}
            {fld('First Name',  <input type="text" name="firstName"  value={form.firstName}  onChange={handle} required style={inp()} />)}
            {fld('Middle Name', <input type="text" name="middleName" value={form.middleName} onChange={handle} required style={inp()} />)}
            {fld('Last Name',   <input type="text" name="lastName"   value={form.lastName}   onChange={handle} required style={inp()} />)}
            {fld('Sex', sel('sex', [['Male','Male'],['Female','Female']], form.sex))}
            {fld('Age', <input type="number" name="age" value={form.age} onChange={handle} min={1} style={inp()} />)}
            {fld('Occupation', <input type="text" name="occupation" value={form.occupation} onChange={handle} style={inp()} />)}
            {fld('Level', <input type="text" name="occLevel" value={form.occLevel} onChange={handle} placeholder="e.g. Level III" style={inp()} />)}
            {fld('Region', <input type="text" name="region" value={form.region} onChange={handle} style={inp()} />)}
            {fld('Zone',   <input type="text" name="zone"   value={form.zone}   onChange={handle} style={inp()} />)}
            {fld('Wereda', <input type="text" name="wereda" value={form.wereda} onChange={handle} style={inp()} />)}
            {fld('Mobile No', <input type="tel" name="mobile" value={form.mobile} onChange={handle} placeholder="09/07XXXXXXXX" style={inp()} />)}
          </>)}

          {sec('Education & Training', 'fa-solid fa-graduation-cap', <>
            {fld('Name of Institution', <input type="text" name="institution" value={form.institution} onChange={handle} required style={inp()} />, true)}
            {fld('Address of Institution', <input type="text" name="institutionAddress" value={form.institutionAddress} onChange={handle} style={inp()} />, true)}
            {fld('Department / Occupation Field', sel('dept', (settings.departments || []).map(d => [d, d]), form.dept), true)}
            {fld('Institution Ownership', sel('owner', [['Government','Government'],['Private','Private'],['NGO','NGO']], form.owner))}
            {fld('Training Program', sel('prog', [['Regular','Regular'],['Extension','Extension'],['Distance','Distance']], form.prog))}
          </>)}

          {sec('Employment Profile', 'fa-solid fa-briefcase', <>
            {fld('Employment Status', sel('emp', [['Government','Government Organization'],['Private Sector','Private Organization'],['Self Employment','Self-Employed'],['Unemployment','Unemployed']], form.emp))}
            {fld('Trainer / Completer Type', sel('empType', [['','N/A'],['Government trainer','Government trainer'],['Private trainer','Private trainer'],['Level Teacher','Level Teacher'],['TVET completer (Formal)','TVET completer - Formal'],['TVET completer (Short term)','TVET completer - Short term']], form.empType))}
            {fld('Enterprise Size', sel('enterpriseSize', [['','N/A'],['Micro & Small Enterprise','Micro & Small Enterprise'],['Medium & Large Industry','Medium & Large Industry']], form.enterpriseSize))}
          </>)}

          {sec('Assessment Profile', 'fa-solid fa-clipboard-check', <>
            {fld('Assessment Type', sel('assessmentType', [['First Time','First Time'],['Re-assessment','Re-assessment']], form.assessmentType))}
            <div style={{ gridColumn: '1 / -1', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '14px 16px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#334155', lineHeight: 1.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: '#2563eb' }} />
                I, the candidate named above, agree that I have registered for this Competency Assessment voluntarily and accept full responsibility for my signed declaration.
              </label>
            </div>
          </>)}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '13px 28px', fontWeight: 600, fontSize: 14.5, borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-user-plus" /> Register Student
            </button>
          </div>
        </form>
      )}

      {tab === 'bulk' && (
        <div>
          {/* Download template button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20,
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 18px' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 2 }}>
                <i className="fa-solid fa-file-arrow-down" style={{ marginRight: 7 }} />
                Download Template First
              </div>
              <div style={{ fontSize: 12, color: '#4ade80' }}>
                Fill in the template with your candidates data, then upload it below.
              </div>
            </div>
            <button onClick={downloadBulkTemplate}
              style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none',
                padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 10px #16a34a33',
                transition: 'transform .15s, box-shadow .15s', whiteSpace: 'nowrap' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px #16a34a44'; }}
              onMouseOut={e =>  { e.currentTarget.style.transform = 'none';             e.currentTarget.style.boxShadow = '0 4px 10px #16a34a33'; }}>
              <i className="fa-solid fa-download" /> Download Excel Template
            </button>
          </div>

          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
            <strong>Required:</strong> <span style={{ color: '#dc2626' }}>First Name only</span> &nbsp;·&nbsp;
            <strong>Optional:</strong> All other columns
          </p>
          <label style={{ border: '2px dashed #cbd5e1', borderRadius: 12, padding: 40, textAlign: 'center', background: '#f8fafc', cursor: 'pointer', display: 'block', transition: 'all .2s' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}>
            <i className="fa-solid fa-file-excel" style={{ fontSize: 40, color: '#16a34a', display: 'block', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Click to Upload Excel File</h3>
            <p style={{ color: '#64748b', fontSize: 13 }}>Supports .xlsx, .xls — Imported records default to 'Registered'</p>
            <input type="file" accept=".xlsx,.xls" onChange={handleExcel} style={{ display: 'none' }} />
          </label>
        </div>
      )}
    </div>
  );
}
