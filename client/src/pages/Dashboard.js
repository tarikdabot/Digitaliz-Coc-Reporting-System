import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useCandidates } from '../context/CandidatesContext';
import { exportDeptMatrix } from '../utils/excelExport';

function useCountUp(target, dur = 900) {
  const [val, setVal] = useState(0);
  const t = useRef(null);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let s = 0;
    const step = Math.ceil(target / (dur / 16));
    clearInterval(t.current);
    t.current = setInterval(() => {
      s += step;
      if (s >= target) { setVal(target); clearInterval(t.current); } else setVal(s);
    }, 16);
    return () => clearInterval(t.current);
  }, [target, dur]);
  return val;
}

function StatCard({ label, value, icon, bg, iconBg, sub }) {
  const n = useCountUp(value);
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: bg, borderRadius: 16, padding: '28px 24px 24px', minHeight: 180,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        boxShadow: hov ? '0 16px 40px rgba(0,0,0,.22)' : '0 4px 20px rgba(0,0,0,.10)',
        transform: hov ? 'translateY(-5px) scale(1.02)' : 'none',
        transition: 'transform .2s, box-shadow .2s', cursor: 'default',
        position: 'relative', overflow: 'hidden' }}>
      <div style={{ position:'absolute',top:-20,right:-20,width:100,height:100,borderRadius:'50%',background:'rgba(255,255,255,.12)',pointerEvents:'none' }}/>
      <div style={{ position:'absolute',bottom:-30,left:-20,width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,.08)',pointerEvents:'none' }}/>
      <div style={{ width:52,height:52,borderRadius:14,background:iconBg||'rgba(255,255,255,.25)',
        display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,.12)',
        transform: hov ? 'scale(1.12)' : 'scale(1)', transition: 'transform .2s' }}>
        <i className={icon} style={{ fontSize:22,color:'#fff' }} />
      </div>
      <div style={{ fontSize:13,fontWeight:600,color:'rgba(255,255,255,.85)',textAlign:'center' }}>{label}</div>
      <div style={{ fontSize:44,fontWeight:900,color:'#fff',lineHeight:1,letterSpacing:'-2px',marginTop:4 }}>{n}</div>
      {sub && <div style={{ fontSize:11,color:'rgba(255,255,255,.65)',textAlign:'center' }}>{sub}</div>}
    </div>
  );
}

