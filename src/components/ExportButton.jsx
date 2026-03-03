import { convertToCSV, downloadCSV } from '../utils/csvExport';
import './ExportButton.css';

const ExportButton = ({ responses }) => {
  const handleExport = () => {
    if (!responses || responses.length === 0) {
      alert('No responses to export. Please complete at least one survey.');
      return;
    }

    const csvContent = convertToCSV(responses);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `mobile_usage_survey_${timestamp}.csv`;
    
    downloadCSV(csvContent, filename);
  };

  return (
    <button 
      className="export-button" 
      onClick={handleExport}
      disabled={!responses || responses.length === 0}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Export to CSV
    </button>
  );
};

export default ExportButton;
