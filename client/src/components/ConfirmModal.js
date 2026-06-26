import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', padding: 30, borderRadius: 12, width: '100%', maxWidth: 450, boxShadow: '0 10px 25px -5px rgba(0,0,0,.1)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: danger ? '#ef4444' : '#0f172a' }}>{title}</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>&times;</button>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#0f172a' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 25, borderTop: '1px solid #e2e8f0', paddingTop: 15 }}>
          <button onClick={onCancel} style={{ padding: '10px 18px', background: '#4b5563', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '10px 18px', background: danger ? '#ef4444' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
