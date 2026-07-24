import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage.jsx";
import InterviewPage from "./pages/InterviewPage.jsx";
import ResultPage from "./pages/ResultPage_enhanced.jsx";
import TopNav from "./components/TopNav.jsx";

export default function App() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <TopNav />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

