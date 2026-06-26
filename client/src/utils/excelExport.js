import * as XLSX from 'xlsx';

/**
 * Export any array of objects to a formatted Excel file.
 * @param {Array}  data      - Array of row objects
 * @param {String} filename  - Desired filename (without extension)
 * @param {Array}  headers   - Optional custom header mapping [{key, label}]
 */
export function exportToExcel(data, filename = 'Export', headers = null) {
  if (!data || data.length === 0) return;

  let rows;
  if (headers) {
    rows = data.map((row) => {
      const r = {};
      headers.forEach(({ key, label }) => { r[label] = row[key] ?? ''; });
      return r;
    });
  } else {
    rows = data;
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export candidates registry with proper column mapping.
 */
export function exportCandidates(candidates, filename = 'Candidates_Registry') {
  const headers = [
    { key: 'regDate',    label: 'Registration Date' },
    { key: 'name',       label: 'Full Name' },
    { key: 'firstName',  label: 'First Name' },
    { key: 'middleName', label: 'Middle Name' },
    { key: 'lastName',   label: 'Last Name' },
    { key: 'sex',        label: 'Sex' },
    { key: 'age',        label: 'Age' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'occLevel',   label: 'Level' },
    { key: 'region',     label: 'Region' },
    { key: 'zone',       label: 'Zone' },
    { key: 'wereda',     label: 'Wereda' },
    { key: 'mobile',     label: 'Mobile No' },
    { key: 'institution',        label: 'Name of Institution' },
    { key: 'institutionAddress', label: 'Address of Institution' },
    { key: 'dept',       label: 'Department' },
    { key: 'owner',      label: 'Institution Ownership' },
    { key: 'prog',       label: 'Training Program' },
    { key: 'emp',        label: 'Employment Status' },
    { key: 'empType',    label: 'Trainer/Completer Type' },
    { key: 'enterpriseSize', label: 'Enterprise Size' },
    { key: 'assessmentType', label: 'Assessment Type' },
    { key: 'status',     label: 'Status' },
    { key: 'failType',   label: 'Fail Type' },
  ];
  exportToExcel(candidates, filename, headers);
}

/**
 * Export department breakdown matrix.
 */
export function exportDeptMatrix(deptMatrix) {
  exportToExcel(
    deptMatrix.map((r) => ({
      Department:    r.dept,
      Registered:    r.registered,
      Assessed:      r.assessed,
      Competent:     r.competent,
      'Non-Competent': r.nonCompetent,
    })),
    'Department_Breakdown_Matrix'
  );
}
