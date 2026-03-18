import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, copyFileSync, renameSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = join(__dirname, 'responses.json');
const DATA_BACKUP_FILE = join(__dirname, 'responses.backup.json');
const DATA_TEMP_FILE = join(__dirname, 'responses.tmp.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'researcher2024';
const ALLOW_TEST_DATE_OVERRIDE = process.env.ALLOW_TEST_DATE_OVERRIDE === 'true';
const RATE_LIMIT_WINDOW = Number(process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000);
const MAX_SUBMISSIONS_PER_WINDOW = Number(process.env.MAX_SUBMISSIONS_PER_WINDOW || 3);
const SEED_BYPASS_TOKEN = process.env.SEED_BYPASS_TOKEN || '';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50kb' }));

// Rate limiting - simple in-memory tracker
const rateLimitMap = new Map();

const checkRateLimit = (ip) => {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }

  if (record.count >= MAX_SUBMISSIONS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
};

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap) {
    if (now - record.windowStart > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
};

// Initialize data file if it doesn't exist
if (!existsSync(DATA_FILE)) {
  if (existsSync(DATA_BACKUP_FILE)) {
    copyFileSync(DATA_BACKUP_FILE, DATA_FILE);
    console.warn('Recovered responses.json from backup file.');
  } else {
    writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

// Helper functions
const readResponses = () => {
  const parseArrayFile = (path) => {
    const raw = readFileSync(path, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error(`${path} does not contain an array`);
    }
    return parsed;
  };

  try {
    return parseArrayFile(DATA_FILE);
  } catch (error) {
    console.error('Error reading primary responses file:', error.message);
    if (existsSync(DATA_BACKUP_FILE)) {
      try {
        const recovered = parseArrayFile(DATA_BACKUP_FILE);
        console.warn('Using backup responses file due to primary file read failure.');
        return recovered;
      } catch (backupError) {
        console.error('Error reading backup responses file:', backupError.message);
      }
    }

    throw new Error('Unable to read survey responses safely');
  }
};

const writeResponses = (responses) => {
  try {
    // Keep a backup of the last known-good file.
    if (existsSync(DATA_FILE)) {
      copyFileSync(DATA_FILE, DATA_BACKUP_FILE);
    }

    // Atomic-ish write: write temp then rename.
    writeFileSync(DATA_TEMP_FILE, JSON.stringify(responses, null, 2));
    renameSync(DATA_TEMP_FILE, DATA_FILE);
    return true;
  } catch (error) {
    console.error('Error writing responses:', error);
    return false;
  }
};

// Sanitize string input
const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().slice(0, 500);
};

const parseOverrideDate = (value) => {
  if (typeof value !== 'string') return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const canBypassRateLimit = (req) => {
  if (!SEED_BYPASS_TOKEN) return false;
  const seedHeader = req.headers['x-seed-token'];
  // Allow bypass only for explicit seeded submissions with override date.
  return seedHeader === SEED_BYPASS_TOKEN && typeof req.body?.submittedAtOverride === 'string';
};

// Whitelist of allowed fields from the survey
const ALLOWED_FIELDS = [
  'matric_number', 'department', 'department_other', 'level', 'gender',
  'hours_per_day', 'primary_uses', 'lecture_distraction',
  'academic_performance', 'concentration', 'sleep_impact',
  'social_impact', 'health_issues', 'dependency', 'recommendations'
];

// Routes

// Admin login verification (server-side)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect password' });
  }
});

// Submit survey response (public, rate-limited)
app.post('/api/responses', (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const bypassRateLimit = canBypassRateLimit(req);
    if (!bypassRateLimit && !checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Too many submissions. Please wait a minute before trying again.'
      });
    }

    const data = req.body;

    // Validate matric number is present
    if (!data.matric_number || typeof data.matric_number !== 'string' || data.matric_number.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Valid matric number is required' });
    }

    // Check for duplicate matric number
    const responses = readResponses();
    const normalizedMatric = data.matric_number.trim().toUpperCase();
    const duplicate = responses.find(
      r => r.matric_number && r.matric_number.toUpperCase() === normalizedMatric
    );
    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: 'This matric number has already submitted a response.'
      });
    }

    // Build response with only allowed fields, sanitized
    const sanitizedData = {};
    for (const field of ALLOWED_FIELDS) {
      if (data[field] !== undefined) {
        if (Array.isArray(data[field])) {
          sanitizedData[field] = data[field].map(v => sanitize(String(v))).slice(0, 20);
        } else {
          sanitizedData[field] = sanitize(String(data[field]));
        }
      }
    }

    const submittedAtOverride =
      ALLOW_TEST_DATE_OVERRIDE ? parseOverrideDate(data.submittedAtOverride) : null;

    const newResponse = {
      id: responses.length > 0 ? Math.max(...responses.map(r => r.id)) + 1 : 1,
      ...sanitizedData,
      submittedAt: submittedAtOverride || new Date().toISOString()
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
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get all responses with filtering (admin only)
app.get('/api/responses', requireAdmin, (req, res) => {
  try {
    const { department, level, gender, startDate, endDate } = req.query;
    let responses = readResponses();

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

    responses.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    res.json({
      success: true,
      data: responses,
      total: responses.length
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get statistics (admin only)
app.get('/api/statistics', requireAdmin, (req, res) => {
  try {
    const responses = readResponses();

    const departmentStats = {};
    const levelStats = {};
    const genderStats = {};
    const hoursStats = {};

    responses.forEach(response => {
      if (response.department) {
        departmentStats[response.department] = (departmentStats[response.department] || 0) + 1;
      }
      if (response.level) {
        levelStats[response.level] = (levelStats[response.level] || 0) + 1;
      }
      if (response.gender) {
        genderStats[response.gender] = (genderStats[response.gender] || 0) + 1;
      }
      if (response.hours_per_day) {
        hoursStats[response.hours_per_day] = (hoursStats[response.hours_per_day] || 0) + 1;
      }
    });

    const toSortedArray = (obj, key) =>
      Object.entries(obj)
        .map(([name, count]) => ({ [key]: name, count }))
        .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        totalResponses: responses.length,
        departmentStats: toSortedArray(departmentStats, 'department'),
        levelStats: toSortedArray(levelStats, 'level'),
        genderStats: toSortedArray(genderStats, 'gender'),
        hoursStats: toSortedArray(hoursStats, 'hours_per_day')
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete response (admin only)
app.delete('/api/responses/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const responseId = parseInt(id);

    if (isNaN(responseId)) {
      return res.status(400).json({ success: false, error: 'Invalid response ID' });
    }

    const responses = readResponses();
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
    res.status(500).json({ success: false, error: 'Internal server error' });
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
