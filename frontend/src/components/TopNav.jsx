import { NavLink } from "react-router-dom";

const linkBase =
  "rounded-md px-3 py-2 text-sm font-medium transition-colors";

export default function TopNav() {
  return (
    <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">AI SKILLFIT</div>
            <div className="text-xs text-slate-400">
              AI-Powered Multilingual Video Interview &amp; Candidate Assessment Platfrom
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
              }`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/interview"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
              }`
            }
          >
            AI Interview
          </NavLink>
          <NavLink
            to="/result"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
              }`
            }
          >
            Assessment Report
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

