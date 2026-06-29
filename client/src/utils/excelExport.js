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
 * Download a blank Bulk Registration Excel template.
 * Only First Name, Last Name, and Sex are required — all others are optional.
 */
export function downloadBulkTemplate() {
  const headers = [
    'Registration Date', 'First Name *', 'Middle Name', 'Last Name *', 'Sex *', 'Age',
    'Occupation', 'Level', 'Region', 'Zone', 'Wereda', 'Mobile No',
    'Name of Institution', 'Department', 'Institution Ownership', 'Training Program',
    'Employment Status', 'Trainer/Completer Type', 'Enterprise Size', 'Assessment Type',
  ];

  // Row 1: hint row showing what's required
  const hint = {
    'Registration Date':     '(optional) YYYY-MM-DD',
    'First Name *':          '(REQUIRED)',
    'Middle Name':           '(optional)',
    'Last Name *':           '(REQUIRED)',
    'Sex *':                 '(REQUIRED) Male or Female',
    'Age':                   '(optional) number',
    'Occupation':            '(optional)',
    'Level':                 '(optional) e.g. Level III',
    'Region':                '(optional)',
    'Zone':                  '(optional)',
    'Wereda':                '(optional)',
    'Mobile No':             '(optional)',
    'Name of Institution':   '(optional) defaults to SHEWA BIRHAN COLLEGE',
    'Department':            '(optional) defaults to WEB DEVELOPMENT AND DATABASE ADMINSTRATION',
    'Institution Ownership': '(optional) Government / Private / NGO',
    'Training Program':      '(optional) Regular / Extension / Distance',
    'Employment Status':     '(optional) Government / Private Sector / Self Employment / Unemployment',
    'Trainer/Completer Type':'(optional)',
    'Enterprise Size':       '(optional)',
    'Assessment Type':       '(optional) First Time / Re-assessment',
  };

  // Row 2: sample data
  const sample = {
    'Registration Date':     new Date().toISOString().slice(0, 10),
    'First Name *':          'ABEBE',
    'Middle Name':           'BEKELE',
    'Last Name *':           'CHALA',
    'Sex *':                 'Male',
    'Age':                   '25',
    'Occupation':            'Web Developer',
    'Level':                 'Level III',
    'Region':                'Amhara',
    'Zone':                  'North Shewa',
    'Wereda':                'Efratana Gidem',
    'Mobile No':             '0911234567',
    'Name of Institution':   'SHEWA BIRHAN COLLEGE',
    'Department':            'WEB DEVELOPMENT AND DATABASE ADMINSTRATION',
    'Institution Ownership': 'Private',
    'Training Program':      'Regular',
    'Employment Status':     'Unemployment',
    'Trainer/Completer Type':'',
    'Enterprise Size':       '',
    'Assessment Type':       'First Time',
  };

  const ws = XLSX.utils.json_to_sheet([hint, sample], { header: headers });
  ws['!cols'] = headers.map(() => ({ wch: 28 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bulk Registration');
  XLSX.writeFile(wb, 'Bulk_Registration_Template.xlsx');
}
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