function DonutChart({ slices, size = 150, thick = 26 }) {
  const [hov, setHov] = useState(null);
  const r = (size - thick) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = slices.reduce((s, x) => s + x.value, 0);
  let offset = 0;
  const paths = slices.map((s, i) => {
    const pct = total ? s.value / total : 0;
    const el = (
      <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color}
        strokeWidth={hov === i ? thick + 5 : thick}
        strokeDasharray={`${pct * circ} ${circ - pct * circ}`}
        strokeDashoffset={-offset * circ + circ * 0.25}
        style={{ transition: 'stroke-width .2s, filter .2s', cursor: s.value > 0 ? 'pointer' : 'default',
          filter: hov === i ? `drop-shadow(0 0 7px ${s.color}99)` : 'none' }}
        onMouseEnter={() => s.value > 0 && setHov(i)}
        onMouseLeave={() => setHov(null)} />
    );
    offset += pct;
    return el;
  });
  const h = hov !== null ? slices[hov] : null;
  return (
    <div style={{ position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center' }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thick} />
        {paths}
      </svg>
      <div style={{ position:'absolute',textAlign:'center',pointerEvents:'none',transition:'all .2s' }}>
        {h && h.value > 0 ? (
          <><div style={{ fontSize:20,fontWeight:800,color:h.color }}>{h.value}</div>
            <div style={{ fontSize:10,color:'#64748b',fontWeight:600,maxWidth:60,lineHeight:1.2 }}>{h.label}</div></>
        ) : (
          <><div style={{ fontSize:24,fontWeight:800,color:'#0f172a' }}>{total > 0 ? Math.round((slices[0].value/total)*100) : 0}%</div>
            <div style={{ fontSize:10,color:'#64748b',fontWeight:600 }}>PASS RATE</div></>
        )}
      </div>
    </div>
  );
}

function Bar({ value, max, color, label, count }) {
  const [hov, setHov] = useState(false);
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,fontWeight:600,color:'#475569',marginBottom:5 }}>
        <span>{label}</span>
        <span style={{ color }}>{count} <span style={{ color:'#94a3b8',fontWeight:400 }}>({pct}%)</span></span>
      </div>
      <div style={{ position:'relative' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
        <div style={{ height: hov ? 10 : 8, background:'#f1f5f9', borderRadius:99, overflow:'hidden', transition:'height .2s', cursor:'pointer' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:99, transition:'width .8s',
            boxShadow: hov ? `0 0 8px ${color}66` : 'none' }} />
        </div>
        {hov && (
          <div style={{ position:'absolute',bottom:'calc(100% + 6px)',left:`${Math.min(pct,80)}%`,
            transform:'translateX(-50%)', background:'#1e293b',color:'#fff',padding:'4px 10px',
            borderRadius:6,fontSize:11,fontWeight:700,whiteSpace:'nowrap',zIndex:99,
            boxShadow:'0 2px 8px rgba(0,0,0,.2)' }}>
            {label}: {count} ({pct}%)
            <div style={{ position:'absolute',top:'100%',left:'50%',transform:'translateX(-50%)',width:0,height:0,
              borderLeft:'4px solid transparent',borderRight:'4px solid transparent',borderTop:'4px solid #1e293b' }} />
          </div>
        )}
      </div>
    </div>
  );
}

function GenderCard({ gender, color, icon, count, pct }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flex:1, background: hov ? color+'18' : color+'0d', borderRadius:10, padding:'14px 12px',
        textAlign:'center', border:`1px solid ${hov ? color+'55' : color+'22'}`,
        transform: hov ? 'translateY(-3px)' : 'none', transition:'all .2s', cursor:'default',
        boxShadow: hov ? `0 6px 18px ${color}33` : 'none' }}>
      <i className={icon} style={{ fontSize:22, color, marginBottom:6, display:'block',
        transform: hov ? 'scale(1.18)' : 'scale(1)', transition:'transform .2s' }} />
      <div style={{ fontSize:22,fontWeight:800,color:'#0f172a' }}>{count}</div>
      <div style={{ fontSize:12,color:'#64748b',fontWeight:600 }}>{gender}</div>
      <div style={{ fontSize:11,color:'#94a3b8' }}>{pct}%</div>
    </div>
  );
}

function PipelineRow({ label, value, total, color, icon }) {
  const [hov, setHov] = useState(false);
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex',alignItems:'center',gap:12,padding:'9px 10px',borderRadius:10,
        background: hov ? `${color}0b` : 'transparent',
        border: hov ? `1px solid ${color}22` : '1px solid transparent',
        transition:'all .15s', cursor:'default', marginBottom:2 }}>
      <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,
        background: hov ? `${color}25` : `${color}15`,
        display:'flex',alignItems:'center',justifyContent:'center',
        transform: hov ? 'scale(1.1)' : 'scale(1)', transition:'transform .2s' }}>
        <i className={icon} style={{ fontSize:14,color }} />
      </div>
      <div style={{ flexGrow:1 }}>
        <div style={{ fontSize:13,color:'#475569',fontWeight:500 }}>{label}</div>
        <div style={{ height: hov ? 6 : 4, background:'#f1f5f9', borderRadius:99, marginTop:4, overflow:'hidden', transition:'height .2s' }}>
          <div style={{ height:'100%',width:`${pct}%`,background:color,borderRadius:99,transition:'width .8s',
            boxShadow: hov ? `0 0 6px ${color}88` : 'none' }} />
        </div>
      </div>
      <div style={{ fontSize:18,fontWeight:800,color: hov ? color : '#0f172a',minWidth:32,textAlign:'right',transition:'color .15s' }}>{value}</div>
    </div>
  );
}

