
# Implementation & Testing Guide

## Quick Start

### 1. Backend Setup

```bash
# Navigate to project directory
cd "AI for Bharat"

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python -m uvicorn app.main:app --reload --port 8000
```

The backend will be available at: `http://localhost:8000`

**API Documentation:** `http://localhost:8000/docs` (Swagger UI)

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd "AI for Bharat/frontend"

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:5173` (or shown in terminal)

### 3. MongoDB Setup

Ensure MongoDB is running:
```bash
# On Windows (if installed)
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo:latest
```

---

## Key Files & Modules

### Backend Structure

```
app/
├── config.py                 # Languages, classifications, segments
├── main.py                   # FastAPI app initialization
├── database/
│   ├── database.py          # DB wrapper
│   └── mongo.py             # MongoDB connection
├── routes/
│   ├── candidates.py        # Candidate endpoints
│   ├── interviews.py        # Interview endpoints
│   ├── languages.py         # NEW: Language endpoints
│   ├── dashboard.py         # NEW: Dashboard endpoints
│   ├── transcribe.py        # Transcription
│   ├── uploads.py           # File uploads
│   ├── process_interview.py # Interview processing
│   └── health.py            # Health check
├── services/
│   ├── ai.py                # AI/Transcription
│   ├── candidate_service.py # Enhanced with new fields
│   ├── evaluation.py        # NEW: Advanced evaluation
│   ├── classification_service.py  # NEW: Classification logic
│   ├── fraud_detection.py   # NEW: Fraud detection
│   └── interview_service.py # Interview service
```

### Frontend Structure

```
frontend/
├── src/
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   ├── index.css            # Styles
│   ├── lib/
│   │   └── api.js           # API client
│   ├── components/
│   │   ├── TopNav.jsx       # Navigation
│   │   └── VideoRecorder.jsx # Video recording
│   └── pages/
│       ├── DashboardPage.jsx     # Enhanced admin dashboard
│       ├── InterviewPage.jsx     # Enhanced with language selection
│       ├── ResultPage.jsx        # Original results
│       └── ResultPage_enhanced.jsx  # NEW: Enhanced results display
```

---

## Testing the System

### 1. Test Basic Candidate Evaluation

**Endpoint:** `POST /candidates`

```bash
curl -X POST http://localhost:8000/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ravi Kumar",
    "transcript": "I have 5 years of experience in data entry. I am skilled in MS Excel, data management, and customer service. I have worked with various teams and completed projects on time.",
    "language": "en",
    "district": "Bangalore",
    "role": "Data Entry"
  }'
```

**Expected Response:**
```json
{
  "name": "Ravi Kumar",
  "score": 72,
  "category": "good",
  "classification": "training_needed",
  "evaluation": {
    "relevance_score": 20,
    "completeness_score": 16,
    "clarity_score": 18,
    "confidence_score": 12,
    "authenticity_score": 12
  },
  "workforce_segment": "semi_skilled",
  "feedback": {
    "classification": "training_needed",
    "feedback_text": "Good foundation! You have potential but would benefit from additional training...",
    "recommendations": [...],
    "next_steps": [...]
  }
}
```

### 2. Test Language Configuration

```bash
curl http://localhost:8000/languages
curl http://localhost:8000/languages/hi
curl http://localhost:8000/languages/kn
```

### 3. Test Dashboard Statistics

```bash
curl http://localhost:8000/dashboard/stats
curl http://localhost:8000/dashboard/classifications
curl http://localhost:8000/dashboard/workforce-segments
```

### 4. Test Dashboard Search

```bash
curl -X POST http://localhost:8000/dashboard/search \
  -H "Content-Type: application/json" \
  -d '{
    "classification": "job_ready",
    "district": "Bangalore",
    "limit": 20
  }'
```

### 5. Test Fraud Detection

Create multiple candidates with similar names and transcripts, then check fraud alerts:

```bash
curl http://localhost:8000/dashboard/fraud-alerts
```

---

## Frontend Testing Workflows

### Interview Submission Workflow

1. Open frontend: `http://localhost:5173`
2. Navigate to "Interview" page
3. Select language (Kannada, Hindi, or English)
4. Enter candidate name
5. Select district (optional)
6. Enter role (optional)
7. Either:
   - Record a video using the built-in recorder, or
   - Upload an existing video file
