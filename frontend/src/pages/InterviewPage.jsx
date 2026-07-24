import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VideoRecorder from "../components/VideoRecorder.jsx";
import { api } from "../lib/api.js";

const ROLE_QUESTION_SETS = {
  data_entry: [
    "How accurate and fast are you with data entry tasks?",
    "What tools or software have you used for data entry?",
    "How do you ensure accuracy when entering large amounts of data?",
    "Have you worked with spreadsheets or databases before?",
    "How do you handle repetitive tasks while maintaining focus?",
    "Describe a time when you caught an error in your work.",
    "How comfortable are you with typing and computer use?",
    "What steps do you take to keep information organized?",
    "How do you manage deadlines when handling multiple records?",
    "Why do you think you are suitable for a data entry role?",
  ],
  technical: [
    "What technical skills are strongest in your experience?",
    "Describe a project where you used hands-on technical skills.",
    "How do you troubleshoot problems when equipment does not work?",
    "What safety practices do you follow in technical work?",
    "Have you worked with tools, machines, or equipment before?",
    "How do you learn a new technical process quickly?",
    "Tell us about a time you solved a practical technical issue.",
    "How do you keep your work quality high in technical tasks?",
    "What technical training or certification have you completed?",
    "Why are you a good fit for a technical position?",
  ],
  assembly: [
    "Have you worked in an assembly or production environment before?",
    "How do you maintain speed without reducing quality?",
    "What steps do you take to follow instructions carefully?",
    "How do you handle repetitive assembly tasks over long shifts?",
    "Describe your experience working with a team on a production line.",
    "How do you ensure safety while working with tools or parts?",
    "What do you do if you notice a defect in a product?",
    "How do you stay focused during routine work?",
    "What makes you reliable for a shift-based assembly job?",
    "Why do you want to work in an assembly role?",
  ],
  customer_service: [
    "How do you handle difficult customers politely?",
    "What does good customer service mean to you?",
    "Describe a time you resolved a customer issue.",
    "How do you stay calm during pressure or complaints?",
    "What communication skills help you in customer service?",
    "Have you used phones, email, or chat tools to support customers?",
    "How do you make sure customers feel understood?",
    "What would you do if you did not know the answer right away?",
    "How do you balance speed and quality when helping customers?",
    "Why are you interested in a customer service job?",
  ],
  general: [
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
};

const ROLE_OPTIONS = [
  { label: "Select a role (Optional)", value: "" },
  { label: "General", value: "general" },
  { label: "Data Entry", value: "data_entry" },
  { label: "Technical", value: "technical" },
  { label: "Assembly", value: "assembly" },
  { label: "Customer Service", value: "customer_service" },
  { label: "Other", value: "other" },
];

const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS.map((option) => [option.value, option.label]));

function getRoleQuestionSet(roleText) {
  const text = (roleText || "").toLowerCase();
  if (!text.trim()) {
    return ROLE_QUESTION_SETS.general;
  }

  if (/(data\s*entry|clerk|typing|computer|back office|admin|operator)/.test(text)) {
    return ROLE_QUESTION_SETS.data_entry;
  }

  if (/(assembly|production|factory|line worker|machine|operator|manufacturing)/.test(text)) {
    return ROLE_QUESTION_SETS.assembly;
  }

  if (/(service|support|call center|customer|relation|sales|help desk)/.test(text)) {
    return ROLE_QUESTION_SETS.customer_service;
  }

  if (/(technical|technician|electric|mechanic|welding|plumbing|carpentry|hvac|maintenance)/.test(text)) {
    return ROLE_QUESTION_SETS.technical;
  }

  return ROLE_QUESTION_SETS.general;
}

