import React from 'react';

const colors = {
  Registered:     { bg: '#eff6ff', color: '#1e40af' },
  Assessed:       { bg: '#fef3c7', color: '#92400e' },
  NotAssessed:    { bg: '#fef2f2', color: '#991b1b' },
  Competent:      { bg: '#ecfdf5', color: '#065f46' },
  'Non-Competent':{ bg: '#fef2f2', color: '#991b1b' },
};

export default function StatusBadge({ status }) {
  const s = colors[status] || colors['Registered'];
  const label = status === 'NotAssessed' ? 'Not Assessed' : status;
  return (
    <span style={{
      ...s, display: 'inline-block', padding: '4px 12px',
      borderRadius: 20, fontSize: 12, fontWeight: 600,
    }}>
      {label}
    </span>
  );
}
