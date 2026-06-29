import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCandidates } from "../context/CandidatesContext";
import { useSettings } from "../context/SettingsContext";
import * as XLSX from "xlsx";

const DEPT_OPTIONS = [
  ["All", "All Occupations"],
  ["WEB DEVELOPMENT AND DATABASE ADMINSTRATION", "Web Dev & Database Admin"],
  ["Pharmacy", "Pharmacy"],
  ["Accounting", "Accounting"],
];

// Default classification state
const DEFAULT_CLASSIFICATION = {
  aLevelTeacher: false,
  bLevelTeacher: false,
  cLevelTeacher: false,
  tvetCompleter: false,
  shortTerm: false,
  levelPromotion: false,
  microSmall: false,
  mediumLarge: false,
  peasants: false,
  others: false,
  othersText: "",
};

function getSignatureBlock(sigs) {
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:40px;font-size:11px;font-weight:bold;">
    <div>Head of Registrar Office<br> <br>${sigs.registrar || ""}<br><br>_______________________</div>
    <div>Head of Assessment Center<br><br>${sigs.assessment || ""}<br><br>_______________________</div>
    <div>OCACA Assigned Supervisor<br><br>${sigs.supervisor || ""}<br><br>_______________________</div>
  </div>
  <div style="text-align:center;font-size:11px;font-weight:bold;margin-top:30px;color:#1e40af;">***ሰነዱን ከመጠቀምዎ በፊት ትክክለኛ ዕትም መሆኑን ያረጋግጡ!! // This Document is Certified and Valid for Official Use ***</div>`;
}

function govHeader(docNo, title) {
  return `<table style="width:100%;border:2px solid #000;border-collapse:collapse;margin-bottom:15px;">
    <tr>
      <td style="border:1px solid #000;padding:8px;font-size:12px;font-weight:bold;width:70%;">
        የተቋም ስም / Company Name<br>
        AMHARA OCCUPATIONAL COMPETENCE ASSESSMENT AND CERTIFICATION AUTHORITY
      </td>
      <td style="border:1px solid #000;padding:8px;font-size:12px;font-weight:bold;vertical-align:top;">
        Document No.<br><br><b>${docNo}</b>
      </td>
    </tr>
    <tr>
      <td style="border:1px solid #000;padding:8px;font-size:12px;font-weight:bold;">Title<br><b>${title}</b></td>
      <td style="border:1px solid #000;padding:8px;font-size:12px;font-weight:bold;">Issue No.: 01<br>Page: 1 of 1</td>
    </tr>
  </table>`;
}

function purposeBox(purpose, trainer) {
  const x = (v) =>
    v ? `<span style="color:green;font-weight:bold;">X</span>` : "&nbsp;";
  return `<div style="border:1px solid #000;padding:8px;font-size:11px;margin-bottom:15px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:5px;">
      <div><b>Purpose of Assessment:</b><br>
        [${x(purpose === "promotion")}] Level to level promotion &nbsp;
        [${x(purpose === "graduation")}] Graduation &nbsp;
        [${x(purpose === "shortterm")}] Short term training &nbsp;
        [${x(purpose === "others")}] Others
      </div>
      <div><b>Trainer Level:</b><br>
        [${x(trainer === "A")}] A-LEVEL &nbsp;
        [${x(trainer === "B")}] B-LEVEL &nbsp;
        [${x(trainer === "C")}] C-LEVEL
      </div>
    </div>
  </div>`;
}

