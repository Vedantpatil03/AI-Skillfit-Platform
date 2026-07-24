# AI-Powered Multilingual Video Interview & Candidate Assessment System

## System Overview

A comprehensive AI-powered platform for conducting multilingual video interviews and evaluating candidates at scale. The system is designed to handle real-world conditions and diverse populations with advanced AI techniques for authenticity verification and candidate assessment.

### Key Capabilities

✅ **Multilingual Support**
- Kannada, Hindi, and English language support
- Language-specific interview instructions and sample questions
- Real-time language configuration on candidate selection

✅ **Advanced AI Evaluation**
- 5-dimensional assessment system
- Confidence scoring with authentication indicators
- Fraud detection and authenticity verification
- Automated candidate classification

✅ **Comprehensive Candidate Classification**
- **Job-Ready** (80-100): Meets all criteria for immediate employment
- **Requires Training** (60-79): Shows potential, needs upskilling
- **Requires Manual Verification** (40-59): Needs human review
- **Low-Confidence** (0-39): Poor quality or insufficient assessment
- **Suspected Fraud** (Any score): Flagged for suspicious patterns

✅ **Workforce Segment Mapping**
- Blue-Collar Trades: Manual trades, technical skills
- Polytechnic-Skilled: Diploma holders, technical graduates
- Semi-Skilled: Operational, support, and basic roles

✅ **Fraud Detection & Authenticity**
- Face presence detection and verification
- Liveness detection (anti-spoofing)
- Voice continuity analysis
- Duplicate and impersonation detection
- Voice similarity matching
- Response uniqueness analysis

✅ **Admin Dashboard**
- Advanced filtering by classification, district, language, workforce segment
- Real-time analytics and statistics
- Fraud alert management
- Manual escalation queue
- Detailed breakdowns by demographics

---

## Architecture Overview

### Backend Stack
- **FastAPI** - High-performance REST API
- **MongoDB** - Document database for candidate records
- **Whisper** - Audio transcription
- **Python** - Core implementation language

### Frontend Stack
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **JavaScript** - Client-side logic

### Data Processing Pipeline
```
Video Upload 
    ↓
FFmpeg Audio Extraction
    ↓
Whisper Transcription
    ↓
Advanced AI Evaluation
    ↓
Fraud Detection Analysis
    ↓
Candidate Classification
    ↓
Workforce Segment Mapping
    ↓
MongoDB Storage
    ↓
Dashboard & Analytics
```

---

## API Documentation

### Language Configuration Endpoints

#### GET `/languages`
Get list of supported languages
```json
{
  "code": "en",
  "name": "English",
  "greetings": ["Hello", "Hi there", "Welcome"]
}
```

#### GET `/languages/{lang_code}`
Get detailed configuration for a language
```json
{
  "code": "en",
  "name": "English",
  "greetings": ["Hello"],
  "instructions": "Please answer the following questions...",
  "sample_questions": [
    "Tell us about your work experience.",
    "What skills do you possess?"
  ]
}
```

### Candidate Evaluation Endpoints

#### POST `/candidates`
Basic candidate creation with evaluation
```json
{
  "name": "Ravi Kumar",
  "transcript": "I have 5 years of experience...",
  "language": "en",
  "district": "Bangalore",
  "role": "Data Entry"
}
```

Response includes:
- Evaluation scores (relevance, completeness, clarity, confidence, authenticity)
- Classification (job_ready, training_needed, etc.)
- Workforce segment mapping
- Feedback and recommendations

#### POST `/candidates/advanced`
Advanced evaluation with fraud detection
```json
{
  "name": "Ravi Kumar",
  "transcript": "I have 5 years of experience...",
  "language": "en",
  "district": "Bangalore",
  "video_path": "/path/to/video.mp4",
  "keywords": ["experience", "leadership", "teamwork"]
}
```

### Dashboard Endpoints

#### GET `/dashboard/stats`
Overall system statistics
```json
{
  "total_candidates": 1250,
  "average_score": 72.5,
  "classifications": {
    "job_ready": 450,
    "training_needed": 320,
    "manual_verification": 280,
    "low_confidence": 150,
    "fraud_suspected": 50
  },
  "workforce_segments": {
    "blue_collar": 400,
    "polytechnic": 550,
    "semi_skilled": 300
  },
  "languages": {
    "en": 600,
    "hi": 400,
    "kn": 250
  },
  "potential_fraud_cases": 50
}
```

#### POST `/dashboard/search`
Advanced candidate search with filters
```json
{
  "classification": "job_ready",
  "district": "Bangalore",
  "language": "en",
  "workforce_segment": "blue_collar",
  "min_score": 75,
  "max_score": 100,
  "limit": 50
}
```

#### GET `/dashboard/classifications`
List all classification categories
#### GET `/dashboard/workforce-segments`
List all workforce segments
#### GET `/dashboard/districts`
List supported districts
#### GET `/dashboard/fraud-alerts`
Get candidates flagged as potential fraud
#### GET `/dashboard/escalation-queue`
Get candidates requiring manual review

#### GET `/dashboard/analytics/by-classification`
Breakdown of candidates by classification
#### GET `/dashboard/analytics/by-language`
Breakdown of candidates by language
#### GET `/dashboard/analytics/by-workforce-segment`
Breakdown of candidates by workforce segment

