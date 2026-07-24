"""
Configuration for languages, job categories, and classifications.
"""

from typing import TypedDict


class LanguageConfig(TypedDict):
    code: str
    name: str
    greetings: list[str]
    instructions: str
    sample_questions: list[str]


# Supported languages and their configurations
LANGUAGES: dict[str, LanguageConfig] = {
    "en": {
        "code": "en",
        "name": "English",
        "greetings": ["Hello", "Hi there", "Welcome"],
        "instructions": "Please answer the following questions. Take your time to provide detailed responses.",
        "sample_questions": [
            "Tell us about your work experience.",
            "What skills do you possess?",
            "Describe a challenging situation you overcame.",
            "Why are you interested in this position?",
            "What are your career goals?",
            "How do you handle working under pressure?",
            "Can you describe a time you worked as part of a team?",
            "What makes you a good fit for this role?",
            "How do you learn new skills quickly?",
            "What kind of work environment helps you perform best?",
        ],
    },
    "hi": {
        "code": "hi",
        "name": "हिंदी (Hindi)",
        "greetings": ["नमस्ते", "आपका स्वागत है"],
        "instructions": "कृपया निम्नलिखित प्रश्नों का उत्तर दें। विस्तृत उत्तर देने के लिए अपना समय लें।",
        "sample_questions": [
            "अपने कार्य अनुभव के बारे में बताएं।",
            "आपके पास कौन कौन से कौशल हैं?",
            "एक चुनौतीपूर्ण स्थिति के बारे में बताएं जिसे आपने पार किया।",
            "आप इस पद के लिए क्यों रुचि रखते हैं?",
            "आपके कैरियर लक्ष्य क्या हैं?",
            "आप दबाव में काम को कैसे संभालते हैं?",
            "किसी टीम के साथ काम करने का अनुभव बताएं।",
            "आप इस भूमिका के लिए उपयुक्त क्यों हैं?",
            "आप नए कौशल जल्दी कैसे सीखते हैं?",
            "कौन सा कार्य वातावरण आपको सबसे अच्छा प्रदर्शन करने में मदद करता है?",
        ],
    },
    "kn": {
        "code": "kn",
        "name": "ಕನ್ನಡ (Kannada)",
        "greetings": ["ನಮಸ್ಕಾರ", "ಸ್ವಾಗತ"],
        "instructions": "ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ ನೀಡಿ. ವಿವರವಾದ ಉತ್ತರ ನೀಡಲು ನಿಮ್ಮ ಸಮಯವನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.",
        "sample_questions": [
            "ನಿಮ್ಮ ಕೆಲಸದ ಅನುಭವದ ಬಗ್ಗೆ ಹೇಳಿ.",
            "ನೀವು ಎಂದು ಕೌಶಲ್ಯಗಳನ್ನು ಹೊಂದಿದ್ದೀರಿ?",
            "ನೀವು ಎದುರಿಸಿದ ಸವಾಲಿನ ಪರಿಸ್ಥಿತಿಯನ್ನು ವಿವರಿಸಿ.",
            "ಈ ಹುದ್ದೆಗಾಗಿ ನೀವು ಏಕೆ ಆಸಕ್ತರಿದ್ದೀರಿ?",
            "ನಿಮ್ಮ ವೃತ್ತಿ ಗುರಿಗಳು ಯಾವುವು?",
            "ಒತ್ತಡದ ಸಂದರ್ಭದಲ್ಲಿ ನೀವು ಕೆಲಸವನ್ನು ಹೇಗೆ ನಿರ್ವಹಿಸುತ್ತೀರಿ?",
            "ತಂಡದೊಂದಿಗೆ ಕೆಲಸ ಮಾಡಿದ ನಿಮ್ಮ ಅನುಭವವನ್ನು ವಿವರಿಸಿ.",
            "ಈ ಪಾತ್ರಕ್ಕೆ ನೀವು ಯೋಗ್ಯರಾಗಿರುವುದಕ್ಕೆ ಕಾರಣವೇನು?",
            "ನೀವು ಹೊಸ ಕೌಶಲ್ಯಗಳನ್ನು ಬೇಗನೆ ಹೇಗೆ ಕಲಿಯುತ್ತೀರಿ?",
            "ಯಾವ ರೀತಿಯ ಕೆಲಸದ ವಾತಾವರಣದಲ್ಲಿ ನೀವು ಉತ್ತಮವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತೀರಿ?",
        ],
    },
    "mr": {
        "code": "mr",
        "name": "मराठी (Marathi)",
        "greetings": ["नमस्कार", "आपले स्वागत आहे"],
        "instructions": "कृपया खाली दिलेल्या प्रश्नांची उत्तरे दिल्या. विस्तृत उत्तरे देण्यासाठी आपले वेळ घ्या.",
        "sample_questions": [
            "आपल्या कामाच्या अनुभवाबद्दल सांगा.",
            "आपल्याकडे कोणकोणती कौशल्ये आहेत?",
            "आपण सामोरे गेलेल्या एक आव्हानात्मक परिस्थितीचे वर्णन करा.",
            "आप या पदासाठी का आग्रही आहात?",
            "आपले व्यावसायिक लक्ष्य काय आहेत?",
            "आप दबावाखाली काम कसे हाताळता?",
            "संघासोबत काम करण्याचा आपला अनुभव वर्णन करा.",
            "आप या भूमिकेसाठी योग्य का आहात?",
            "आप नवीन कौशल्य लवकर कसे शिखता?",
            "कोणते कार्य वातावरण आपल्याला सर्वोत्तम कर्मक्षमता देते?",
        ],
    },
}


