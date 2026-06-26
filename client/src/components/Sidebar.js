import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logout, user } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();

  const [open, setOpen] = useState({ students: true, status: false, reports: false });

  const toggle  = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }));
  const go      = (path) => navigate(path);
  const at      = (path) => location.pathname === path;
  const atStart = (prefix) => location.pathname.startsWith(prefix);

  const W = collapsed ? 68 : 260;

  /* ── style helpers ── */
  const menuLink = (active) => ({
    display: 'flex', alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'space-between',
    padding: collapsed ? '12px 0' : '12px 16px',
    color: active ? '#fff' : '#f3f4f6',
    background: active ? '#3b82f6' : 'transparent',
    borderRadius: 8, fontWeight: 500, cursor: 'pointer',
    transition: 'background .2s', marginBottom: 2,
    position: 'relative',
  });

  const subLink = (active) => ({
    display: 'block',
    padding: '9px 14px',
    color: active ? '#fff' : '#9ca3af',
    fontWeight: active ? 600 : 400,
    background: active ? '#1f2937' : 'transparent',
    fontSize: 13, borderRadius: 6, cursor: 'pointer',
    marginBottom: 2, whiteSpace: 'nowrap',
    transition: 'background .15s',
  });

  const iconStyle = { fontSize: 16, minWidth: 20, textAlign: 'center' };

  /* ── tooltip on collapsed mode ── */
  const Tip = ({ label }) =>
    collapsed ? (
      <span style={{
        position: 'absolute', left: 72, top: '50%', transform: 'translateY(-50%)',
        background: '#1e293b', color: '#f1f5f9', padding: '4px 10px', borderRadius: 6,
        fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        pointerEvents: 'none', zIndex: 999,
        opacity: 0, transition: 'opacity .15s',
      }}
        className="sidebar-tip"
      >{label}</span>
    ) : null;

  const NavItem = ({ icon, label, path, onClick, children, sectionKey }) => {
    const isActive  = path ? at(path) : atStart('/' + sectionKey);
    const isExpanded = sectionKey ? open[sectionKey] : false;

    return (
      <li style={{ padding: '2px 8px', listStyle: 'none', position: 'relative' }}
        onMouseEnter={e => { const tip = e.currentTarget.querySelector('.sidebar-tip'); if (tip) tip.style.opacity = 1; }}
        onMouseLeave={e => { const tip = e.currentTarget.querySelector('.sidebar-tip'); if (tip) tip.style.opacity = 0; }}
      >
        <div style={menuLink(isActive && !sectionKey)}
          onClick={onClick || (() => path && go(path))}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12 }}>
            <i className={icon} style={iconStyle} />
            {!collapsed && <span style={{ fontSize: 14 }}>{label}</span>}
          </div>
          {!collapsed && sectionKey && (
            <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ fontSize: 11, color: '#9ca3af' }} />
          )}
          <Tip label={label} />
        </div>

        {/* Submenu — full mode: slide down; collapsed mode: show as floating panel */}
        {sectionKey && children && (
          collapsed ? (
            <ul style={{
              position: 'absolute', left: 72, top: 0, zIndex: 200,
              background: '#1f2937', borderRadius: 10, padding: '8px 0',
              minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,.35)',
              display: 'none', listStyle: 'none',
            }}
              className="sidebar-fly"
              onMouseEnter={e => e.currentTarget.style.display = 'block'}
              onMouseLeave={e => e.currentTarget.style.display = 'none'}
              ref={el => {
                const parent = el?.parentElement;
                if (parent) {
                  parent.onmouseenter = () => { if (el) el.style.display = 'block'; };
                  parent.onmouseleave = () => { if (el) el.style.display = 'none'; };
                }
              }}
            >
              <li style={{ padding: '4px 14px 8px', borderBottom: '1px solid #374151', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#6b7280' }}>{label}</span>
              </li>
              {children}
            </ul>
          ) : (
            <ul style={{
              listStyle: 'none', paddingLeft: 16, marginTop: 2,
              maxHeight: isExpanded ? 300 : 0, overflow: 'hidden',
              transition: 'max-height .3s ease',
            }}>
              {children}
            </ul>
          )
        )}
      </li>
    );
  };

  const SubItem = ({ label, path }) => (
    <li style={{ listStyle: 'none' }}>
      <div style={subLink(at(path))} onClick={() => go(path)}>{label}</div>
    </li>
  );

  return (
    <>
      {/* Inject hover rule for flying sub-panels */}
      <style>{`
        .sidebar-fly-wrap:hover .sidebar-fly { display: block !important; }
        li:hover > .sidebar-fly { display: block !important; }
      `}</style>

      <nav style={{
        width: W, minWidth: W, background: '#111827', color: '#f3f4f6',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100,
        boxShadow: '4px 0 10px rgba(0,0,0,.15)',
        transition: 'width .25s ease, min-width .25s ease',
        overflowX: 'hidden',
      }}>

        {/* Brand + collapse toggle */}
        <div style={{
          padding: collapsed ? '20px 0' : '18px 20px',
          borderBottom: '1px solid #1f2937',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 700 }}>
              <i className="fa-solid fa-graduation-cap" style={{ color: '#3b82f6' }} />
              <span>SHEWA BIRHAN COLLEGE</span>
            </div>
          )}
          <button onClick={() => setCollapsed(p => !p)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: '#1f2937', border: 'none', color: '#9ca3af',
              width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background .2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#374151'}
            onMouseOut={e => e.currentTarget.style.background = '#1f2937'}
          >
            <i className={`fa-solid fa-${collapsed ? 'chevron-right' : 'chevron-left'}`} style={{ fontSize: 12 }} />
          </button>
        </div>

        {/* Menu */}
        <ul style={{ listStyle: 'none', padding: '16px 0', flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>

          <NavItem icon="fa-solid fa-chart-pie" label="Dashboard" path="/dashboard" />

          <NavItem icon="fa-solid fa-user-graduate" label="Students" sectionKey="students"
            onClick={() => !collapsed && toggle('students')}>
            <SubItem label="New Registration"   path="/register" />
            <SubItem label="Student List"        path="/students" />
            <SubItem label="List by Department"  path="/by-dept" />
          </NavItem>

          <NavItem icon="fa-solid fa-clipboard-check" label="Status" sectionKey="status"
            onClick={() => !collapsed && toggle('status')}>
            <SubItem label="Assessed List"       path="/status/Assessed" />
            <SubItem label="Non-Assessed List"   path="/status/Registered" />
            <SubItem label="Competent List"      path="/status/Competent" />
            <SubItem label="Non-Competent List"  path="/status/Non-Competent" />
          </NavItem>

          <NavItem icon="fa-solid fa-file-invoice" label="Reports" sectionKey="reports"
            onClick={() => !collapsed && toggle('reports')}>
            <SubItem label="Form A"              path="/report/FormA" />
            <SubItem label="Form B"              path="/report/FormB" />
            <SubItem label="Form 11"             path="/report/Form11" />
            <SubItem label="List of Competency"  path="/report/Competency" />
          </NavItem>

          <NavItem icon="fa-solid fa-gear" label="Settings" path="/settings" />
        </ul>

        {/* Footer */}
        <div style={{
          padding: collapsed ? '12px 0' : '12px 16px',
          borderTop: '1px solid #1f2937',
          display: 'flex', flexDirection: 'column',
          alignItems: collapsed ? 'center' : 'stretch',
          gap: 8, flexShrink: 0,
        }}>
          {!collapsed && (
            <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fa-solid fa-user" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username || 'Admin'}</span>
            </div>
          )}
          <button onClick={logout} title="Logout"
            style={{
              width: collapsed ? 40 : '100%', height: 36,
              background: '#ef4444', color: '#fff', border: 'none',
              borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: collapsed ? 0 : 6,
              transition: 'background .2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
            onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
          >
            <i className="fa-solid fa-arrow-right-from-bracket" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </>
  );
}
