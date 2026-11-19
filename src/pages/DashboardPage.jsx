import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [welcomeMsg, setWelcomeMsg] = useState(location.state?.message || '');

  async function handleLogout() {
    await logout();
    navigate('/login', { state: { message: 'You have been securely logged out.' } });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-amber-500" />
          <span className="font-bold text-lg">Safe Data Box</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400 hidden sm:inline">
            {currentUser?.displayName || currentUser?.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-amber-400" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {welcomeMsg && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{welcomeMsg}</span>
            </div>
            <button onClick={() => setWelcomeMsg('')} className="text-xs underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold">Welcome to Your Protected Vault</h1>
          <p className="text-slate-400 text-sm mt-2">
            Signed in as <span className="text-amber-400">{currentUser?.email}</span>. Next, we will build your encrypted secret cards and CRUD modal!
          </p>
        </div>
      </main>
    </div>
  );
}