// Renders the Form 11 classification box from the classification state object
function classificationBox(cl) {
  const x = (v) =>
    v ? `[<span style="color:green;font-weight:bold;">X</span>]` : "[&nbsp;]";
  return `<div style="border:1px solid #000;padding:10px 12px;font-size:11px;margin-bottom:15px;">
    <b style="font-size:11.5px;">CLASSIFICATION OF CANDIDATES:</b>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px 6px;margin-top:8px;">

      <div style="border:1px solid #ccc;padding:7px 9px;border-radius:4px;">
        <b>1. Level Teachers</b><br>
        <div style="margin-top:5px;line-height:2;">
          ${x(cl.aLevelTeacher)} A-LEVEL TEACHERS<br>
          ${x(cl.bLevelTeacher)} B-LEVEL TEACHERS<br>
          ${x(cl.cLevelTeacher)} C-LEVEL TEACHERS
        </div>
      </div>

      <div style="border:1px solid #ccc;padding:7px 9px;border-radius:4px;">
        <b>2. Trainees</b><br>
        <div style="margin-top:5px;line-height:2;">
          ${x(cl.tvetCompleter)} 2018 E.C TVET Completer/Graduates<br>
          ${x(cl.shortTerm)} Short-Term Training<br>
          ${x(cl.levelPromotion)} Level to Level Promotion
        </div>
      </div>

      <div style="border:1px solid #ccc;padding:7px 9px;border-radius:4px;">
        <b>3. Employees</b><br>
        <div style="margin-top:5px;line-height:2;">
          ${x(cl.microSmall)} Micro &amp; Small Enterprises<br>
          ${x(cl.mediumLarge)} Medium &amp; Large Industry Workers<br>
          ${x(cl.peasants)} Peasants / Pastoralists
        </div>
      </div>

      <div style="border:1px solid #ccc;padding:7px 9px;border-radius:4px;">
        <b>4. Others</b><br>
        <div style="margin-top:5px;line-height:2;">
          ${x(cl.others)} Others${cl.others && cl.othersText ? ": <i>" + cl.othersText + "</i>" : ""}
        </div>
      </div>

    </div>
  </div>`;
}

const TS =
  "border:1px solid #000;padding:6px 3px;font-size:11px;text-align:center;";
const TH = TS + "background:#f4f4f5;font-weight:bold;";

