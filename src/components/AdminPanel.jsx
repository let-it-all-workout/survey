import { useState, useEffect } from 'react';
import { getResponses, getStatistics, deleteResponse, adminLogin, clearAdminToken } from '../utils/api';
import { convertToCSV, downloadCSV } from '../utils/csvExport';
import './AdminPanel.css';

const AdminPanel = ({ onBack }) => {
  const [responses, setResponses] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalResponses, setTotalResponses] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    department: '',
    level: '',
    gender: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [responsesData, statsData] = await Promise.all([
        getResponses(filters),
        getStatistics()
      ]);

      setResponses(responsesData.data || []);
      setTotalResponses(responsesData.total || 0);
      setStatistics(statsData.data || null);
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.message === 'Unauthorized') {
        setIsAuthenticated(false);
        clearAdminToken();
        alert('Session expired. Please log in again.');
      } else {
        alert('Failed to load data. Make sure the server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await adminLogin(password);
      setIsAuthenticated(true);
      setPassword('');
    } catch {
      setLoginError('Incorrect password. Access denied.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    clearAdminToken();
    setPassword('');
    setFilters({
      department: '',
      level: '',
      gender: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      level: '',
      gender: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this response?')) {
      return;
    }

    try {
      await deleteResponse(id);
      await loadData();
      alert('Response deleted successfully');
    } catch (error) {
      alert('Failed to delete response');
    }
  };

  const handleExport = () => {
    if (responses.length === 0) {
      alert('No responses to export.');
      return;
    }

    const csvContent = convertToCSV(responses);
    const timestamp = new Date().toISOString().split('T')[0];
    const filterSuffix = filters.department || filters.level || filters.gender 
      ? '_filtered' 
      : '';
    const filename = `mobile_usage_survey${filterSuffix}_${timestamp}.csv`;
    
    downloadCSV(csvContent, filename);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="admin-login">
          <h2>Researcher Access</h2>
          <p>Enter password to view survey results</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              className="password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoFocus
            />
            {loginError && <p className="login-error">{loginError}</p>}
            <div className="login-actions">
              <button type="submit" className="btn btn-primary">
                Access Admin Panel
              </button>
              {onBack && (
                <button type="button" className="btn btn-secondary" onClick={onBack}>
                  Back to Survey
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Get unique values for filter dropdowns
  const departments = statistics?.departmentStats?.map(s => s.department) || [];
  const levels = statistics?.levelStats?.map(s => s.level) || [];
  const genders = statistics?.genderStats?.map(s => s.gender) || [];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Survey Results - Admin Panel</h1>
        <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      )}

      {statistics && (
        <div className="admin-stats">
          <div className="stat-card main-stat">
            <div className="stat-number">{totalResponses}</div>
            <div className="stat-label">Total Responses</div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-title">By Department</div>
              <div className="stat-list">
                {statistics.departmentStats?.slice(0, 5).map((stat, idx) => (
                  <div key={idx} className="stat-item">
                    <span>{stat.department}</span>
                    <span className="stat-count">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">By Level</div>
              <div className="stat-list">
                {statistics.levelStats?.map((stat, idx) => (
                  <div key={idx} className="stat-item">
                    <span>{stat.level}</span>
                    <span className="stat-count">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">By Gender</div>
              <div className="stat-list">
                {statistics.genderStats?.map((stat, idx) => (
                  <div key={idx} className="stat-item">
                    <span>{stat.gender}</span>
                    <span className="stat-count">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="filters-section">
        <h2>Filters</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Department</label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Level</label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
            >
              <option value="">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Gender</label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
            >
              <option value="">All Genders</option>
              {genders.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
            <button className="btn btn-primary" onClick={handleExport}>
              Export Filtered Results
            </button>
          </div>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="no-responses">
          <p>No responses found{Object.values(filters).some(f => f) ? ' matching your filters' : ''}.</p>
          {!Object.values(filters).some(f => f) && (
            <p>Responses will appear here once students submit the survey.</p>
          )}
        </div>
      ) : (
        <>
          <div className="responses-header">
            <h2>Responses ({totalResponses})</h2>
            <button className="btn btn-primary" onClick={handleExport}>
              Export All to CSV
            </button>
          </div>

          <div className="responses-preview">
            <div className="responses-list">
              {responses.map((response) => (
                <div key={response.id} className="response-card">
                  <div className="response-header">
                    <span className="response-number">Response #{response.id}</span>
                    <span className="response-date">
                      {new Date(response.submittedAt).toLocaleString()}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(response.id)}
                      title="Delete response"
                    >
                      ×
                    </button>
                  </div>
                  <div className="response-details">
                    <div className="detail-row">
                      <strong>Matric Number:</strong> {response.matric_number || 'N/A'}
                    </div>
                    <div className="detail-row">
                      <strong>Department:</strong> {response.department || 'N/A'}
                    </div>
                    <div className="detail-row">
                      <strong>Level:</strong> {response.level || 'N/A'}
                    </div>
                    <div className="detail-row">
                      <strong>Gender:</strong> {response.gender || 'N/A'}
                    </div>
                    <div className="detail-row">
                      <strong>Hours per day:</strong> {response.hours_per_day || 'N/A'}
                    </div>
                    {response.recommendations && (
                      <div className="detail-row">
                        <strong>Recommendation:</strong> {response.recommendations}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {onBack && (
        <div className="admin-footer">
          <button className="btn btn-secondary" onClick={onBack}>
            Back to Survey
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
