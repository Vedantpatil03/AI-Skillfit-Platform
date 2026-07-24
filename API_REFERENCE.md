# API Reference & Quick Start

## Base URL
- **Local Development:** `http://localhost:8000`
- **Production:** Configure with your deployment URL

---

## Endpoints Summary

### 1. Languages & Configuration

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/languages` | Get all supported languages |
| GET | `/languages/{code}` | Get language config (en, hi, kn) |

### 2. Candidate Management

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/candidates` | Create candidate with basic evaluation |
| POST | `/candidates/advanced` | Create with advanced fraud detection |
| GET | `/candidates` | List all candidates |
| GET | `/candidates/by-name/{name}` | Get latest candidate by name |

### 3. Dashboard & Analytics

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/dashboard/stats` | Get system statistics |
| GET | `/dashboard/classifications` | List classification categories |
| GET | `/dashboard/workforce-segments` | List workforce segments |
| GET | `/dashboard/districts` | List supported districts |
| POST | `/dashboard/search` | Search with advanced filters |
| GET | `/dashboard/fraud-alerts` | Get fraud flagged candidates |
| GET | `/dashboard/escalation-queue` | Get manual review queue |
| GET | `/dashboard/analytics/by-classification` | Stats by classification |
| GET | `/dashboard/analytics/by-language` | Stats by language |
| GET | `/dashboard/analytics/by-workforce-segment` | Stats by segment |

### 4. Interview Processing

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/interviews` | Create interview record |
| GET | `/interviews` | List interviews |
| POST | `/process-interview` | Upload and process video |
| POST | `/transcribe` | Transcribe audio file |

### 5. System Health

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Root status |
| GET | `/health` | System health check |

---

## Request/Response Examples

### Example 1: Create Candidate (Basic)

**Request:**
```bash
POST /candidates HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "name": "Priya Sharma",
  "transcript": "I have worked in manufacturing for 6 years, specialized in assembly and quality control. I am very disciplined and take pride in my work.",
  "language": "hi",
  "district": "Bangalore",
  "role": "Assembly Operator"
}
```

**Response (200 OK):**
```json
{
  "name": "Priya Sharma",
  "transcript": "I have worked in manufacturing...",
  "score": 78,
  "category": "good",
  "language": "hi",
  "district": "Bangalore",
  "workforce_segment": "polytechnic",
  "evaluation": {
    "relevance_score": 22,
    "completeness_score": 17,
    "clarity_score": 18,
    "confidence_score": 13,
    "authenticity_score": 12
  },
  "classification": "job_ready",
  "requires_escalation": false,
  "feedback": {
    "classification": "job_ready",
    "score": 78,
    "feedback_text": "Excellent performance! You demonstrate strong qualifications...",
    "recommendations": [],
    "next_steps": ["Interview with hiring manager", "Background check", "Offer stage"]
  }
}
```

### Example 2: Search Candidates (Dashboard)

**Request:**
```bash
POST /dashboard/search HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "classification": "job_ready",
  "language": "en",
  "min_score": 75,
  "limit": 10
}
```

**Response (200 OK):**
```json
{
  "count": 3,
  "filters": {
    "classification": "job_ready",
    "district": null,
    "language": "en",
    "workforce_segment": null,
    "score_range": {
      "min": 75,
      "max": null
    }
  },
  "candidates": [
    {
      "name": "John Doe",
      "score": 82,
      "category": "excellent",
      "classification": "job_ready",
      "language": "en",
      "workforce_segment": "blue_collar",
      "created_at": "2024-05-06T10:30:00Z"
    }
  ]
}
```

### Example 3: Get Dashboard Stats

**Request:**
```bash
GET /dashboard/stats HTTP/1.1
Host: localhost:8000
```

**Response (200 OK):**
```json
{
  "timestamp": "2024-05-06T14:30:00Z",
  "data": {
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
}
```

### Example 4: Get Language Config

**Request:**
```bash
GET /languages/kn HTTP/1.1
Host: localhost:8000
```