function InsightCard({ icon, color, bg, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex',gap:14,padding:'12px 14px',
        background:bg, borderRadius:10, border:`1px solid ${hov ? color+'44' : color+'22'}`,
        transform: hov ? 'translateX(5px)' : 'translateX(0)',
        transition:'all .2s', cursor:'default',
        boxShadow: hov ? `3px 0 0 0 ${color} inset, 0 4px 14px ${color}22` : `3px 0 0 0 ${color} inset` }}>
      <div style={{ width:38,height:38,borderRadius:10,flexShrink:0,background:`${color}22`,
        display:'flex',alignItems:'center',justifyContent:'center',
        transform: hov ? 'rotate(6deg) scale(1.12)' : 'rotate(0) scale(1)', transition:'transform .2s' }}>
        <i className={icon} style={{ fontSize:16,color }} />
      </div>
      <div>
        <div style={{ fontSize:13,fontWeight:700,color:'#0f172a' }}>{title}</div>
        <div style={{ fontSize:12,color:'#64748b',marginTop:2 }}>{desc}</div>
      </div>
    </div>
  );
}

function DeptRow({ row, idx, dPassRate, rateColor }) {
  const [hov, setHov] = useState(false);
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? '#eff6ff' : idx%2===0 ? '#fff' : '#fafbfc', transition:'background .15s', cursor:'default' }}>
      <td style={{ padding:'14px 18px',fontSize:13,fontWeight:600,color: hov ? '#2563eb' : '#0f172a',
        borderBottom:'1px solid #f1f5f9',maxWidth:260,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
        transition:'color .15s' }} title={row.dept}>{row.dept}</td>
      {[{v:row.registered,bg:'#eff6ff',tc:'#2563eb'},{v:row.assessed,bg:'#fef3c7',tc:'#92400e'},
        {v:row.competent,bg:'#ecfdf5',tc:'#065f46'},{v:row.nonCompetent,bg:'#fef2f2',tc:'#991b1b'}
      ].map(({v,bg,tc},i) => (
        <td key={i} style={{ padding:'14px 18px',textAlign:'center',borderBottom:'1px solid #f1f5f9' }}>
          <span style={{ background:bg,color:tc,fontWeight:700,fontSize:13,padding:'3px 12px',borderRadius:20,
            boxShadow: hov ? `0 2px 8px ${tc}33` : 'none', transition:'box-shadow .15s' }}>{v}</span>
        </td>
      ))}
      <td style={{ padding:'14px 18px',textAlign:'center',borderBottom:'1px solid #f1f5f9' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
          <div style={{ width:60,height: hov ? 8 : 6,background:'#f1f5f9',borderRadius:99,overflow:'hidden',transition:'height .2s' }}>
            <div style={{ height:'100%',width:`${dPassRate}%`,background:rateColor,borderRadius:99,transition:'width .8s',
              boxShadow: hov ? `0 0 6px ${rateColor}88` : 'none' }} />
          </div>
          <span style={{ fontSize:13,fontWeight:700,color:rateColor,minWidth:36 }}>{dPassRate}%</span>
        </div>
      </td>
    </tr>
  );
}

