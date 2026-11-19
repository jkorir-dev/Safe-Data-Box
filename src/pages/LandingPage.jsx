import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, RefreshCw, Code2, Table, Globe, Cloud, ArrowRight, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateDataset } from '../utils/kenyanGenerator';

const DEMO_SCHEMA = [
  { key: 'transaction_id', type: 'relational_id' },
  { key: 'mpesa_code', type: 'mpesa_code' },
  { key: 'customer_name', type: 'kenyan_name' },
  { key: 'phone_number', type: 'kenyan_phone' },
  { key: 'county', type: 'kenyan_county' },
  { key: 'amount_kes', type: 'kes_amount' },
];

export default function LandingPage() {
  const { currentUser } = useAuth();
  const [sampleData, setSampleData] = useState(() => generateDataset(DEMO_SCHEMA, 4));
  const [viewMode, setViewMode] = useState('table');
  const [copied, setCopied] = useState(false);

  function handleRegenerate() {
    setSampleData(generateDataset(DEMO_SCHEMA, 4));
  }

  function handleCopyDemo() {
    navigator.clipboard.writeText(JSON.stringify(sampleData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <Database className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-lg font-bold tracking-tight">Safe Data Box</span>
          </div>

          <nav className="flex items-center gap-3">
            {currentUser ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm transition"
              >
                Open Generator Studio
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm transition"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="text-center max-w-3xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-block mb-5">
            Synthetic Kenyan & Standard Test Data Studio
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Realistic Local Test Data Without Risking <span className="text-amber-400">User Privacy</span>
          </h1>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Generate synthetic Kenyan phone numbers, M-Pesa transaction codes, KRA PINs, and relational IDs in seconds—or clone structures from any live REST API.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link
              to={currentUser ? '/dashboard' : '/register'}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl flex items-center gap-2 transition"
            >
              <span>{currentUser ? 'Launch Studio' : 'Start Building Custom Schemas'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded-xl transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* User Story #1: Interactive Visitor Quick Demo */}
        <section className="mt-14 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90">
            <div>
              <h2 className="font-semibold text-slate-100 text-base">
                Instant Visitor Demo — Kenyan M-Pesa Payment Payload
              </h2>
              <p className="text-xs text-slate-400">
                Try generating synthetic localized records right now before creating an account
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer transition ${
                    viewMode === 'table' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('json')}
                  className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer transition ${
                    viewMode === 'json' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleRegenerate}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={handleCopyDemo}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>

          <div className="p-5 overflow-x-auto">
            {viewMode === 'table' ? (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                    {Object.keys(sampleData[0] || {}).map((col) => (
                      <th key={col} className="py-2.5 px-3 font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {sampleData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{row.transaction_id}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-amber-400 font-semibold">{row.mpesa_code}</td>
                      <td className="py-2.5 px-3 text-slate-200">{row.customer_name}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-emerald-400">{row.phone_number}</td>
                      <td className="py-2.5 px-3 text-slate-300">{row.county}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-200">KES {row.amount_kes.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                {JSON.stringify(sampleData, null, 2)}
              </pre>
            )}
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <Database className="w-7 h-7 text-amber-500 mb-3" />
            <h3 className="text-lg font-semibold">Localized Kenyan Generators</h3>
            <p className="text-slate-400 text-sm mt-2">
              Build custom schemas with +254 mobile numbers, M-Pesa codes, KRA PINs, counties, and relational IDs.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <Globe className="w-7 h-7 text-emerald-400 mb-3" />
            <h3 className="text-lg font-semibold">Clone Live REST APIs</h3>
            <p className="text-slate-400 text-sm mt-2">
              Paste any external REST API URL to inspect its JSON structure and import keys into your builder automatically.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <Cloud className="w-7 h-7 text-amber-400 mb-3" />
            <h3 className="text-lg font-semibold">Privacy-First by Default</h3>
            <p className="text-slate-400 text-sm mt-2">
              Generate realistic test records locally without exposing personal data or customer production datasets.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Safe Data Box</span>
          <span>Synthetic data for safer development and testing.</span>
        </div>
      </footer>
    </div>
  );
}
