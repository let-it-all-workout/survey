import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = join(__dirname, 'responses.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
if (!existsSync(DATA_FILE)) {
  writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helper functions
const readResponses = () => {
  try {
    const data = readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading responses:', error);
    return [];
  }
};

const writeResponses = (responses) => {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(responses, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing responses:', error);
    return false;
  }
};

// Routes

// Submit survey response
app.post('/api/responses', (req, res) => {
  try {
    const data = req.body;
    const responses = readResponses();
    
    const newResponse = {
      id: responses.length > 0 ? Math.max(...responses.map(r => r.id)) + 1 : 1,
      ...data,
      submittedAt: new Date().toISOString()
    };

    responses.push(newResponse);
    
    if (writeResponses(responses)) {
      res.json({ 
        success: true, 
        id: newResponse.id,
        message: 'Response saved successfully' 
      });
    } else {
      res.status(500).json({ success: false, error: 'Failed to save response' });
    }
  } catch (error) {
    console.error('Error saving response:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all responses with filtering
app.get('/api/responses', (req, res) => {
  try {
    const { department, level, gender, startDate, endDate } = req.query;
    let responses = readResponses();
    
    // Apply filters
    if (department) {
      responses = responses.filter(r => r.department === department);
    }
    if (level) {
      responses = responses.filter(r => r.level === level);
    }
    if (gender) {
      responses = responses.filter(r => r.gender === gender);
    }
    if (startDate) {
      responses = responses.filter(r => r.submittedAt >= startDate);
    }
    if (endDate) {
      responses = responses.filter(r => r.submittedAt <= endDate);
    }

    // Sort by submission date (newest first)
    responses.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    res.json({ 
      success: true, 
      data: responses, 
      total: responses.length
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get statistics
app.get('/api/statistics', (req, res) => {
  try {
    const responses = readResponses();
    
    const departmentStats = {};
    const levelStats = {};
    const genderStats = {};
    const hoursStats = {};

    responses.forEach(response => {
      // Department stats
      if (response.department) {
        departmentStats[response.department] = (departmentStats[response.department] || 0) + 1;
      }
      
      // Level stats
      if (response.level) {
        levelStats[response.level] = (levelStats[response.level] || 0) + 1;
      }
      
      // Gender stats
      if (response.gender) {
        genderStats[response.gender] = (genderStats[response.gender] || 0) + 1;
      }
      
      // Hours stats
      if (response.hours_per_day) {
        hoursStats[response.hours_per_day] = (hoursStats[response.hours_per_day] || 0) + 1;
      }
    });

    // Convert to array format
    const departmentArray = Object.entries(departmentStats)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);
    
    const levelArray = Object.entries(levelStats)
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => b.count - a.count);
    
    const genderArray = Object.entries(genderStats)
      .map(([gender, count]) => ({ gender, count }))
      .sort((a, b) => b.count - a.count);
    
    const hoursArray = Object.entries(hoursStats)
      .map(([hours_per_day, count]) => ({ hours_per_day, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        totalResponses: responses.length,
        departmentStats: departmentArray,
        levelStats: levelArray,
        genderStats: genderArray,
        hoursStats: hoursArray
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete response
app.delete('/api/responses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const responses = readResponses();
    const responseId = parseInt(id);
    
    const index = responses.findIndex(r => r.id === responseId);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Response not found' });
    }

    responses.splice(index, 1);
    
    if (writeResponses(responses)) {
      res.json({ success: true, message: 'Response deleted successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete response' });
    }
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Serve built frontend in production
const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
