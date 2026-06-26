import React from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/register": "New Registration",
  "/students": "Student List",
  "/by-dept": "List by Department",
  "/status/Assessed": "Assessed List",
  "/status/Registered": "Non-Assessed List",
  "/status/Competent": "Competent List",
  "/status/Non-Competent": "Non-Competent List",
  "/report/FormA": "Form A Workspace",
  "/report/FormB": "Form B Workspace",
  "/report/Form11": "Form 11 Workspace",
  "/report/Competency": "List of Competency Workspace",
  "/settings": "Settings",
};

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const { collapsed } = useSidebar();
  const title = pageTitles[pathname] || "SHEWA BIRHAN COLLEGE";
  const sideW = collapsed ? 68 : 260;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <div
        style={{
          marginLeft: sideW,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          transition: "margin-left .25s ease",
        }}
      >
        <header
          style={{
            height: 64,
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            position: "sticky",
            top: 0,
            zIndex: 90,
            boxShadow: "0 1px 4px rgba(0,0,0,.04)",
          }}
        >
          <h1 style={{ fontSize: 19, fontWeight: 600, color: "#0f172a" }}>
            {title}
          </h1>
          <div
            style={{
              fontWeight: 700,
              color: "#2563eb",
              fontSize: 13,
              letterSpacing: ".04em",
            }}
          >
            Registeral
          </div>
        </header>
        <main style={{ padding: 28, flexGrow: 1 }}>{children}</main>
        <footer
          style={{
            borderTop: "1px solid #e2e8f0",
            padding: "14px 28px",
            background: "#fff",
            textAlign: "center",
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          &copy; {new Date().getFullYear()} All Rights Reserved. Designed and
          Developed by{" "}
          <a
            href="https://tdsportfolio.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#2563eb",
              fontWeight: 700,
              textDecoration: "none",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Tarik Dabot
          </a>
        </footer>
      </div>
    </div>
  );
}