8. Click "Submit & Evaluate"
9. Wait for results (processing takes a few seconds)
10. View detailed results on Result page

### Dashboard Workflow

1. Click "Dashboard" in navigation
2. View statistics cards (Total Candidates, Avg Score, etc.)
3. Use filters to search:
   - By Classification
   - By District
   - By Language
   - By Workforce Segment
4. View candidate results in table
5. Click on any candidate for details

---

## Sample Test Transcripts

### Job-Ready Example (Expected: 78-85)
```
"I have 8 years of proven experience in welding and fabrication. 
I've worked on complex projects with precision and safety standards. 
I'm proficient in MIG, TIG, and stick welding. I've trained junior 
technicians and completed certifications. I work well under pressure 
and ensure quality output every time."
```

### Training Needed Example (Expected: 60-75)
```
"I have some experience in customer service. I worked in a retail store 
for about 3 years. I'm good at helping customers and handling complaints. 
I can use basic computer systems. I'm interested in learning more skills."
```

### Low Confidence Example (Expected: 20-40)
```
"um... I work... like in office. I do data, uh, entry? I think I'm okay 
at it. Maybe good, I dunno. I just, you know, type numbers and stuff."
```

---

## Monitoring & Debugging

### View Logs

**Backend logs** appear in terminal where you ran `uvicorn`

**Frontend logs** appear in browser console (F12)

### Check MongoDB

Connect to MongoDB and view data:

```bash
# Using MongoDB CLI
mongo
> use ai_interviews
> db.candidates.find().pretty()
> db.candidates.count()
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **CORS Error** | Check CORS_ORIGINS env var includes frontend URL |
| **MongoDB Connection Failed** | Ensure MongoDB is running (`mongod` or Docker) |
| **Whisper Model Not Found** | First run downloads model (~1.4GB) - patience! |
| **FFmpeg Not Found** | Install FFmpeg and add to PATH |
| **Video Won't Upload** | Check file size, format, and UPLOAD_DIR permissions |

---

## Performance Metrics

### Expected Processing Times

- **Video Upload:** 5-30 seconds (depends on file size)
- **Audio Extraction:** 2-5 seconds
- **Transcription:** 10-30 seconds (depends on video length)
- **Evaluation:** <1 second
- **Fraud Detection:** 1-2 seconds
- **Total Pipeline:** 20-70 seconds

### Database Queries

- **Get all candidates:** ~100ms (with 10k records)
- **Filter by classification:** ~50ms
- **Dashboard stats aggregation:** ~200ms

---

## Feature Checklist

- [x] Multilingual support (EN, HI, KN)
- [x] Advanced evaluation (5 dimensions)
- [x] Candidate classification (5 categories)
- [x] Workforce segment mapping
- [x] Fraud detection framework
- [x] Admin dashboard with filters
- [x] Analytics endpoints
- [x] Enhanced UI/UX
- [x] API documentation
- [x] Database schema
- [x] Environment configuration

---

## Next Steps for Production

1. **Security:**
   - Implement user authentication
   - Add role-based access control (RBAC)
   - Secure API keys and sensitive data
   - HTTPS/TLS for all endpoints

2. **Scaling:**
   - Database indexing on frequently queried fields
   - Caching layer (Redis) for stats
   - Async job queue for video processing
   - Containerize with Docker

3. **Reliability:**
   - Error handling and logging
   - Monitoring and alerting
   - Backup and disaster recovery
   - Health check endpoints

4. **Advanced ML:**
   - Integrate face recognition (face_recognition library)
   - Voice embedding models for speaker verification
   - NLP models for deeper analysis
   - Anomaly detection for fraud

5. **Compliance:**
   - Data privacy and GDPR compliance
   - Audit logging
   - Consent management
   - Data retention policies

---

**For detailed API documentation, visit:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