export default function InterviewPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("en");
  const [roleChoice, setRoleChoice] = useState("");
  const [role, setRole] = useState("");
  const [languages, setLanguages] = useState([]);
  const [languageConfig, setLanguageConfig] = useState(null);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [languageQuestions, setLanguageQuestions] = useState([]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await api.get("/languages");
        setLanguages(res.data);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };

    fetchLanguages();
  }, []);

  useEffect(() => {
    const fetchLanguageConfig = async () => {
      try {
        const res = await api.get(`/languages/${language}`);
        setLanguageConfig(res.data);
        // Use sample_questions from language config if available
        if (res.data.sample_questions && res.data.sample_questions.length > 0) {
          setLanguageQuestions(res.data.sample_questions);
        }
      } catch (error) {
        console.error("Error fetching language config:", error);
        setLanguageQuestions([]);
      }
    };

    if (language) {
      fetchLanguageConfig();
    }
  }, [language]);

  const fileLabel = useMemo(() => {
    if (!file) return "";
    return `${file.name} (${Math.round(file.size / 1024)} KB)`;
  }, [file]);

  const resolvedRole = roleChoice === "other" ? role.trim() : roleChoice;
  const roleQuestions = useMemo(() => {
    // Role-specific questions should take priority when a role is selected.
    if (resolvedRole && resolvedRole !== "general") {
      return getRoleQuestionSet(resolvedRole);
    }

    // If no specific role is selected, use language sample questions.
    if (languageQuestions.length > 0) {
      return languageQuestions;
    }

    return ROLE_QUESTION_SETS.general;
  }, [resolvedRole, languageQuestions]);
  const activeQuestion = roleQuestions[currentQuestionIndex] || "";
  const interviewProgress = roleQuestions.length > 0 ? ((currentQuestionIndex + 1) / roleQuestions.length) * 100 : 0;
  const roleSummary = resolvedRole
    ? ROLE_LABELS[resolvedRole] && resolvedRole !== role.trim()
      ? ROLE_LABELS[resolvedRole]
      : resolvedRole
    : "Showing general interview questions";

  useEffect(() => {
    setQuestionsGenerated(false);
    setCurrentQuestionIndex(0);
  }, [resolvedRole, language]);

  const canSubmit = !!name.trim() && (!!recordedVideo || !!file) && !loading;

  function handleGenerateQuestions() {
    setQuestionsGenerated(true);
    setCurrentQuestionIndex(0);
  }

  function handleNextQuestion() {
    setCurrentQuestionIndex((currentIndex) => Math.min(currentIndex + 1, roleQuestions.length - 1));
  }

  function handleSpeakQuestion() {
    if (!activeQuestion || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeQuestion);
    utterance.lang = language === "hi" ? "hi-IN" : language === "kn" ? "kn-IN" : language === "mr" ? "mr-IN" : "en-IN";
    window.speechSynthesis.speak(utterance);
  }

  async function onProcess() {
    setError("");
    if (!name.trim()) {
      setError("Please enter candidate name.");
      return;
    }

    const form = new FormData();
    form.append("name", name.trim());
    form.append("language", language);
    if (resolvedRole) form.append("role", resolvedRole);

    if (recordedVideo) {
      const ext = recordedVideo.type?.includes("mp4") ? "mp4" : "webm";
      const uploadFile = new File([recordedVideo], `recording.${ext}`, {
        type: recordedVideo.type || "video/webm"
      });
      form.append("file", uploadFile);
    } else if (file) {
      form.append("file", file);
    } else {
      setError("Please record a video or select a file.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/process-interview", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      try {
        sessionStorage.setItem('last_result', JSON.stringify(res.data));
        sessionStorage.setItem('dashboard_refresh_token', String(Date.now()));
      } catch (e) {
        // best-effort persistence; ignore storage errors
      }
      navigate("/result", { state: res.data });
    } catch (e) {
      const message =
        e?.response?.data?.detail ||
        e?.message ||
        "Failed to process interview. Please try again.";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="animate-slide-down">
        <h1 className="text-2xl font-bold text-slate-100">AI Workforce Interview</h1>
        <p className="mt-1 text-sm text-slate-400">
          Record multilingual interview responses for AI-based evaluation, authenticity verification, and workforce classification.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300">
        {error ? (
          <div className="mb-4 animate-shake rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="animate-slide-down rounded-xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-white/20">
          <div className="text-xl font-semibold text-slate-100">AI Interview Assistant</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Please answer clearly and naturally. Your responses will be evaluated for communication
            clarity, confidence, technical understanding, and role suitability.
          </p>
        </div>

        {roleQuestions?.length > 0 && (
          <div className="animate-slide-down mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-white/10 transition-all duration-300">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">AI-Generated Questions</div>
                <p className="mt-2 text-sm text-slate-300">
                  Questions adapt to selected role and language preferences
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm">
                {resolvedRole ? `Role: ${roleSummary}` : "General interview"}
              </div>
            </div>

            {!questionsGenerated ? (
              <div className="animate-fade-in mt-6 flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300">
                <p className="text-sm text-slate-200">
                  Tap generate to reveal one question at a time and begin the live interview flow.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateQuestions}
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-600 to-green-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:scale-105 active:scale-95"
                >
                  Generate Questions
                </button>
              </div>
            ) : (
              <div className="animate-fade-in mt-6 space-y-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
                  <span className="font-medium">
                    Question {currentQuestionIndex + 1} of {roleQuestions.length}
                  </span>
                  <span className="font-semibold text-emerald-300">{Math.round(interviewProgress)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-orange-400 shadow-lg shadow-emerald-500/50 transition-all duration-500"
                    style={{ width: `${interviewProgress}%` }}
                  />
                </div>

                <div className="animate-scale-in rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 backdrop-blur-sm transition-all duration-300">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                    Current Question
                  </div>
                  <div className="text-xl leading-relaxed text-slate-50 md:text-2xl">
                    {activeQuestion}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSpeakQuestion}
                    className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-300 hover:bg-white/15 hover:scale-105 active:scale-95 backdrop-blur-sm"
                  >
                    Speak Question
                  </button>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex >= roleQuestions.length - 1}
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:scale-100"
                  >
                    Next Question
                  </button>
                  <div className="text-xs text-slate-400">
                    {resolvedRole ? `Matched to role: ${roleSummary}` : "Showing general interview questions"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="animate-slide-down space-y-2 transition-all duration-300" style={{animationDelay: '0.1s'}}>
            <label className="text-sm font-medium text-slate-300">Candidate Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ravi Kumar"
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none ring-0 transition-all duration-300 focus:border-emerald-400 focus:bg-slate-900 focus:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            />
          </div>

          <div className="animate-slide-down space-y-2 transition-all duration-300" style={{animationDelay: '0.2s'}}>
            <label className="text-sm font-medium text-slate-300">Language *</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none transition-all duration-300 focus:border-emerald-400 focus:bg-slate-900 focus:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="animate-slide-down space-y-2 transition-all duration-300" style={{animationDelay: '0.3s'}}>
            <label className="text-sm font-medium text-slate-300">Role/Position</label>
            <select
              value={roleChoice}
              onChange={(e) => {
                setRoleChoice(e.target.value);
                if (e.target.value !== "other") {
                  setRole("");
                }
              }}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-base outline-none transition-all duration-300 focus:border-white/30 focus:bg-slate-900 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value || "role-placeholder"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {roleChoice === "other" ? (
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Enter custom role or position"
                className="w-full animate-fade-in rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-base outline-none transition-all duration-300 focus:border-emerald-400 focus:bg-slate-900 focus:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              />
            ) : null}
          </div>

          {/* file input moved below the recorder per UX request */}
        </div>

        <div className="mt-6">
          <VideoRecorder
            onVideoChange={(blob) => setRecordedVideo(blob)}
          />
          <div className="mt-2 text-xs text-slate-500">
            Recorded video in state: {recordedVideo ? `${(recordedVideo.size / 1024 / 1024).toFixed(2)} MB` : "—"}
          </div>

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-slate-300">Choose file (video)</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15"
            />
            {fileLabel ? (
              <div className="text-xs text-slate-500">{fileLabel}</div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onProcess}
            disabled={!canSubmit}
            className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:scale-100"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Processing...
              </>
            ) : (
              <span>Process Interview</span>
            )}
          </button>
          <div className="text-xs text-slate-500">
            Sends to `POST /process-interview` and shows results.
          </div>
        </div>
      </div>
    </section>
  );
}