function buildFormA(data, purpose, trainer, dateRange, sigs) {
  const rows = data
    .map((s, i) => {
      const name =
        s.name ||
        [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
      const govOwn = s.owner === "Government" ? "X" : "";
      const prvOwn = s.owner === "Private" ? "X" : "";
      const regPr = s.prog === "Regular" ? "X" : "";
      const extPr = s.prog === "Extension" ? "X" : "";
      const dstPr = s.prog === "Distance" ? "X" : "";
      const govEm = s.emp === "Government" ? "X" : "";
      const prvEm = s.emp === "Private Sector" ? "X" : "";
      const selEm = s.emp === "Self Employment" ? "X" : "";
      const unEm = s.emp === "Unemployment" ? "X" : "";
      const comp = s.status === "Competent" ? "X" : "";
      const knRes = s.failType === "Only Knowledge" ? "X" : "";
      const prRes = s.failType === "Only Practice" ? "X" : "";
      const btRes = s.failType === "Both" ? "X" : "";
      return `<tr>
      <td style="${TS}">${i + 1}</td>
      <td style="${TS}text-align:left;font-weight:bold;">${name}</td>
      <td style="${TS}">${s.sex === "Female" ? "F" : "M"}</td>
      <td style="${TS}text-align:left;font-size:10px;">${s.institution}</td>
      <td style="${TS}">${govOwn}</td><td style="${TS}">${prvOwn}</td><td style="${TS}"></td>
      <td style="${TS}">${regPr}</td><td style="${TS}">${extPr}</td><td style="${TS}">${dstPr}</td><td style="${TS}"></td>
      <td style="${TS}">${govEm}</td><td style="${TS}">${prvEm}</td><td style="${TS}">${selEm}</td><td style="${TS}">${unEm}</td>
      <td style="${TS}background:#f0fdf4;color:green;font-weight:bold;">${comp}</td>
      <td style="${TS}background:#fef2f2;color:red;">${knRes}</td>
      <td style="${TS}background:#fef2f2;color:red;">${prRes}</td>
      <td style="${TS}background:#fef2f2;color:red;">${btRes}</td>
    </tr>`;
    })
    .join("");

  return (
    govHeader(
      "OF/AOCACA/AR/007",
      "ASSESSMENT RESULT DATA GATHERING TOOL (FORM A)",
    ) +
    purposeBox(purpose, trainer) +
    `<p style="font-size:11px;margin-bottom:10px;"><b>Assessment Center:</b> SHEWA BIRHAN COLLEGE &nbsp;|&nbsp; <b>Duration:</b> ${dateRange}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:10px;">
      <thead>
        <tr>
          <th rowspan="3" style="${TH}width:3%">No</th>
          <th rowspan="3" style="${TH}width:20%">Name of Candidates</th>
          <th rowspan="3" style="${TH}width:4%">Sex</th>
          <th colspan="4" style="${TH}">Training Institution</th>
          <th colspan="4" style="${TH}">Training Program</th>
          <th colspan="4" style="${TH}">Employment Status</th>
          <th colspan="4" style="${TH}">Result Status</th>
        </tr>
        <tr>
          <th rowspan="2" style="${TH}">Institution</th>
          <th colspan="3" style="${TH}">Ownership</th>
          <th rowspan="2" style="${TH}">Reg.</th><th rowspan="2" style="${TH}">Ext.</th>
          <th rowspan="2" style="${TH}">Dist.</th><th rowspan="2" style="${TH}">Non F.</th>
          <th rowspan="2" style="${TH}">Gov.</th><th rowspan="2" style="${TH}">Priv.</th>
          <th rowspan="2" style="${TH}">Self.</th><th rowspan="2" style="${TH}">Unempl.</th>
          <th rowspan="2" style="${TH}background:#e2e8f0;color:green;">Comp.</th>
          <th colspan="3" style="${TH}background:#fee2e2;color:red;">Not Satisfied</th>
        </tr>
        <tr>
          <th style="${TH}">Gov.</th><th style="${TH}">Priv.</th><th style="${TH}">Oth.</th>
          <th style="${TH}font-size:9px;">Knowl.</th>
          <th style="${TH}font-size:9px;">Pract.</th>
          <th style="${TH}font-size:9px;">Both</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="19" style="${TS}padding:20px;">No candidates.</td></tr>`}</tbody>
    </table>` +
    getSignatureBlock(sigs)
  );
}

function buildFormB(data, purpose, trainer, dateRange, sigs) {
  const mReg = data.filter((s) => s.sex === "Male").length;
  const fReg = data.filter((s) => s.sex === "Female").length;
  const mC = data.filter(
    (s) => s.sex === "Male" && s.status === "Competent",
  ).length;
  const fC = data.filter(
    (s) => s.sex === "Female" && s.status === "Competent",
  ).length;
  const mK = data.filter(
    (s) => s.sex === "Male" && s.failType === "Only Knowledge",
  ).length;
  const fK = data.filter(
    (s) => s.sex === "Female" && s.failType === "Only Knowledge",
  ).length;
  const mP = data.filter(
    (s) => s.sex === "Male" && s.failType === "Only Practice",
  ).length;
  const fP = data.filter(
    (s) => s.sex === "Female" && s.failType === "Only Practice",
  ).length;
  const mB = data.filter(
    (s) => s.sex === "Male" && s.failType === "Both",
  ).length;
  const fB = data.filter(
    (s) => s.sex === "Female" && s.failType === "Both",
  ).length;
  const td = (v, extra = "") => `<td style="${TS}${extra}">${v}</td>`;
  const headers = [
    "M",
    "F",
    "T",
    "M",
    "F",
    "T",
    "M",
    "F",
    "T",
    "M",
    "F",
    "T",
    "M",
    "F",
    "T",
    "M",
    "F",
    "T",
  ]
    .map((h) => `<th style="${TH}">${h}</th>`)
    .join("");
  return (
    govHeader(
      "OF/AOCACA/AR/023",
      "ASSESSMENT RESULT DATA GATHERING SUMMARY SHEET (FORM B)",
    ) +
    purposeBox(purpose, trainer) +
    `<p style="font-size:11px;margin-bottom:10px;"><b>Assessment Center:</b> SHEWA BIRHAN COLLEGE &nbsp;|&nbsp; <b>Duration:</b> ${dateRange}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:10px;">
      <thead>
        <tr>
          <th rowspan="2" style="${TH}">No</th>
          <th rowspan="2" style="${TH}width:25%;">Training Institute</th>
          <th colspan="3" style="${TH}">Registered</th>
          <th colspan="3" style="${TH}">Assessed</th>
          <th colspan="3" style="${TH}">Competent</th>
          <th colspan="3" style="${TH}">NYC: Knowledge</th>
          <th colspan="3" style="${TH}">NYC: Practice</th>
          <th colspan="3" style="${TH}">NYC: Both</th>
        </tr>
        <tr>${headers}</tr>
      </thead>
      <tbody>
        <tr>
          ${td(1)}${td("SHEWA BIRHAN COLLEGE", "text-align:left;font-weight:bold;")}
          ${td(mReg)}${td(fReg)}${td(mReg + fReg, "font-weight:bold;background:#f4f4f5;")}
          ${td(mReg)}${td(fReg)}${td(mReg + fReg, "font-weight:bold;background:#f4f4f5;")}
          ${td(mC, "color:green;font-weight:bold;")}${td(fC, "color:green;font-weight:bold;")}${td(mC + fC, "color:green;font-weight:bold;background:#e8f5e9;")}
          ${td(mK)}${td(fK)}${td(mK + fK, "font-weight:bold;")}
          ${td(mP)}${td(fP)}${td(mP + fP, "font-weight:bold;")}
          ${td(mB)}${td(fB)}${td(mB + fB, "font-weight:bold;background:#ffebee;")}
        </tr>
        <tr style="font-weight:bold;background:#f4f4f5;">
          <td style="${TS}" colspan="2">TOTAL</td>
          ${[mReg, fReg, mReg + fReg, mReg, fReg, mReg + fReg, mC, fC, mC + fC, mK, fK, mK + fK, mP, fP, mP + fP, mB, fB, mB + fB].map((v) => `<td style="${TS}">${v}</td>`).join("")}
        </tr>
      </tbody>
    </table>` +
    getSignatureBlock(sigs)
  );
}

function buildForm11(data, deptFilter, dateRange, sigs, cl) {
  const mReg = data.filter((s) => s.sex === "Male").length;
  const fReg = data.filter((s) => s.sex === "Female").length;
  const mC = data.filter(
    (s) => s.sex === "Male" && s.status === "Competent",
  ).length;
  const fC = data.filter(
    (s) => s.sex === "Female" && s.status === "Competent",
  ).length;
  const label =
    deptFilter === "All"
      ? "WEB DEVELOPMENT AND DATABASE ADMINISTRATION"
      : deptFilter.toUpperCase();
  const mfth = ["M", "F", "T", "M", "F", "T", "M", "F", "T"]
    .map((h) => `<th style="${TH}">${h}</th>`)
    .join("");
  return (
    `<div style="text-align:center;font-weight:bold;font-size:15px;margin-bottom:5px;">Form-11</div>
    <div style="text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;">
      Debrebirhan Occupational Competence Assessment And Certification Cluster Center
    </div>
    <div style="text-align:center;font-weight:bold;font-size:14px;text-decoration:underline;margin:10px 0;">ASSESSMENT DATA TRANSFER SHEET</div>
    <p style="font-size:11px;margin-bottom:10px;"><b>Assessment Center:</b> SHEWA BIRHAN COLLEGE &nbsp;|&nbsp; <b>Duration:</b> ${dateRange}</p>
    ${classificationBox(cl)}
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th rowspan="2" style="${TH}">No</th>
          <th rowspan="2" style="${TH}width:40%;">Occupation Field</th>
          <th rowspan="2" style="${TH}">Level</th>
          <th colspan="3" style="${TH}">Registered</th>
          <th colspan="3" style="${TH}">Evaluated</th>
          <th colspan="3" style="${TH}">Competent</th>
        </tr>
        <tr>${mfth}</tr>
      </thead>
      <tbody>
        <tr>
          <td style="${TS}">1</td>
          <td style="${TS}text-align:left;font-weight:bold;">${label}</td>
          <td style="${TS}">Level IV</td>
          <td style="${TS}">${mReg}</td><td style="${TS}">${fReg}</td><td style="${TS}font-weight:bold;background:#f4f4f5;">${data.length}</td>
          <td style="${TS}">${mReg}</td><td style="${TS}">${fReg}</td><td style="${TS}font-weight:bold;background:#f4f4f5;">${data.length}</td>
          <td style="${TS}color:green;font-weight:bold;">${mC}</td><td style="${TS}color:green;font-weight:bold;">${fC}</td><td style="${TS}color:green;font-weight:bold;background:#e8f5e9;">${mC + fC}</td>
        </tr>
        <tr style="font-weight:bold;background:#f4f4f5;">
          <td style="${TS}" colspan="3">TOTAL TRANSFERS</td>
          <td style="${TS}">${mReg}</td><td style="${TS}">${fReg}</td><td style="${TS}">${data.length}</td>
          <td style="${TS}">${mReg}</td><td style="${TS}">${fReg}</td><td style="${TS}">${data.length}</td>
          <td style="${TS}color:green;">${mC}</td><td style="${TS}color:green;">${fC}</td><td style="${TS}color:green;background:#e8f5e9;">${mC + fC}</td>
        </tr>
      </tbody>
    </table>` + getSignatureBlock(sigs)
  );
}

function buildCompetencyList(data, deptFilter, dateRange, sigs) {
  const comp = data.filter((s) => s.status === "Competent");
  const label =
    deptFilter === "All"
      ? "WEB DEVELOPMENT AND DATABASE ADMINISTRATION"
      : deptFilter.toUpperCase();
  const level = "Level IV";

  const rows = comp
    .map((s, i) => {
      const name =
        s.name ||
        [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
      const sex = s.sex === "Female" ? "F" : "M";
      const occField = (s.dept || label).toUpperCase();
      return `<tr>
      <td style="${TS}">${i + 1}</td>
      <td style="${TS}text-align:left;font-weight:bold;padding:6px 8px;">${name}</td>
      <td style="${TS}">${sex}</td>
      <td style="${TS}text-align:left;padding:6px 6px;font-size:10px;">${occField}</td>
      <td style="${TS}">${level}</td>
      <td style="${TS}"></td>
    </tr>`;
    })
    .join("");

  return (
    `
    <div style="text-align:center;margin-bottom:15px;font-weight:bold;line-height:1.8;">
      DEBREBIRHAN OCCUPATIONAL COMPETENCE ASSESSMENT CLUSTER CENTER<br>
      <span style="font-size:14px;text-decoration:underline;">LIST OF COMPETENT CANDIDATES</span><br>
      <span style="font-size:11px;font-weight:500;">
        <b>Assessment Center:</b> SHEWA BIRHAN COLLEGE &nbsp;|&nbsp; <b>Date:</b> ${dateRange}
      </span>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      <thead>
        <tr>
          <th style="${TH}width:5%;">No</th>
          <th style="${TH}width:30%;">Competent Candidate Name</th>
          <th style="${TH}width:6%;">Sex</th>
          <th style="${TH}width:35%;">Certified Occupation Field</th>
          <th style="${TH}width:10%;">Level</th>
          <th style="${TH}width:14%;">Remark</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="6" style="${TS}padding:20px;color:#64748b;">No competent candidates yet.</td></tr>`}
      </tbody>
    </table>` + getSignatureBlock(sigs)
  );
}