// ── Mini stacked bar chart for time reports ──────────────────────────────────
function MiniBarChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.total), 1);
  const [hov, setHov] = useState(null);
  const segments = [
    { key: 'competent',    color: '#10b981' },
    { key: 'nonCompetent', color: '#ef4444' },
    { key: 'pending',      color: '#f59e0b' },
    { key: 'notAssessed',  color: '#94a3b8' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 150, padding: '0 2px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative' }}
          onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
          {hov === i && (
            <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
              background: '#1e293b', color: '#fff', borderRadius: 8, padding: '7px 11px', fontSize: 11,
              whiteSpace: 'nowrap', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,.25)', marginBottom: 6, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{d.label}</div>
              <div>Registered: <b>{d.total}</b></div>
              <div style={{ color: '#6ee7b7' }}>Competent: <b>{d.competent}</b></div>
              <div style={{ color: '#fca5a5' }}>Non-Comp: <b>{d.nonCompetent}</b></div>
              <div style={{ color: '#fcd34d' }}>Pending: <b>{d.pending}</b></div>
              <div style={{ color: '#cbd5e1' }}>Not Assessed: <b>{d.notAssessed}</b></div>
              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                borderTop: '5px solid #1e293b' }} />
            </div>
          )}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 110, borderRadius: 4, overflow: 'hidden',
            boxShadow: hov === i ? '0 4px 12px rgba(0,0,0,.18)' : 'none', transition: 'box-shadow .2s' }}>
            {segments.map(({ key, color }) => {
              const h = d.total > 0 ? Math.max(Math.round((d[key] / maxVal) * 100), d[key] > 0 ? 3 : 0) : 0;
              return h > 0 ? (
                <div key={key} style={{ height: h, background: color, width: '100%', transition: 'height .5s' }} />
              ) : null;
            })}
            {d.total === 0 && (
              <div style={{ height: 4, background: '#e2e8f0', width: '100%', borderRadius: 2 }} />
            )}
          </div>
          <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: hov === i ? '#2563eb' : '#0f172a', transition: 'color .15s' }}>{d.total}</div>
        </div>
      ))}
    </div>
  );
}

// ── Interactive Time-Based Report ────────────────────────────────────────────
const TABS = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

