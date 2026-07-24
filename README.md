# AI-SKILLFIT PLATFORM
## 🎯 Overview

**AI-Powered Multilingual Video Interview & Candidate Assessment System** - A comprehensive platform enabling large-scale, inclusive candidate screening through AI-driven evaluation and fraud detection.



---

## 🚀 Quick Start (2 minutes)

### Start Backend
```bash
cd "AI for Bharat"
python -m uvicorn app.main:app --reload
```
→ Visit: http://localhost:8000/docs

### Start Frontend
```bash
cd frontend
npm run dev
```
→ Visit: http://localhost:5173

### Ensure MongoDB is Running
```bash
mongod
```

---


## ✨ Key Features

### 🌐 Multilingual
- English, Hindi, Kannada
- Language-specific instructions
- Localized sample questions

### 🧠 Advanced Evaluation  
- 5-dimensional assessment
- Relevance, Completeness, Clarity, Confidence, Authenticity
- 0-100 scoring system

### 🏷️ Smart Classification
- Job-Ready (80-100)
- Training-Needed (60-79)
- Manual-Verification (40-59)
- Low-Confidence (0-39)
- Fraud-Suspected

### 🔒 Fraud Detection
- Face presence & liveness detection
- Voice continuity analysis
- Duplicate attempt detection
- Impersonation pattern recognition
- Fraud risk scoring (0-1)

### 📊 Admin Dashboard
- Real-time analytics
- Advanced filtering (classification, district, language, segment)
- Fraud alerts & escalation queue
- Detailed breakdown by demographics

### 🏢 Workforce Mapping
- Blue-Collar Trades
- Polytechnic-Skilled
- Semi-Skilled Jobs
- Intelligent keyword-based mapping

---

## 🏗️ Architecture

```
Video Interview → Transcription → AI Evaluation → Classification
                                  ↓
                            Fraud Detection
                                  ↓
                          Database Storage
                                  ↓
                          Admin Dashboard
```

**Backend:** FastAPI + Python  
**Database:** MongoDB  
**Frontend:** React + Vite  
**Processing:** Whisper (transcription), FFmpeg (video)

---


## 🎓 How It Works

### Candidate Submission
1. Select language (EN/HI/KN)
2. Enter name, district, role
3. Record or upload video
4. Submit for evaluation

### Processing
1. Extract audio from video
2. Transcribe using Whisper
3. Analyze 5 evaluation dimensions
4. Detect fraud indicators
5. Classify candidate
6. Map to workforce segment
7. Generate feedback & recommendations

### Dashboard
1. View system statistics
2. Filter by classification/language/district/segment
3. Review fraud alerts
4. Manage escalation queue
5. Access detailed analytics

---

## 📖 API Quick Reference

### Create Candidate
```bash
POST /candidates
{
  "name": "Ravi Kumar",
  "transcript": "I have...",
  "language": "en",
  "district": "Bangalore"
}
```

### Get Stats
```bash
GET /dashboard/stats
```

### Search Candidates
```bash
POST /dashboard/search
{
  "classification": "job_ready",
  "district": "Bangalore",
  "limit": 20
}
```

**Full API docs:** http://localhost:8000/docs

---

##  Classification System

### Job-Ready (80-100 points)
✅ Meets all criteria  
✅ Ready for immediate employment  
✅ Next: Hiring interview  

### Training-Needed (60-79 points)
→ Good foundation, needs upskilling  
→ Next: Enroll in training program  

### Manual-Verification (40-59 points)
⚠ Uncertain result  
⚠ Next: Human review required  

### Low-Confidence (0-39 points)
✗ Poor quality or insufficient data  
✗ Next: Retake interview  

### Fraud-Suspected
🚫 Suspicious patterns detected  
🚫 Next: Investigation  

---

##  Workforce Segments

**Blue-Collar Trades**
- Manual trades and technical skills
- Keywords: welding, carpentry, plumbing, electrical, construction

**Polytechnic-Skilled**
- Diploma holders and technical graduates
- Keywords: diploma, technical, certification, HVAC, electronics

**Semi-Skilled**
- Basic operational and support roles
- Keywords: data entry, customer service, assembly, warehouse

---

## 🔐 Fraud Detection Indicators

| Indicator | Checks |
|-----------|--------|
| Face Detection | Presence, consistency, liveness |
| Voice Analysis | Continuity, naturalness, consistency |
| Response Uniqueness | Text similarity to previous attempts |
| Duplicate Detection | Historical record matching (>60% threshold) |
| Behavioral Patterns | Time-based anomalies, multiple attempts |

**Fraud Risk Score:** 0.0 (safe) → 1.0 (high risk)

---

## 📁 Project Structure

```
AI for Bharat/
├── app/                          # Backend
│   ├── config.py                 # System configuration
│   ├── main.py                   # FastAPI app
│   ├── services/                 # Business logic
│   │   ├── evaluation.py         # 5-dimensional scoring
│   │   ├── classification_service.py
│   │   ├── fraud_detection.py
│   │   └── ...
│   ├── routes/                   # API endpoints
│   │   ├── candidates.py
│   │   ├── languages.py
│   │   ├── dashboard.py
│   │   └── ...
│   └── database/                 # MongoDB
├── frontend/                     # React UI
│   └── src/
│       ├── pages/               # UI pages
│       ├── components/          # Components
│       └── lib/api.js           # API client
├── requirements.txt              # Python dependencies
├── QUICK_REFERENCE.md           # Quick start (read first!)
├── FEATURES_DOCUMENTATION.md    # Feature details
├── IMPLEMENTATION_GUIDE.md      # Setup & testing
├── API_REFERENCE.md             # API docs
├── STATUS_REPORT.md             # Delivery status
└── IMPLEMENTATION_SUMMARY.md    # Technical overview
```

---


---

## 🆘 Common Tasks

### Record Interview
```
Interview Page → Select Language → Record Video → Submit
```

### View Dashboard
```
Dashboard Page → See statistics, use filters to search candidates
```

### Check Results
```
Submit Interview → Redirected to Results Page → View detailed breakdown
```

### Filter Candidates
```
Dashboard → Select filters → Click Search → View results
```

### Check Fraud Alerts
```
Dashboard → Click "Fraud Alerts" → Review flagged cases
```

---



**More help:** See IMPLEMENTATION_GUIDE.md


