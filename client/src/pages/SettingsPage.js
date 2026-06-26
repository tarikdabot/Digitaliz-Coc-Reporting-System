import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { showToast } from '../utils/toast';

export default function SettingsPage() {
  const { settings, saveSettings } = useSettings();
  const [form, setForm] = useState({ ...settings });
  const [deptInput, setDeptInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm({ ...settings }); }, [settings]);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const addDept = () => {
    const d = deptInput.trim().toUpperCase();
    if (d && !form.departments?.includes(d)) {
      setForm(p => ({ ...p, departments: [...(p.departments || []), d] }));
    }
    setDeptInput('');
  };

  const removeDept = (d) => setForm(p => ({ ...p, departments: p.departments.filter(x => x !== d) }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings(form);
      showToast('Settings saved successfully.');
    } catch {
      showToast('Failed to save settings.', 'danger');
    } finally { setSaving(false); }
  };

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', color: '#0f172a', background: '#fff' };

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, maxWidth: 800 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>System Settings</h3>
      <form onSubmit={save}>
        <div style={{ marginBottom: 28 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 16 }}>Signature Officials</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[['sigRegistrar','Head of Registrar Office'],['sigAssessment','Head of Assessment Center'],['sigSupervisor','OCACA Supervisor']].map(([name, label]) => (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{label}</label>
                <input type="text" name={name} value={form[name] || ''} onChange={handle} style={inp} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 16 }}>Assessment Center</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Center Name</label>
            <input type="text" name="centerName" value={form.centerName || ''} onChange={handle} style={inp} />
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 16 }}>Departments / Occupations</h4>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input type="text" value={deptInput} onChange={(e) => setDeptInput(e.target.value)} placeholder="Enter department name"
              style={{ ...inp, flexGrow: 1 }} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDept())} />
            <button type="button" onClick={addDept} style={{ padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
              <i className="fa-solid fa-plus" /> Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(form.departments || []).map((d) => (
              <div key={d} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{d}</span>
                <button type="button" onClick={() => removeDept(d)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} style={{ padding: '13px 28px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14.5, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <i className="fa-solid fa-cloud-arrow-up" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