# Workforce segments
WORKFORCE_SEGMENTS = {
    "blue_collar": {
        "id": "blue_collar",
        "name": "Blue-Collar Trades",
        "description": "Manual trades and technical skills (welding, carpentry, plumbing, etc.)",
        "keywords": ["trade", "welding", "carpentry", "plumbing", "electrical", "construction", "mechanics"],
    },
    "polytechnic": {
        "id": "polytechnic",
        "name": "Polytechnic-Skilled",
        "description": "Diploma holders and technical education graduates",
        "keywords": ["diploma", "polytechnic", "technical", "certification", "hvac", "electronics", "automotive"],
    },
    "semi_skilled": {
        "id": "semi_skilled",
        "name": "Semi-Skilled",
        "description": "Basic operational and support roles",
        "keywords": ["data entry", "customer service", "assembly", "warehouse", "retail", "hospitality", "agriculture"],
    },
}


# Candidate classification categories
CLASSIFICATION_CATEGORIES = {
    "job_ready": {
        "id": "job_ready",
        "name": "Job-Ready",
        "description": "Candidate meets all criteria and is ready for immediate employment",
        "score_range": (80, 100),
        "color": "green",
    },
    "training_needed": {
        "id": "training_needed",
        "name": "Requires Training/Upskilling",
        "description": "Candidate shows potential but needs additional training",
        "score_range": (60, 79),
        "color": "yellow",
    },
    "manual_verification": {
        "id": "manual_verification",
        "name": "Requires Manual Verification",
        "description": "Candidate needs human review for final decision",
        "score_range": (40, 59),
        "color": "orange",
    },
    "low_confidence": {
        "id": "low_confidence",
        "name": "Low-Confidence/Poor-Quality",
        "description": "Interview quality or confidence is too low for assessment",
        "score_range": (0, 39),
        "color": "red",
    },
    "fraud_suspected": {
        "id": "fraud_suspected",
        "name": "Suspected Duplicate/Fraud",
        "description": "Potential fraud, impersonation, or duplicate attempt detected",
        "score_range": (0, 100),  # Special case
        "color": "darkred",
    },
}


# Evaluation criteria weights
EVALUATION_WEIGHTS = {
    "relevance": 0.25,  # How relevant is the answer to the question
    "completeness": 0.20,  # How complete is the answer
    "clarity": 0.20,  # How clear is the communication
    "confidence": 0.15,  # Confidence level in the answer
    "authenticity": 0.20,  # Face presence, liveness, voice continuity
}


# Districts in India (sample for location tracking)
INDIAN_DISTRICTS = [
    "Bangalore", "Mysore", "Belgaum", "Mangalore", "Udupi",
    "Tumkur", "Chikmagalur", "Kodagu", "Hassan", "Kolar",
    "Dharwad", "Hubli", "Bijapur", "Raichur", "Vikarabad",
    "Gulbarga", "Bagalkot", "Gadag", "Chitradurga", "Davanagere",
]
