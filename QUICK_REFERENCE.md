# Quick Reference Card

## 🚀 Start the System (5 minutes)

### Terminal 1 - Backend
```bash
cd "AI for Bharat"
python -m uvicorn app.main:app --reload
```
Visit: http://localhost:8000/docs

### Terminal 2 - Frontend
```bash
cd "AI for Bharat/frontend"
npm run dev
```
Visit: http://localhost:5173

### Terminal 3 - MongoDB (if needed)
```bash
mongod
```

---

## 🔗 Key URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| MongoDB | localhost:27017 |

---

## 📋 Essential Endpoints

### Create Candidate
```bash
POST /candidates
{
  "name": "Ravi Kumar",
  "transcript": "I have 5 years of experience...",
  "language": "en",
  "district": "Bangalore"
}
```

### Get Dashboard Stats
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

### Get Languages
```bash
GET /languages
```

---

## 🎨 Frontend Pages

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/` | Analytics & candidate management |
| Interview | `/interview` | Record/upload candidate interview |
| Results | `/result` | View evaluation results |

---

## 💡 Key Features

### Languages
- **English** (en) - Full support
- **Hindi** (hi) - Full support  
- **Kannada** (kn) - Full support

### Classifications
- **Job-Ready** (80-100): Hire immediately
- **Training-Needed** (60-79): Good fit with training
- **Manual-Verification** (40-59): Needs review
- **Low-Confidence** (0-39): Retake interview
- **Fraud-Suspected**: Investigation needed

### Workforce Segments
- **Blue-Collar**: Trades & technical skills
- **Polytechnic**: Diploma & technical graduates
- **Semi-Skilled**: Operational & support roles

---

## 📊 Score Breakdown

Candidates receive scores in 5 areas:
1. **Relevance** (0-25): Answers question directly
2. **Completeness** (0-20): Detailed response
3. **Clarity** (0-20): Clear communication
4. **Confidence** (0-15): No hesitation
5. **Authenticity** (0-20): Genuine response

**Total: 0-100 points**

---

## 🔐 Fraud Indicators

System checks for:
- ✓ Face presence & liveness
- ✓ Voice continuity
- ✓ Duplicate attempts
- ✓ Impersonation patterns
- ✓ Response similarity

---

## 📁 File Structure

```
AI for Bharat/
├── app/                          # Backend
│   ├── config.py                 # Settings
│   ├── main.py                   # App setup
│   ├── services/                 # Business logic
│   ├── routes/                   # API endpoints
│   └── database/                 # DB connection
├── frontend/                     # React UI
│   └── src/pages/               # UI pages
├── requirements.txt              # Python deps
└── DOCUMENTATION.md              # This file
```

---

## 🧪 Testing Quick Commands

```bash
# Get stats
curl http://localhost:8000/dashboard/stats

# Get languages
curl http://localhost:8000/languages

# Create candidate
curl -X POST http://localhost:8000/candidates \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","transcript":"Sample...","language":"en"}'

# Get fraud alerts
curl http://localhost:8000/dashboard/fraud-alerts
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| **API won't start** | Check port 8000 not in use |
| **No MongoDB connection** | Start MongoDB (`mongod`) |
| **Frontend won't start** | Run `npm install` first |
| **CORS error** | Add frontend URL to CORS_ORIGINS env |
| **Video won't upload** | Check file size & format |
| **Whisper slow** | First run downloads model (~1.4GB) |

---

## 📈 Common Tasks

### View All Candidates
```
Dashboard → See table of candidates
```

### Filter Job-Ready Candidates
```
Dashboard → Select "Classification: Job-Ready" → Click Search
```

### Submit New Interview
```
Interview → Select language → Record/upload → Submit
```

### Check Fraud Cases
```
Dashboard → GET /dashboard/fraud-alerts
```

### Export Data
```
All data stored in MongoDB, exportable via MongoDB tools
```

---

## 🎯 Next Steps

1. **Start the system** (use commands above)
2. **Record a test interview** (Interview page)
3. **View results** (Results page)
4. **Check dashboard** (Dashboard page with analytics)
5. **Review API docs** (http://localhost:8000/docs)

---

## 📚 Documentation

- **Features** → FEATURES_DOCUMENTATION.md
- **Setup** → IMPLEMENTATION_GUIDE.md
- **API** → API_REFERENCE.md
- **Summary** → IMPLEMENTATION_SUMMARY.md

---

## ⚙️ Configuration

### Add New Language
1. Edit `app/config.py`
2. Add to `LANGUAGES` dict with code, name, greetings, instructions, questions
3. Restart backend

### Add New Classification
1. Edit `app/config.py`
2. Add to `CLASSIFICATION_CATEGORIES`
3. Update `classify_candidate()` in `classification_service.py`

### Add New District
1. Edit `app/config.py`
2. Add to `INDIAN_DISTRICTS` list
3. Restart backend

---

## 📞 Support

- **API Docs:** http://localhost:8000/docs
- **Error Logs:** Check terminal output
- **Database:** MongoDB console or tools
- **Frontend Console:** Browser F12

---

## 🔑 Key System Metrics

- **Evaluation Dimensions:** 5
- **Score Range:** 0-100
- **Classification Categories:** 5
- **Workforce Segments:** 3
- **Languages:** 3 (EN, HI, KN)
- **Fraud Indicators:** 5+
- **Dashboard Filters:** 5
- **API Endpoints:** 20+

---

## ✅ Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] Can record video in Interview page
- [ ] Can submit and get results
- [ ] Dashboard loads and shows stats
- [ ] Can filter candidates by classification
- [ ] Can view fraud alerts

---

**Status:** ✅ Ready to Use  
**Version:** 0.2.0  
**Last Updated:** May 2024