// ── Excel export helpers ──────────────────────────────────────────────────

function exportFormA(data, dateRange) {
  const rows = data.map((s, i) => {
    const name =
      s.name ||
      [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
    return {
      No: i + 1,
      "Full Name": name,
      Sex: s.sex === "Female" ? "F" : "M",
      Institution: s.institution || "",
      "Ownership – Gov": s.owner === "Government" ? "X" : "",
      "Ownership – Priv": s.owner === "Private" ? "X" : "",
      "Program – Regular": s.prog === "Regular" ? "X" : "",
      "Program – Extension": s.prog === "Extension" ? "X" : "",
      "Program – Distance": s.prog === "Distance" ? "X" : "",
      "Emp – Gov": s.emp === "Government" ? "X" : "",
      "Emp – Private": s.emp === "Private Sector" ? "X" : "",
      "Emp – Self": s.emp === "Self Employment" ? "X" : "",
      "Emp – Unemployed": s.emp === "Unemployment" ? "X" : "",
      Competent: s.status === "Competent" ? "X" : "",
      "NYC – Knowledge": s.failType === "Only Knowledge" ? "X" : "",
      "NYC – Practice": s.failType === "Only Practice" ? "X" : "",
      "NYC – Both": s.failType === "Both" ? "X" : "",
    };
  });
  writeExcel(rows, `Form_A_${dateRange.replace(/\s/g, "_")}`);
}

function exportFormB(data, dateRange) {
  const mReg = data.filter((s) => s.sex === "Male").length;
  const fReg = data.filter((s) => s.sex === "Female").length;
  const mC = data.filter(
    (s) => s.sex === "Male" && s.status === "Competent",
  ).length;
  const fC = data.filter(
    (s) => s.sex === "Female" && s.status === "Competent",
  ).length;
  const mK = data.filter(
    (s) => s.sex === "Male" && s.failType === "Only Knowledge",
  ).length;
  const fK = data.filter(
    (s) => s.sex === "Female" && s.failType === "Only Knowledge",
  ).length;
  const mP = data.filter(
    (s) => s.sex === "Male" && s.failType === "Only Practice",
  ).length;
  const fP = data.filter(
    (s) => s.sex === "Female" && s.failType === "Only Practice",
  ).length;
  const mB = data.filter(
    (s) => s.sex === "Male" && s.failType === "Both",
  ).length;
  const fB = data.filter(
    (s) => s.sex === "Female" && s.failType === "Both",
  ).length;
  const rows = [
    {
      Institution: "SHEWA BIRHAN COLLEGE",
      "Registered – M": mReg,
      "Registered – F": fReg,
      "Registered – Total": mReg + fReg,
      "Assessed – M": mReg,
      "Assessed – F": fReg,
      "Assessed – Total": mReg + fReg,
      "Competent – M": mC,
      "Competent – F": fC,
      "Competent – Total": mC + fC,
      "NYC Knowledge – M": mK,
      "NYC Knowledge – F": fK,
      "NYC Knowledge – Total": mK + fK,
      "NYC Practice – M": mP,
      "NYC Practice – F": fP,
      "NYC Practice – Total": mP + fP,
      "NYC Both – M": mB,
      "NYC Both – F": fB,
      "NYC Both – Total": mB + fB,
    },
  ];
  writeExcel(rows, `Form_B_${dateRange.replace(/\s/g, "_")}`);
}

function exportForm11(data, deptFilter, dateRange) {
  const mReg = data.filter((s) => s.sex === "Male").length;
  const fReg = data.filter((s) => s.sex === "Female").length;
  const mC = data.filter(
    (s) => s.sex === "Male" && s.status === "Competent",
  ).length;
  const fC = data.filter(
    (s) => s.sex === "Female" && s.status === "Competent",
  ).length;
  const label =
    deptFilter === "All"
      ? "WEB DEVELOPMENT AND DATABASE ADMINISTRATION"
      : deptFilter.toUpperCase();
  const rows = [
    {
      "Occupation Field": label,
      Level: "Level IV",
      "Registered – M": mReg,
      "Registered – F": fReg,
      "Registered – Total": data.length,
      "Evaluated – M": mReg,
      "Evaluated – F": fReg,
      "Evaluated – Total": data.length,
      "Competent – M": mC,
      "Competent – F": fC,
      "Competent – Total": mC + fC,
    },
  ];
  writeExcel(rows, `Form_11_${dateRange.replace(/\s/g, "_")}`);
}

function exportCompetencyList(data, deptFilter, dateRange) {
  const comp = data.filter((s) => s.status === "Competent");
  const label =
    deptFilter === "All"
      ? "WEB DEVELOPMENT AND DATABASE ADMINISTRATION"
      : deptFilter.toUpperCase();
  const rows = comp.map((s, i) => ({
    No: i + 1,
    "Competent Candidate Name":
      s.name ||
      [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" "),
    Sex: s.sex === "Female" ? "F" : "M",
    "Certified Occupation Field": label,
    Level: "Level IV",
    Remark: "",
  }));
  writeExcel(rows, `List_of_Competency_${dateRange.replace(/\s/g, "_")}`);
}

function writeExcel(rows, filename) {
  if (!rows || rows.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export default function ReportPage() {
  const { form } = useParams();
  const { candidates, fetchCandidates } = useCandidates();
  const { settings } = useSettings();

  const [deptFilter, setDeptFilter] = useState("All");
  const [purpose, setPurpose] = useState("graduation");
  const [trainer, setTrainer] = useState("A");
  const [dateRange, setDateRange] = useState(
    "02/10/2018 E.C TO 05/10/2018 E.C",
  );
  const [cl, setCl] = useState({ ...DEFAULT_CLASSIFICATION });
  const [sigs, setSigs] = useState({
    registrar: "TARIK DABOT SEMAGN",
    assessment: "ZAKARIAS GENET",
    supervisor: "AYNALEM DEGNET",
  });

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    setSigs({
      registrar: settings.sigRegistrar || "TARIK DABOT SEMAGN",
      assessment: settings.sigAssessment || "ZAKARIAS GENET",
      supervisor: settings.sigSupervisor || "AYNALEM DEGNET",
    });
  }, [settings]);

  const data = candidates.filter(
    (c) => deptFilter === "All" || c.dept === deptFilter,
  );
  const showPurpose = form === "FormA" || form === "FormB";
  const showForm11 = form === "Form11";

  const getHTML = () => {
    if (form === "FormA")
      return buildFormA(data, purpose, trainer, dateRange, sigs);
    if (form === "FormB")
      return buildFormB(data, purpose, trainer, dateRange, sigs);
    if (form === "Form11")
      return buildForm11(data, deptFilter, dateRange, sigs, cl);
    if (form === "Competency")
      return buildCompetencyList(data, deptFilter, dateRange, sigs);
    return "<p>Unknown form type.</p>";
  };

  const handleExport = () => {
    if (form === "FormA") exportFormA(data, dateRange);
    else if (form === "FormB") exportFormB(data, dateRange);
    else if (form === "Form11") exportForm11(data, deptFilter, dateRange);
    else if (form === "Competency")
      exportCompetencyList(data, deptFilter, dateRange);
  };

  const inp = {
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    background: "#fff",
  };
  const lbl = {
    fontSize: 13,
    fontWeight: 600,
    color: "#475569",
    display: "block",
    marginBottom: 6,
  };

  return (
    <div>
      <div
        className="no-print"
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          padding: 20,
          marginBottom: 24,
        }}
      >
        {/* Signature inputs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 15,
            marginBottom: 16,
            background: "#f1f5f9",
            padding: 20,
            borderRadius: 8,
          }}
        >
          {[
            ["registrar", "Head of Registrar Office"],
            ["assessment", "Head of Assessment Center"],
            ["supervisor", "OCACA Assigned Supervisor"],
          ].map(([key, label]) => (
            <div key={key}>
              <label style={{ ...lbl, color: "#2563eb" }}>
                <i className="fa-solid fa-pen-nib" style={{ marginRight: 6 }} />
                {label}
              </label>
              <input
                type="text"
                value={sigs[key] || ""}
                onChange={(e) =>
                  setSigs((p) => ({ ...p, [key]: e.target.value }))
                }
                style={{ ...inp, width: "100%" }}
              />
            </div>
          ))}
        </div>

        {/* Filter controls */}
        <div
          style={{
            display: "flex",
            gap: 15,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div>
            <label style={lbl}>Occupation Filter</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={inp}
            >
              {DEPT_OPTIONS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          {showPurpose && (
            <>
              <div>
                <label style={lbl}>Assessment Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  style={inp}
                >
                  <option value="graduation">Graduation</option>
                  <option value="promotion">Level to level promotion</option>
                  <option value="shortterm">Short-term training</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Trainer Level</label>
                <select
                  value={trainer}
                  onChange={(e) => setTrainer(e.target.value)}
                  style={inp}
                >
                  <option value="A">A-Level</option>
                  <option value="B">B-Level</option>
                  <option value="C">C-Level</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label style={lbl}>Assessment Duration</label>
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ ...inp, width: 280 }}
            />
          </div>
          <button
            onClick={() => window.print()}
            style={{
              padding: "10px 18px",
              background: "#4b5563",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="fa-solid fa-print" /> Print Report
          </button>
          <button
            onClick={handleExport}
            style={{
              padding: "10px 18px",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="fa-solid fa-file-excel" /> Export Excel
          </button>
        </div>

        {/* ── Form 11 Classification Panel — between filters and duration ── */}
        {showForm11 && (
          <div
            style={{
              marginTop: 18,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 14,
                textTransform: "uppercase",
                letterSpacing: ".04em",
              }}
            >
              <i
                className="fa-solid fa-list-check"
                style={{ color: "#2563eb", marginRight: 8 }}
              />
              Classification of Candidates
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {/* Group 1 */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "12px 14px",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1e40af",
                    marginBottom: 10,
                  }}
                >
                  1. Level Teachers
                </div>
                {[
                  ["aLevelTeacher", "A-Level Teachers"],
                  ["bLevelTeacher", "B-Level Teachers"],
                  ["cLevelTeacher", "C-Level Teachers"],
                ].map(([k, label]) => (
                  <label
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "#334155",
                      cursor: "pointer",
                      marginBottom: 7,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={cl[k]}
                      onChange={(e) =>
                        setCl((p) => ({ ...p, [k]: e.target.checked }))
                      }
                      style={{
                        accentColor: "#16a34a",
                        width: 15,
                        height: 15,
                        cursor: "pointer",
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Group 2 */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "12px 14px",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1e40af",
                    marginBottom: 10,
                  }}
                >
                  2. Trainees
                </div>
                {[
                  ["tvetCompleter", "2018 E.C TVET Completer / Graduates"],
                  ["shortTerm", "Short-Term Training"],
                  ["levelPromotion", "Level to Level Promotion"],
                ].map(([k, label]) => (
                  <label
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "#334155",
                      cursor: "pointer",
                      marginBottom: 7,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={cl[k]}
                      onChange={(e) =>
                        setCl((p) => ({ ...p, [k]: e.target.checked }))
                      }
                      style={{
                        accentColor: "#16a34a",
                        width: 15,
                        height: 15,
                        cursor: "pointer",
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Group 3 */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "12px 14px",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1e40af",
                    marginBottom: 10,
                  }}
                >
                  3. Employees
                </div>
                {[
                  ["microSmall", "Micro & Small Enterprises"],
                  ["mediumLarge", "Medium & Large Industry Workers"],
                  ["peasants", "Peasants / Pastoralists"],
                ].map(([k, label]) => (
                  <label
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "#334155",
                      cursor: "pointer",
                      marginBottom: 7,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={cl[k]}
                      onChange={(e) =>
                        setCl((p) => ({ ...p, [k]: e.target.checked }))
                      }
                      style={{
                        accentColor: "#16a34a",
                        width: 15,
                        height: 15,
                        cursor: "pointer",
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Group 4 — Others (standalone) */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "12px 14px",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1e40af",
                    marginBottom: 10,
                  }}
                >
                  4. Others
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "#334155",
                    cursor: "pointer",
                    marginBottom: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={cl.others}
                    onChange={(e) =>
                      setCl((p) => ({ ...p, others: e.target.checked }))
                    }
                    style={{
                      accentColor: "#16a34a",
                      width: 15,
                      height: 15,
                      cursor: "pointer",
                    }}
                  />
                  Others
                </label>
                {cl.others && (
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#475569",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Specify (optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NGO staff, industry workers..."
                      value={cl.othersText}
                      onChange={(e) =>
                        setCl((p) => ({ ...p, othersText: e.target.value }))
                      }
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "1px solid #bfdbfe",
                        borderRadius: 6,
                        fontSize: 13,
                        outline: "none",
                        color: "#0f172a",
                        background: "#f0f9ff",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report canvas */}
      <div
        className="print-area"
        style={{
          background: "#fff",
          padding: 30,
          border: "1px solid #71717a",
          color: "#000",
          overflowX: "auto",
        }}
        dangerouslySetInnerHTML={{ __html: getHTML() }}
      />
    </div>
  );
}
