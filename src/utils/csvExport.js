/**
 * Utility function to convert survey data to CSV format
 * @param {Array} data - Array of survey response objects
 * @returns {string} - CSV formatted string
 */
export const convertToCSV = (data) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Get all unique keys from all objects
  const headers = [...new Set(data.flatMap(obj => Object.keys(obj)))];
  
  // Create CSV header row
  const csvHeaders = headers.map(header => `"${header}"`).join(',');
  
  // Create CSV data rows
  const csvRows = data.map(obj => {
    return headers.map(header => {
      const value = obj[header] || '';
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      const escapedValue = String(value).replace(/"/g, '""');
      return `"${escapedValue}"`;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (csvContent, filename = 'survey_responses.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
