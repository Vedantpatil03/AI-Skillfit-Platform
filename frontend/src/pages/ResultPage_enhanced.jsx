import { Link, useLocation } from "react-router-dom";
import jsPDF from "jspdf";

function ScoreBar({ score, label, maxScore = 25 }) {
  const percentage = (score / maxScore) * 100;
  const color = score >= (maxScore * 0.8) ? 'bg-green-500' : 
                score >= (maxScore * 0.6) ? 'bg-yellow-500' : 
                score >= (maxScore * 0.4) ? 'bg-orange-500' : 'bg-red-500';
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-slate-100">{score}/{maxScore}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{width: `${percentage}%`}}></div>
      </div>
    </div>
  );
}

function ClassificationBadge({ classification }) {
  const configs = {
    job_ready: {
      colors: 'bg-green-500/20 text-green-200 border-green-500/30',
      icon: '✓',
      label: 'Job Ready'
    },
    training_needed: {
      colors: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
      icon: '→',
      label: 'Requires Training'
    },
    manual_verification: {
      colors: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
      icon: '⚠',
      label: 'Manual Review'
    },
    low_confidence: {
      colors: 'bg-red-500/20 text-red-200 border-red-500/30',
      icon: '✗',
      label: 'Low Confidence'
    },
    fraud_suspected: {
      colors: 'bg-red-700/30 text-red-100 border-red-600/30',
      icon: '⚠',
      label: 'Fraud Alert'
    },
  };

  const config = configs[classification] || {
    colors: 'bg-slate-500/20 text-slate-200 border-slate-500/30',
    icon: '?',
    label: classification
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${config.colors}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}

export default function ResultPage() {
  const { state } = useLocation();
  let data = state || null;
  // If no navigation state (user returned from dashboard), try sessionStorage
  if (!data) {
    try {
      const raw = sessionStorage.getItem('last_result');
      if (raw) {
        data = JSON.parse(raw);
      }
    } catch (e) {
      data = null;
    }
  } else {
    // persist incoming state for later visits
    try {
      sessionStorage.setItem('last_result', JSON.stringify(state));
    } catch (e) {
      // ignore
    }
  }
  const fraudRisk = data?.fraud_analysis?.fraud_risk_score ?? 0;
  const fraudFlagged = data?.classification === "fraud_suspected" || fraudRisk > 0.3;
  const candidateName = data?.name || "Candidate";
  const createdDate = data?.created_at ? new Date(data.created_at) : null;
  const hasValidDate = createdDate instanceof Date && !Number.isNaN(createdDate.getTime());

  function downloadPDF() {
    if (!data) {
      alert("No result data to download");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 10;
    const margin = 10;
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = 5;

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("Interview Results", margin, yPosition);
    yPosition += 10;

    // Candidate Name
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`Candidate: ${data.name || "—"}`, margin, yPosition);
    yPosition += 8;

    // Overall Score
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`Overall Score: ${data.score || "—"} / 100`, margin, yPosition);
    yPosition += 8;

    // Classification
    if (data.classification) {
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text(`Classification: ${data.classification.replace(/_/g, " ")}`, margin, yPosition);
      yPosition += 8;
    }

    // Candidate Information
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("Candidate Information", margin, yPosition);
    yPosition += 6;
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);

    const infoLines = [
      `Language: ${data.language?.toUpperCase() || "—"}`,
      `Workforce Segment: ${data.workforce_segment?.replace(/_/g, " ") || "—"}`,
      `Date: ${hasValidDate ? createdDate.toLocaleDateString() : "—"}`
    ];

    infoLines.forEach((line) => {
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 3;

    // Evaluation Breakdown
    if (data.evaluation) {
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("Evaluation Breakdown", margin, yPosition);
      yPosition += 6;
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);

      const evalLines = [
        `Relevance (Answer alignment): ${data.evaluation.relevance_score || 0}/25`,
        `Completeness (Response depth): ${data.evaluation.completeness_score || 0}/25`,
        `Clarity (Communication quality): ${data.evaluation.clarity_score || 0}/25`,
        `Confidence (No hesitation): ${data.evaluation.confidence_score || 0}/25`,
        `Authenticity (Verification): ${data.evaluation.authenticity_score || 0}/25`
      ];

      evalLines.forEach((line) => {
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 3;
    }

    // Feedback
    if (data.feedback) {
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("Feedback & Recommendations", margin, yPosition);
      yPosition += 6;
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);

      if (data.feedback.feedback_text) {
        const feedbackLines = doc.splitTextToSize(data.feedback.feedback_text, maxWidth);
        feedbackLines.forEach((line) => {
          if (yPosition > pageHeight - 15) {
            doc.addPage();
            yPosition = 10;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        });
      }

      if (data.feedback.recommendations?.length > 0) {
        yPosition += 3;
        doc.setFont(undefined, "bold");
        doc.text("Recommendations:", margin, yPosition);
        yPosition += 5;
        doc.setFont(undefined, "normal");

        data.feedback.recommendations.forEach((rec) => {
          if (yPosition > pageHeight - 15) {
            doc.addPage();
            yPosition = 10;
          }
          const recLines = doc.splitTextToSize(`• ${rec}`, maxWidth);
          recLines.forEach((line) => {
            doc.text(line, margin, yPosition);
            yPosition += 5;
          });
        });
      }
    }

    // Fraud Analysis
    if (data.fraud_analysis && data.fraud_analysis.fraud_risk_score > 0.3) {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 10;
      }
      yPosition += 5;
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("Fraud & Authenticity Analysis", margin, yPosition);
      yPosition += 6;
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);

      const fraudLines = [
        `Fraud Risk Score: ${(data.fraud_analysis.fraud_risk_score * 100).toFixed(1)}%`,
        `Face Detection: ${data.fraud_analysis.face_detected ? "✓ Detected" : "✗ Not Detected"}`,
        `Liveness Score: ${(data.fraud_analysis.liveness_score * 100).toFixed(0)}%`,
        `Voice Continuity: ${data.fraud_analysis.voice_continuity ? "✓ Continuous" : "✗ Issues Detected"}`
      ];

      fraudLines.forEach((line) => {
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          yPosition = 10;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
    }

    // Download
    doc.save(`interview-result-${data.name || "candidate"}.pdf`);
  }

  return (
    <section className="space-y-6 print:space-y-4 print:bg-white print:text-black">
      <div>
        <h1 className="text-2xl font-bold print:text-black">Interview Results</h1>
        <p className="mt-2 text-sm text-slate-400 print:text-slate-700">
          Comprehensive AI-generated analysis of candidate performance, confidence, and workforce suitability.
        </p>
        <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 print:border-slate-300 print:bg-white">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400 print:text-slate-500">Candidate</span>
          <span className="text-lg font-semibold text-white print:text-black">{candidateName}</span>
        </div>
      </div>

      {fraudFlagged && (
        <div className={`rounded-xl border p-5 ${fraudRisk > 0.7 ? 'border-red-500/50 bg-red-500/10' : 'border-orange-500/40 bg-orange-500/10'} print:border-slate-300 print:bg-white print:text-black`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className={`text-sm font-semibold ${fraudRisk > 0.7 ? 'text-red-100' : 'text-orange-100'} print:text-black`}>
                Fraud / Authenticity Flagged
              </div>
              <div className={`text-xs ${fraudRisk > 0.7 ? 'text-red-50' : 'text-orange-50'} print:text-slate-700`}>
                This interview needs manual verification before any hiring decision.
              </div>
            </div>
          </div>
          {data?.requires_escalation && (
            <div className="mt-3 text-xs font-medium text-white/90 print:text-slate-700">
              Escalation status: queued for review.
            </div>
          )}
        </div>
      )}

      {!data ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 print:border-slate-300 print:bg-white">
          <div className="text-lg text-slate-300 font-medium mb-2 print:text-black">No result loaded.</div>
          <p className="text-sm text-slate-400 mb-4 print:text-slate-700">
            Go to the Interview page and process a recording to see results here.
          </p>
          <Link
            to="/interview"
            className="inline-flex rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-2 text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition print:hidden"
          >
            Go to Interview
          </Link>
        </div>
      ) : (
        <>
          {/* Main Score and Classification */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-center print:border-slate-300 print:bg-white">
              <div className="text-sm text-emerald-200 font-medium mb-2 print:text-slate-700">Overall Score</div>
              <div className="text-6xl font-bold text-emerald-100 print:text-black">{data.score ?? "—"}</div>
              <div className="text-xs text-emerald-200 mt-2 print:text-slate-700">/100</div>
              {data.classification && (
                <div className="mt-6">
                  <ClassificationBadge classification={data.classification} />
                </div>
              )}
            </div>

            {/* Candidate Information */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 print:border-slate-300 print:bg-white">
              <div className="text-sm font-semibold text-slate-300 print:text-black">Candidate Information</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-slate-700">Name</span>
                  <span className="text-white font-medium print:text-black">{data.name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-slate-700">Language</span>
                  <span className="text-white print:text-black">{data.language?.toUpperCase() || "—"}</span>
                </div>
                {/* District removed from UI */}
                {data.workforce_segment && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-700">Workforce Segment</span>
                    <span className="text-white capitalize print:text-black">{data.workforce_segment.replace(/_/g, ' ')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-slate-700">Date</span>
                  <span className="text-white print:text-black">{hasValidDate ? createdDate.toLocaleDateString() : "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Score Breakdown */}
          {data.evaluation && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 print:border-slate-300 print:bg-white print:break-inside-avoid">
              <div className="text-sm font-semibold text-slate-300 mb-6 print:text-black">Evaluation Breakdown</div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <ScoreBar 
                    score={data.evaluation.relevance_score || 0}
                    label="Relevance (Answer alignment to question)"
                  />
                  <ScoreBar 
                    score={data.evaluation.completeness_score || 0}
                    label="Completeness (Response depth)"
                  />
                  <ScoreBar 
                    score={data.evaluation.clarity_score || 0}
                    label="Clarity (Communication quality)"
                  />
                </div>
                <div className="space-y-4">
                  <ScoreBar 
                    score={data.evaluation.confidence_score || 0}
                    label="Confidence (No hesitation)"
                  />
                  <ScoreBar 
                    score={data.evaluation.authenticity_score || 0}
                    label="Authenticity (Verification)"
                  />
                  <div className="h-4"></div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback and Recommendations */}
          {data.feedback && (
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-6 print:border-slate-300 print:bg-white print:break-inside-avoid">
              <div className="text-sm font-semibold text-orange-100 mb-4 print:text-black">Feedback & Recommendations</div>
              
              <p className="text-sm text-orange-50 mb-6 leading-relaxed print:text-slate-700">{data.feedback.feedback_text}</p>

              {data.feedback.recommendations?.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-semibold text-orange-100 mb-3 print:text-black">Recommendations:</div>
                  <ul className="space-y-2">
                    {data.feedback.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-orange-50 ml-4 print:text-slate-700">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {data.feedback.next_steps?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-emerald-100 mb-3 print:text-black">Next Steps:</div>
                  <ul className="space-y-2">
                    {data.feedback.next_steps.map((step, i) => (
                      <li key={i} className="text-xs text-emerald-50 ml-4 print:text-slate-700">→ {step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Fraud Analysis Alert */}
          {data.fraud_analysis && data.fraud_analysis.fraud_risk_score > 0.3 && (
            <div className={`rounded-xl border p-6 print:border-slate-300 print:bg-white print:break-inside-avoid ${
              data.fraud_analysis.fraud_risk_score > 0.7 
                ? 'border-red-500/50 bg-red-500/10' 
                : 'border-orange-500/30 bg-orange-500/10'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚠️</span>
                <span className={`text-sm font-semibold ${
                  data.fraud_analysis.fraud_risk_score > 0.7 
                    ? 'text-red-100' 
                    : 'text-orange-100'
                }`}>
                  Fraud & Authenticity Analysis
                </span>
              </div>

              <div className={`space-y-3 text-sm ${
                data.fraud_analysis.fraud_risk_score > 0.7 
                  ? 'text-red-50' 
                  : 'text-orange-50'
              }`}>
                <div className="flex justify-between">
                  <span>Fraud Risk Score</span>
                  <span className="font-semibold">{(data.fraud_analysis.fraud_risk_score * 100).toFixed(1)}%</span>
                </div>
                
                <div>
                  <span>Face Detection</span>
                  <span className="float-right font-semibold">
                    {data.fraud_analysis.face_detected ? '✓ Detected' : '✗ Not Detected'}
                  </span>
                </div>

                <div>
                  <span>Liveness Score</span>
                  <span className="float-right font-semibold">{(data.fraud_analysis.liveness_score * 100).toFixed(0)}%</span>
                </div>

                <div>
                  <span>Voice Continuity</span>
                  <span className="float-right font-semibold">
                    {data.fraud_analysis.voice_continuity ? '✓ Continuous' : '✗ Issues Detected'}
                  </span>
                </div>

                {data.fraud_analysis.flags?.length > 0 && (
                  <div className="pt-2 border-t border-current/20">
                    <div className="font-semibold mb-2">Flags:</div>
                    <ul className="ml-4 space-y-1">
                      {data.fraud_analysis.flags.map((flag, i) => (
                        <li key={i}>⚠ {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transcript */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 print:border-slate-300 print:bg-white print:break-inside-avoid">
            <div className="text-sm font-semibold text-slate-300 mb-3 print:text-black">Transcript</div>
            <div className="whitespace-pre-wrap text-sm text-slate-100 leading-relaxed print:text-slate-800">
              {data.transcript || "—"}
            </div>
          </div>

          {/* Download Button */}
          <div className="flex gap-3 print:hidden">
            <button
              type="button"
              onClick={downloadPDF}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2 text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition"
            >
              Download Result as PDF
            </button>
          </div>
        </>
      )}
    </section>
  );
}
