/**
 * Utility function to convert survey data to CSV format
 * @param {Array} data - Array of survey response objects
 * @returns {string} - CSV formatted string
 */
export const convertToCSV = (data) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Keep a predictable, report-friendly column order.
  const preferredHeaders = [
    'id',
    'submittedAt',
    'matric_number',
    'department',
    'department_other',
    'level',
    'gender',
    'hours_per_day',
    'primary_uses',
    'lecture_distraction',
    'academic_performance',
    'concentration',
    'sleep_impact',
    'social_impact',
    'health_issues',
    'dependency',
    'recommendations'
  ];

  const discoveredHeaders = [...new Set(data.flatMap((obj) => Object.keys(obj)))];
  const extraHeaders = discoveredHeaders.filter((header) => !preferredHeaders.includes(header));
  const headers = [...preferredHeaders.filter((header) => discoveredHeaders.includes(header)), ...extraHeaders];

  const headerLabels = {
    id: 'Response ID',
    submittedAt: 'Submitted At',
    matric_number: 'Matric Number',
    department: 'Department',
    department_other: 'Department (Other)',
    level: 'Level',
    gender: 'Gender',
    hours_per_day: 'Hours Per Day',
    primary_uses: 'Primary Uses',
    lecture_distraction: 'Phone Use During Lectures',
    academic_performance: 'Academic Performance Impact',
    concentration: 'Concentration Impact',
    sleep_impact: 'Sleep Impact',
    social_impact: 'Social Impact',
    health_issues: 'Health Issues',
    dependency: 'Phone Dependency',
    recommendations: 'Recommendations'
  };

  const toCsvCell = (value) => {
    if (value === null || value === undefined) return '""';

    let text = value;
    if (Array.isArray(text)) {
      text = text.join(' | ');
    }

    text = String(text).replace(/\r?\n/g, ' ').trim();
    const escapedValue = text.replace(/"/g, '""');
    return `"${escapedValue}"`;
  };

  const csvHeaders = headers
    .map((header) => toCsvCell(headerLabels[header] || header))
    .join(',');

  const csvRows = data.map((obj) => headers.map((header) => toCsvCell(obj[header])).join(','));

  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (csvContent, filename = 'survey_responses.csv') => {
  // BOM helps Excel open UTF-8 CSV properly.
  const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
