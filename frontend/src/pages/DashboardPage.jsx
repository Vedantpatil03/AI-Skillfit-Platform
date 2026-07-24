import { useState, useEffect } from 'react';
import { api } from '../lib/api';

function StatCard({ title, value, subtext, color = 'slate' }) {
  const colorClasses = {
    green: 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-400/5 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    yellow: 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-400/5 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    cyan: 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    red: 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-400/5 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    slate: 'border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]',
  };

  return (
    <div className={`animate-scale-in rounded-xl border ${colorClasses[color]} p-5 backdrop-blur-sm transition-all duration-300`}>
      <div className="text-sm text-slate-400 font-medium">{title}</div>
      <div className="mt-2 text-3xl font-bold bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-clip-text text-transparent">{value}</div>
      {subtext && <div className="mt-1 text-xs text-slate-500">{subtext}</div>}
    </div>
  );
}

function FilterSection({ filters, setFilters, onSearch }) {
  const [classifications, setClassifications] = useState([]);
  const [segments, setSegments] = useState([]);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [classRes, segRes, langRes] = await Promise.all([
          api.get('/dashboard/classifications'),
          api.get('/dashboard/workforce-segments'),
          api.get('/languages'),
        ]);
        setClassifications(classRes.data.classifications || []);
        setSegments(segRes.data.segments || []);
        setLanguages(langRes.data || []);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchFilters();
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 text-sm font-semibold">Advanced Filters</div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="text-xs text-slate-400">Classification</label>
          <select
            value={filters.classification || ''}
            onChange={(e) => setFilters({ ...filters, classification: e.target.value || null })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            <option value="">All Classifications</option>
            {classifications.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* District filter removed */}

        <div>
          <label className="text-xs text-slate-400">Language</label>
          <select
            value={filters.language || ''}
            onChange={(e) => setFilters({ ...filters, language: e.target.value || null })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            <option value="">All Languages</option>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400">Workforce Segment</label>
          <select
            value={filters.workforce_segment || ''}
            onChange={(e) => setFilters({ ...filters, workforce_segment: e.target.value || null })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            <option value="">All Segments</option>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onSearch}
          className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Search
        </button>
        <button
          onClick={() => {
            const clearedFilters = {
              classification: null,
              district: null,
              language: null,
              workforce_segment: null,
            };
            setFilters(clearedFilters);
            onSearch(clearedFilters);
          }}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium hover:bg-white/5"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function CandidatesTable({ candidates, loading }) {
  const getStatusColor = (classification) => {
    const colors = {
      training_needed: 'bg-yellow-500/20 text-yellow-200',
      manual_verification: 'bg-orange-500/20 text-orange-200',
      low_confidence: 'bg-red-500/20 text-red-200',
      fraud_suspected: 'bg-red-700/30 text-red-100',
    };
    return colors[classification] || 'bg-slate-500/20 text-slate-200';
  };

  if (loading) {
    return <div className="text-center text-slate-400">Loading...</div>;
  }

  if (!candidates || candidates.length === 0) {
    return <div className="text-center text-slate-400">No candidates found</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Score</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Classification</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Language</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Segment</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Date</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, idx) => (
            <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
              <td className="px-4 py-3 text-white">{candidate.name}</td>
              <td className="px-4 py-3">
                <span className="inline-block rounded px-2 py-1 bg-slate-700 text-slate-100">
                  {candidate.score}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${getStatusColor(candidate.classification)}`}>
                  {candidate.classification?.replace(/_/g, ' ') || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-300">{candidate.language?.toUpperCase()}</td>
              <td className="px-4 py-3 text-slate-300">{candidate.workforce_segment?.replace(/_/g, ' ') || '-'}</td>
              <td className="px-4 py-3 text-slate-400">
                {new Date(candidate.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const RECENT_CANDIDATES_HIDDEN_KEY = 'dashboard_recent_candidates_hidden';
const DASHBOARD_REFRESH_TOKEN_KEY = 'dashboard_refresh_token';

function RiskBadge({ risk }) {
  const value = Number(risk || 0);
  const isHigh = value > 0.7;
  const isMedium = value > 0.3;

  const classes = isHigh
    ? 'bg-red-600/20 text-red-100'
    : isMedium
      ? 'bg-orange-500/20 text-orange-100'
      : 'bg-green-500/20 text-green-100';

  return (
    <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${classes}`}>
      {(value * 100).toFixed(0)}%
    </span>
  );
}

function AlertPanels({ fraudAlerts, escalationQueue, loadingPanels }) {
  const renderCandidateItem = (candidate, idx, showRisk = false) => {
    const risk = candidate?.fraud_indicators?.fraud_risk_score || 0;
    return (
      <div key={`${candidate.name || 'candidate'}-${idx}`} className="rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-white">{candidate.name || 'Unknown'}</div>
            <div className="mt-1 text-xs text-slate-400">
              Class: {candidate.classification?.replace(/_/g, ' ') || 'N/A'}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Score: {candidate.score ?? 0}
            </div>
          </div>
          {showRisk && <RiskBadge risk={risk} />}
        </div>
        {Array.isArray(candidate?.fraud_indicators?.flags) && candidate.fraud_indicators.flags.length > 0 && (
          <div className="mt-2 text-xs text-orange-200">
            {candidate.fraud_indicators.flags.slice(0, 2).join(' | ')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-red-100">Fraud Alerts</h3>
          <span className="rounded bg-red-700/30 px-2 py-1 text-xs text-red-100">
            {fraudAlerts.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {loadingPanels ? (
            <div className="text-sm text-slate-300">Loading fraud alerts...</div>
          ) : fraudAlerts.length === 0 ? (
            <div className="text-sm text-slate-300">No active fraud alerts.</div>
          ) : (
            fraudAlerts.slice(0, 5).map((candidate, idx) => renderCandidateItem(candidate, idx, true))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-orange-100">Manual Review Queue</h3>
          <span className="rounded bg-orange-700/30 px-2 py-1 text-xs text-orange-100">
            {escalationQueue.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {loadingPanels ? (
            <div className="text-sm text-slate-300">Loading escalation queue...</div>
          ) : escalationQueue.length === 0 ? (
            <div className="text-sm text-slate-300">No candidates pending review.</div>
          ) : (
            escalationQueue.slice(0, 5).map((candidate, idx) => renderCandidateItem(candidate, idx, false))
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPanels, setLoadingPanels] = useState(true);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [escalationQueue, setEscalationQueue] = useState([]);
  const [filters, setFilters] = useState({
    classification: null,
    language: null,
    workforce_segment: null,
  });
  const [hideRecentCandidates, setHideRecentCandidates] = useState(() => {
    try {
      return sessionStorage.getItem(RECENT_CANDIDATES_HIDDEN_KEY) === '1';
    } catch (error) {
      return false;
    }
  });

  const clearedFilters = {
    classification: null,
    language: null,
    workforce_segment: null,
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchReviewPanels = async () => {
      setLoadingPanels(true);
      try {
        const [fraudRes, escalationRes] = await Promise.all([
          api.get('/dashboard/fraud-alerts?limit=20'),
          api.get('/dashboard/escalation-queue?limit=20'),
        ]);

        setFraudAlerts(fraudRes.data.fraud_alerts || []);
        setEscalationQueue(escalationRes.data.escalation_queue || []);
      } catch (error) {
        console.error('Error loading review panels:', error);
        setFraudAlerts([]);
        setEscalationQueue([]);
      } finally {
        setLoadingPanels(false);
      }
    };

    fetchReviewPanels();
  }, []);

  useEffect(() => {
    const refreshIfNeeded = () => {
      const refreshToken = sessionStorage.getItem(DASHBOARD_REFRESH_TOKEN_KEY);
      if (!refreshToken) return;

      try {
      } catch (error) {
        // ignore storage errors
      }
      setHideRecentCandidates(false);
      handleSearch(clearedFilters);
    };

    refreshIfNeeded();

    window.addEventListener('focus', refreshIfNeeded);
    return () => window.removeEventListener('focus', refreshIfNeeded);
  }, []);

  const handleSearch = async (searchFilters = filters) => {
    try {
      sessionStorage.removeItem(RECENT_CANDIDATES_HIDDEN_KEY);
    } catch (error) {
      // ignore storage errors
    }
    setHideRecentCandidates(false);
    setLoading(true);
    try {
      const res = await api.post('/dashboard/search', {
        ...searchFilters,
        limit: 50,
      });
      setCandidates(res.data.candidates || []);
    } catch (error) {
      console.error('Error searching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetRecentCandidates = () => {
    setFilters(clearedFilters);
    setHideRecentCandidates(true);
    try {
      sessionStorage.setItem(RECENT_CANDIDATES_HIDDEN_KEY, '1');
    } catch (error) {
      // ignore storage errors
    }
    setCandidates([]);
    setLoading(false);
  };

  const handleShowRecentCandidates = () => {
    try {
      sessionStorage.removeItem(RECENT_CANDIDATES_HIDDEN_KEY);
    } catch (error) {
      // ignore storage errors
    }
    setHideRecentCandidates(false);
    handleSearch(clearedFilters);
  };

  useEffect(() => {
    if (hideRecentCandidates) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    handleSearch();
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Intelligence Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          Monitor AI-powered candidate assessments, classifications, and verification insights.
        </p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Candidates" value={stats.total_candidates} color="emerald" />
          <StatCard title="Average Score" value={stats.average_score} color="slate" />
          <StatCard title="Manual Reviews" value={stats.classifications?.manual_verification || 0} color="orange" />
          <StatCard title="Fraud Alerts" value={stats.potential_fraud_cases || 0} color="red" />
        </div>
      )}

      <FilterSection filters={filters} setFilters={setFilters} onSearch={handleSearch} />

      <AlertPanels
        fraudAlerts={fraudAlerts}
        escalationQueue={escalationQueue}
        loadingPanels={loadingPanels}
      />

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent Candidates</h2>
          <div className="flex gap-2">
            {hideRecentCandidates ? (
              <button
                type="button"
                onClick={handleShowRecentCandidates}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Show Recent Candidates
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleResetRecentCandidates}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium hover:bg-white/5"
            >
              Reset
            </button>
          </div>
        </div>
        {hideRecentCandidates ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
            <div className="mb-2">Recent candidates are hidden.</div>
            <div className="flex gap-2">
              <button
                onClick={handleShowRecentCandidates}
                className="rounded-lg bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
              >
                Show Recent Candidates
              </button>
              <div className="text-slate-400">Process a new interview or use Search to load results again.</div>
            </div>
          </div>
        ) : (
          <CandidatesTable candidates={candidates} loading={loading} />
        )}
      </div>
    </section>
  );
}

