import React, { useState, useEffect } from 'react';
import { registerToastSetter } from '../utils/toast';

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => { registerToastSetter(setToasts); }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: '#1e293b', color: 'white', padding: '14px 24px',
          borderRadius: 8, fontSize: 14, fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,.15)',
          display: 'flex', alignItems: 'center', gap: 10, minWidth: 300,
          borderLeft: `4px solid ${t.type === 'success' ? '#10b981' : '#ef4444'}`,
          animation: 'slideIn .25s ease-out',
        }}>
          <i className={`fa-solid ${t.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
          <span>{t.message}</span>
        </div>
      ))}
      <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  );
}