function TimeReport({ candidates }) {
  const [tab, setTab] = useState('Monthly');
  const now = new Date();

  const stats = (arr) => ({
    total:       arr.length,
    competent:   arr.filter(c => c.status === 'Competent').length,
    nonCompetent:arr.filter(c => c.status === 'Non-Competent').length,
    pending:     arr.filter(c => c.status === 'Assessed').length,
    notAssessed: arr.filter(c => ['Registered','NotAssessed'].includes(c.status)).length,
  });

  const chartData = useMemo(() => {
    const dated = candidates.filter(c => c.createdAt);

    if (tab === 'Daily') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now); d.setDate(d.getDate() - (6 - i));
        const day = d.toDateString();
        return { label: d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' }), ...stats(dated.filter(c => new Date(c.createdAt).toDateString() === day)) };
      });
    }
    if (tab === 'Weekly') {
      return Array.from({ length: 8 }, (_, i) => {
        const ws = new Date(now); ws.setDate(ws.getDate() - ws.getDay() - (7 - i) * 7); ws.setHours(0,0,0,0);
        const we = new Date(ws); we.setDate(we.getDate() + 7);
        return { label: `W${i+1} ${ws.toLocaleDateString('en',{month:'short',day:'numeric'})}`, ...stats(dated.filter(c => { const t = new Date(c.createdAt); return t >= ws && t < we; })) };
      });
    }
    if (tab === 'Monthly') {
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        return { label: d.toLocaleDateString('en',{month:'short',year:'2-digit'}), ...stats(dated.filter(c => { const t = new Date(c.createdAt); return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth(); })) };
      });
    }
    if (tab === 'Yearly') {
      return Array.from({ length: 5 }, (_, i) => {
        const yr = now.getFullYear() - (4 - i);
        return { label: String(yr), ...stats(dated.filter(c => new Date(c.createdAt).getFullYear() === yr)) };
      });
    }
    return [];
  }, [tab, candidates]);

  const totals = chartData.reduce((a, d) => ({ total: a.total+d.total, competent: a.competent+d.competent, nonCompetent: a.nonCompetent+d.nonCompetent }), { total:0, competent:0, nonCompetent:0 });
  const passRate = totals.total > 0 ? Math.round((totals.competent / totals.total) * 100) : 0;
  const periodLabel = { Daily:'Last 7 Days', Weekly:'Last 8 Weeks', Monthly:'Last 12 Months', Yearly:'Last 5 Years' }[tab];

  const C = { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04)' };

  return (
    <div style={C}>
      {/* Header row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#0f172a', display:'flex', alignItems:'center', gap:8 }}>
            <i className="fa-solid fa-chart-line" style={{ color:'#2563eb' }} />
            Registration &amp; Assessment Report
          </div>
          <div style={{ fontSize:12, color:'#94a3b8', marginTop:3 }}>{periodLabel}</div>
        </div>
        <div style={{ display:'flex', background:'#f1f5f9', borderRadius:10, padding:3, gap:2 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
                background: tab === t ? '#2563eb' : 'transparent',
                color: tab === t ? '#fff' : '#64748b',
                boxShadow: tab === t ? '0 2px 8px #2563eb44' : 'none',
                transition:'all .2s' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary mini-cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:22 }}>
        {[
          { label:'Registered',    value:totals.total,       color:'#2563eb', bg:'#eff6ff', icon:'fa-solid fa-users' },
          { label:'Competent',     value:totals.competent,   color:'#10b981', bg:'#ecfdf5', icon:'fa-solid fa-circle-check' },
          { label:'Non-Competent', value:totals.nonCompetent,color:'#ef4444', bg:'#fef2f2', icon:'fa-solid fa-circle-xmark' },
          { label:'Pass Rate',     value:passRate+'%',       color:'#8b5cf6', bg:'#f5f3ff', icon:'fa-solid fa-trophy' },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} style={{ background:bg, borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:color+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <i className={icon} style={{ fontSize:15, color }} />
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:'#0f172a', lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:11, color:'#64748b', fontWeight:600, marginTop:2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <MiniBarChart data={chartData} />

      {/* Legend */}
      <div style={{ display:'flex', gap:16, marginTop:12, flexWrap:'wrap' }}>
        {[['#10b981','Competent'],['#ef4444','Non-Competent'],['#f59e0b','Assessed (Pending)'],['#94a3b8','Not Assessed']].map(([color,label]) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#64748b' }}>
            <div style={{ width:10, height:10, borderRadius:3, background:color, flexShrink:0 }} />{label}
          </div>
        ))}
      </div>

      {chartData.every(d => d.total === 0) && (
        <div style={{ textAlign:'center', color:'#94a3b8', fontSize:13, marginTop:16, paddingTop:16, borderTop:'1px solid #f1f5f9' }}>
          <i className="fa-solid fa-calendar-xmark" style={{ fontSize:24, display:'block', marginBottom:8, opacity:.4 }} />
          No registrations found for this period.
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { candidates, fetchCandidates, computedStats, deptMatrix } = useCandidates();
  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const total       = computedStats.total;
  const assessed    = computedStats.assessed;
  const competent   = computedStats.competent;
  const nonComp     = computedStats.nonCompetent;
  const notAssessed = total - assessed;
  const passRate    = assessed > 0 ? Math.round((competent / assessed) * 100) : 0;
  const males       = candidates.filter(c => c.sex === 'Male').length;
  const females     = candidates.filter(c => c.sex === 'Female').length;
  const maleComp    = candidates.filter(c => c.sex === 'Male'   && c.status === 'Competent').length;
  const femaleComp  = candidates.filter(c => c.sex === 'Female' && c.status === 'Competent').length;

  const donutSlices = [
    { value: competent,                                   color: '#10b981', label: 'Competent' },
    { value: nonComp,                                     color: '#ef4444', label: 'Non-Competent' },
    { value: Math.max(assessed - competent - nonComp, 0), color: '#f59e0b', label: 'Assessed (Pending)' },
    { value: notAssessed,                                 color: '#cbd5e1', label: 'Not Assessed' },
  ];

  const C = { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 18 }}>
        <StatCard label="Total Registered" value={total}     icon="fa-solid fa-users"
          bg="linear-gradient(135deg,#2563eb,#1d4ed8)" iconBg="rgba(255,255,255,.22)" sub="All candidates in system" />
        <StatCard label="Total Assessed"   value={assessed}  icon="fa-solid fa-file-signature"
          bg="linear-gradient(135deg,#f59e0b,#d97706)" iconBg="rgba(255,255,255,.22)" sub="Took the assessment exam" />
        <StatCard label="Competent"        value={competent} icon="fa-solid fa-circle-check"
          bg="linear-gradient(135deg,#10b981,#059669)" iconBg="rgba(255,255,255,.22)" sub={'Pass rate: ' + passRate + '%'} />
        <StatCard label="Non-Competent"    value={nonComp}   icon="fa-solid fa-circle-xmark"
          bg="linear-gradient(135deg,#ef4444,#dc2626)" iconBg="rgba(255,255,255,.22)"
          sub={assessed > 0 ? (100 - passRate) + '% of assessed' : 'No results yet'} />
      </div>

      {/* Row 2: Donut + Bars + Gender */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
        <div style={{ ...C, display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', alignSelf:'flex-start' }}>Assessment Outcome</div>
          <DonutChart slices={donutSlices} size={150} thick={26} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 16px', width:'100%' }}>
            {donutSlices.map(({ color, label, value }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:color, flexShrink:0 }} />
                <span style={{ color:'#475569' }}>{label}</span>
                <span style={{ marginLeft:'auto', fontWeight:700, color:'#0f172a' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={C}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:20 }}>Status Breakdown</div>
          <Bar value={competent}                                  max={total} color="#10b981" label="Competent"          count={competent} />
          <Bar value={nonComp}                                    max={total} color="#ef4444" label="Non-Competent"       count={nonComp} />
          <Bar value={Math.max(assessed - competent - nonComp,0)} max={total} color="#f59e0b" label="Assessed (Pending)" count={Math.max(assessed - competent - nonComp,0)} />
          <Bar value={notAssessed}                                max={total} color="#94a3b8" label="Not Assessed"        count={notAssessed} />
          <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', fontSize:12, color:'#64748b' }}>
            <span>Assessment Coverage</span>
            <span style={{ fontWeight:700, color: total ? '#2563eb' : '#94a3b8' }}>{total ? Math.round((assessed/total)*100) : 0}%</span>
          </div>
        </div>

        <div style={C}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:20 }}>Gender Distribution</div>
          <div style={{ display:'flex', gap:12, marginBottom:20 }}>
            <GenderCard gender="Male"   color="#3b82f6" icon="fa-solid fa-mars"  count={males}   pct={total ? Math.round((males/total)*100)   : 0} />
            <GenderCard gender="Female" color="#ec4899" icon="fa-solid fa-venus" count={females} pct={total ? Math.round((females/total)*100) : 0} />
          </div>
          <div style={{ fontSize:12, fontWeight:700, color:'#475569', marginBottom:10 }}>Competent by Gender</div>
          <Bar value={maleComp}   max={Math.max(males,1)}   color="#3b82f6" label="Male Competent"   count={maleComp} />
          <Bar value={femaleComp} max={Math.max(females,1)} color="#ec4899" label="Female Competent" count={femaleComp} />
        </div>
      </div>

      {/* Interactive Time Reports */}
      <TimeReport candidates={candidates} />

      {/* Department Matrix */}
      <div style={C}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#0f172a' }}>Department Performance Matrix</div>
            <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>Breakdown by occupation field</div>
          </div>
          <button onClick={() => exportDeptMatrix(deptMatrix)}
            style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none',
              padding:'9px 18px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600,
              display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 10px #10b98133', transition:'transform .15s, box-shadow .15s' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px #10b98144'; }}
            onMouseOut={e =>  { e.currentTarget.style.transform = 'none';             e.currentTarget.style.boxShadow = '0 4px 10px #10b98133'; }}>
            <i className="fa-solid fa-file-excel" /> Export Matrix
          </button>
        </div>
        {deptMatrix.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 20px', color:'#94a3b8' }}>
            <i className="fa-solid fa-chart-bar" style={{ fontSize:36, marginBottom:12, display:'block', opacity:.3 }} />
            No data yet. Register candidates to see the breakdown.
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['Department / Occupation Field','Registered','Assessed','Competent','Non-Competent','Pass Rate'].map(h => (
                    <th key={h} style={{ padding:'12px 18px', fontSize:12, fontWeight:700, color:'#64748b',
                      borderBottom:'2px solid #e2e8f0', textAlign: h === 'Department / Occupation Field' ? 'left' : 'center',
                      textTransform:'uppercase', letterSpacing:'.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptMatrix.map((row, idx) => {
                  const dp = row.assessed > 0 ? Math.round((row.competent / row.assessed) * 100) : 0;
                  const rc = dp >= 70 ? '#10b981' : dp >= 40 ? '#f59e0b' : '#ef4444';
                  return <DeptRow key={row.dept} row={row} idx={idx} dPassRate={dp} rateColor={rc} />;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pipeline + Insights */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <div style={C}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:14 }}>
            <i className="fa-solid fa-arrow-trend-up" style={{ color:'#2563eb', marginRight:8 }} />
            Assessment Pipeline
          </div>
          {[
            { label:'Registered (awaiting exam)', value:candidates.filter(c => c.status==='Registered').length,   color:'#2563eb', icon:'fa-solid fa-hourglass-start' },
            { label:'Not Assessed (absent)',       value:candidates.filter(c => c.status==='NotAssessed').length,  color:'#94a3b8', icon:'fa-solid fa-ban' },
            { label:'Assessed (result pending)',   value:candidates.filter(c => c.status==='Assessed').length,    color:'#f59e0b', icon:'fa-solid fa-clock' },
            { label:'Competent (certified)',       value:competent, color:'#10b981', icon:'fa-solid fa-certificate' },
            { label:'Non-Competent (NYC)',         value:nonComp,   color:'#ef4444', icon:'fa-solid fa-circle-xmark' },
          ].map(p => <PipelineRow key={p.label} {...p} total={total} />)}
        </div>

        <div style={{ ...C, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:4 }}>
            <i className="fa-solid fa-lightbulb" style={{ color:'#f59e0b', marginRight:8 }} />
            Key Insights
          </div>
          {[
            { icon:'fa-solid fa-trophy',          color:'#10b981', bg:'#ecfdf5',
              title:'Pass Rate',           desc: assessed > 0 ? passRate+'% of assessed candidates are competent' : 'No assessed candidates yet' },
            { icon:'fa-solid fa-venus-mars',       color:'#8b5cf6', bg:'#f5f3ff',
              title:'Gender Balance',      desc: total > 0 ? Math.round((females/total)*100)+'% Female · '+Math.round((males/total)*100)+'% Male' : 'No candidates yet' },
            { icon:'fa-solid fa-building-columns', color:'#2563eb', bg:'#eff6ff',
              title:'Departments Active',  desc: deptMatrix.length+' occupation field'+(deptMatrix.length !== 1 ? 's' : '')+' with registered candidates' },
            { icon:'fa-solid fa-chart-pie',        color:'#f59e0b', bg:'#fef3c7',
              title:'Assessment Coverage', desc: total > 0 ? Math.round((assessed/total)*100)+'% of registered have been assessed' : 'No candidates yet' },
          ].map(ins => <InsightCard key={ins.title} {...ins} />)}
        </div>
      </div>

    </div>
  );
}
