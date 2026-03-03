# Handset Usage Survey Application

A beautiful, simple, and responsive survey application with a full backend database system for collecting and managing data on handset usage effects among Legacy University Okija students.

## Features

- **Simple UX**: One question per screen with large, touch-friendly buttons
- **Beautiful Design**: Modern, clean interface with smooth animations
- **Mobile-First**: Fully responsive design optimized for mobile devices
- **Progress Tracking**: Visual progress bar and auto-save functionality
- **Database Storage**: SQLite database automatically stores all responses
- **Admin Panel**: Advanced filtering, statistics, and export capabilities
- **Filtered Export**: Export filtered results based on department, level, gender, date range
- **Real-time Statistics**: View statistics by department, level, gender, and usage patterns

## Technology Stack

### Frontend
- React 19
- Vite
- CSS3 (Custom styling)

### Backend
- Node.js
- Express.js
- SQLite (better-sqlite3)
- RESTful API

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install frontend dependencies:**
```bash
npm install
```

2. **Install backend dependencies:**
```bash
npm run server:install
```

### Running the Application

**Option 1: Run frontend and backend separately**

Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

**Option 2: Run both together (requires concurrently)**
```bash
npm install -g concurrently
npm run dev:all
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

### Production Build

```bash
npm run build
npm run server:start
```

## Survey Sections

1. **Demographics**: Department, Level, Age, Gender
2. **Usage Patterns**: Hours per day, primary uses, apps used
3. **Academic Impact**: Study habits, lecture distractions, academic performance
4. **Health & Social**: Sleep patterns, social interactions, physical health
5. **Open-ended**: Positive/negative effects, recommendations

## Usage

### For Students (Survey Participants)

1. Open the application in a web browser: `http://localhost:5173`
2. Answer each question (one at a time)
3. Use Previous/Next buttons to navigate
4. Submit the survey when complete
5. You will see a success message - your response is automatically saved to the database

### For Researcher (Admin Access)

1. **Access Admin Panel**: Add `#admin` to the URL (e.g., `http://localhost:5173/#admin`)
2. **Login**: Enter the password (default: `researcher2024`)
3. **View Statistics**: See real-time statistics by department, level, gender, and usage patterns
4. **Filter Responses**: Use filters to narrow down responses by:
   - Department
   - Level/Year
   - Gender
   - Date range
5. **Export Data**: Export filtered or all responses to CSV format
6. **Manage Responses**: View, search, and delete individual responses

## Database

- **Location**: `server/survey.db` (SQLite database file)
- **Backup**: Simply copy the `survey.db` file to backup your data
- **Automatic**: All responses are automatically saved to the database

## API Endpoints

- `POST /api/responses` - Submit a new survey response
- `GET /api/responses` - Get all responses (with optional filters)
- `GET /api/statistics` - Get aggregated statistics
- `DELETE /api/responses/:id` - Delete a specific response
- `GET /api/health` - Health check endpoint

## Configuration

### Change Admin Password

Edit `src/components/AdminPanel.jsx` line 11:
```javascript
const ADMIN_PASSWORD = 'your-new-password';
```

### Change API URL

Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:3001/api
```

## Data Collection

- Responses are automatically stored in SQLite database
- No manual export needed - data is always available
- Filter and export only what you need
- Real-time statistics and analytics
- Supports hundreds of responses efficiently

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

**Backend won't start:**
- Make sure port 3001 is not in use
- Check that all dependencies are installed: `npm run server:install`

**Frontend can't connect to backend:**
- Ensure backend is running on port 3001
- Check `.env` file has correct API URL

**Database errors:**
- Check file permissions for `server/survey.db`
- Ensure the `server` directory exists

## License

This project is created for academic research purposes.