---

## Evaluation Criteria

### 1. **Relevance (0-25 points)**
- How well the response addresses the question
- Keyword alignment with role/position requirements
- Contextual appropriateness
- **Score calculation:** Based on keyword hits vs. total words

### 2. **Completeness (0-20 points)**
- Response length and depth
- Number of sentences and ideas covered
- Structural coherence
- **Score calculation:** Word count and sentence structure analysis

### 3. **Clarity (0-20 points)**
- Communication quality and articulation
- Proper punctuation and sentence structure
- Logical flow and organization
- **Score calculation:** Sentence clarity ratio and punctuation patterns

### 4. **Confidence (0-15 points)**
- Absence of hesitation markers (um, uh, like, maybe)
- Use of strong, definitive language
- Conviction in statements
- **Score calculation:** Hesitation marker count vs. strength indicators

### 5. **Authenticity (0-20 points)**
- Face presence and consistency
- Liveness indicators (anti-spoofing)
- Voice continuity and naturalness
- **Score calculation:** Fraud detection indicators

**Total Score: 0-100 points**

---

## Fraud Detection System

### Indicators Monitored

1. **Face Detection & Verification**
   - Presence of face in video frame
   - Face consistency throughout video
   - Liveness indicators (eye movement, head rotation)

2. **Voice Analysis**
   - Voice continuity (no suspicious gaps)
   - Voice consistency across responses
   - Speech pattern naturalness

3. **Duplicate Detection**
   - Response text similarity to previous attempts
   - Name-based historical record matching
   - Threshold: >60% similarity triggers alert

4. **Behavior Patterns**
   - Multiple attempts within short time
   - Identical or near-identical responses
   - Response time anomalies

### Risk Scoring
- **0.0-0.3**: Low risk
- **0.3-0.7**: Moderate risk (escalate for review)
- **0.7-1.0**: High risk (flag as fraud suspected)

---

## Database Schema

### Candidates Collection
```json
{
  "_id": ObjectId,
  "name": "Ravi Kumar",
  "transcript": "I have 5 years...",
  "score": 82,
  "category": "excellent",
  "language": "en",
  "district": "Bangalore",
  "workforce_segment": "blue_collar",
  "evaluation": {
    "relevance_score": 22,
    "completeness_score": 18,
    "clarity_score": 19,
    "confidence_score": 14,
    "authenticity_score": 18
  },
  "fraud_indicators": {
    "face_detected": true,
    "face_match_score": 0.95,
    "voice_continuity": true,
    "liveness_score": 0.82,
    "response_uniqueness": 0.95,
    "fraud_risk_score": 0.05,
    "flags": []
  },
  "classification": "job_ready",
  "created_at": "2024-05-06T10:30:00Z"
}
```

---

## Frontend Pages

### Interview Page
- **Purpose:** Candidate interview recording and submission
- **Features:**
  - Multilingual language selection
  - District and role selection
  - Video recording or file upload
  - Language-specific instructions and sample questions
  - Real-time video/audio input

### Dashboard Page
- **Purpose:** Admin analytics and candidate management
- **Features:**
  - Key statistics (total candidates, avg score, fraud alerts)
  - Advanced filtering by classification, district, language, segment
  - Candidate table with detailed information
  - Export and reporting capabilities

### Result Page
- **Purpose:** Display detailed evaluation results
- **Features:**
  - Overall score and classification badge
  - Candidate information display
  - Detailed score breakdown (5 dimensions)
  - Feedback and recommendations
  - Fraud analysis results
  - Full transcript display

---

## Configuration & Deployment

### Environment Variables
```env
# Backend
OPENAI_API_KEY=your_key
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ai_interviews
UPLOAD_DIR=./uploads
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Frontend (if needed)
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Installation

**Backend:**
```bash
cd "AI for Bharat"
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd "AI for Bharat/frontend"
npm install
npm run dev
```

### Docker Deployment (Optional)
See Dockerfile (if available) for containerized deployment

---

## Key Improvements in v0.2.0

1. ✅ Multilingual support with Kannada, Hindi, English
2. ✅ Advanced 5-dimensional evaluation system
3. ✅ Comprehensive candidate classification
4. ✅ Workforce segment intelligent mapping
5. ✅ Fraud detection framework
6. ✅ Admin dashboard with advanced analytics
7. ✅ District-based geographic tracking
8. ✅ Escalation queue for manual reviews
9. ✅ Detailed analytics by multiple dimensions
10. ✅ Enhanced UI/UX for all pages

---

## Future Enhancements

- 🔄 Real-time video/voice authentication
- 🔄 ML-based face matching using embeddings
- 🔄 Advanced NLP for response evaluation
- 🔄 Multi-factor fraud detection
- 🔄 Compliance reporting (GDPR, data privacy)
- 🔄 Mobile app for candidates
- 🔄 SMS/Email notifications
- 🔄 Batch processing capabilities
- 🔄 Integration with HR systems
- 🔄 Custom evaluation templates

---

## Support & Documentation

For more information or issues, refer to:
- Backend API: `http://localhost:8000/docs` (Swagger)
- Frontend: `http://localhost:5173`
- Database: MongoDB on local/configured instance

---

**Version:** 0.2.0  
**Last Updated:** May 2024  
**Status:** Production Ready