**Response (200 OK):**
```json
{
  "code": "kn",
  "name": "ಕನ್ನಡ (Kannada)",
  "greetings": ["ನಮಸ್ಕಾರ", "ಸ್ವಾಗತ"],
  "instructions": "ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ ನೀಡಿ...",
  "sample_questions": [
    "ನಿಮ್ಮ ಕೆಲಸದ ಅನುಭವದ ಬಗ್ಗೆ ಹೇಳಿ.",
    "ನೀವು ಎಂದು ಕೌಶಲ್ಯಗಳನ್ನು ಹೊಂದಿದ್ದೀರಿ?"
  ]
}
```

---

## Classification Categories

| ID | Name | Score Range | Description |
|----|------|------------|-------------|
| job_ready | Job-Ready | 80-100 | Ready for immediate employment |
| training_needed | Requires Training | 60-79 | Needs upskilling |
| manual_verification | Manual Review | 40-59 | Human decision required |
| low_confidence | Low-Confidence | 0-39 | Poor quality or insufficient |
| fraud_suspected | Fraud Alert | Any | Suspicious patterns detected |

---

## Workforce Segments

| ID | Name | Keywords |
|----|------|----------|
| blue_collar | Blue-Collar Trades | welding, carpentry, plumbing, electrical, construction |
| polytechnic | Polytechnic-Skilled | diploma, technical, certification, hvac, electronics |
| semi_skilled | Semi-Skilled | data entry, customer service, assembly, warehouse |

---

## Error Handling

### Standard Error Response

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limits & Quotas

- **Candidates per minute:** No limit (rate limiting can be added)
- **Search queries:** No limit
- **Video size:** Up to 500MB recommended
- **Transcription length:** No technical limit (time-dependent)

---

## Authentication (Future Implementation)

When authentication is added:

```bash
# Include Bearer token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/dashboard/stats
```

---

## SDK/Client Libraries

### JavaScript/TypeScript Example

```javascript
// Using fetch API (already in frontend)
const response = await fetch('http://localhost:8000/candidates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Ravi Kumar',
    transcript: 'I have experience...',
    language: 'en',
    district: 'Bangalore'
  })
});

const data = await response.json();
console.log(data.score, data.classification);
```

### Python Example

```python
import requests

response = requests.post('http://localhost:8000/candidates', json={
    'name': 'Ravi Kumar',
    'transcript': 'I have experience...',
    'language': 'en',
    'district': 'Bangalore'
})

data = response.json()
print(f"Score: {data['score']}, Classification: {data['classification']}")
```

### cURL Examples

```bash
# Get statistics
curl http://localhost:8000/dashboard/stats

# Create candidate
curl -X POST http://localhost:8000/candidates \
  -H "Content-Type: application/json" \
  -d '{"name":"John","transcript":"...","language":"en"}'

# Search candidates
curl -X POST http://localhost:8000/dashboard/search \
  -H "Content-Type: application/json" \
  -d '{"classification":"job_ready","limit":20}'
```

---

## Webhooks (Future Implementation)

Planned webhook events:
- `candidate.created` - New candidate submission
- `candidate.classified` - Classification complete
- `fraud.detected` - Fraud alert triggered
- `interview.processed` - Interview processing complete

---

## Changelog

### v0.2.0 (Current)
- ✅ Multilingual support (EN, HI, KN)
- ✅ Advanced evaluation system
- ✅ Candidate classification
- ✅ Workforce segment mapping
- ✅ Fraud detection framework
- ✅ Admin dashboard
- ✅ Analytics endpoints

### v0.1.0
- Basic video upload and transcription
- Simple rule-based evaluation
- MongoDB storage
- REST API

---

## Support

For issues or questions:
1. Check logs in terminal/browser console
2. Review API documentation: `http://localhost:8000/docs`
3. Consult IMPLEMENTATION_GUIDE.md
4. Check FEATURES_DOCUMENTATION.md

---

**API Version:** 0.2.0  
**Last Updated:** May 2024  
**Status:** Stable
