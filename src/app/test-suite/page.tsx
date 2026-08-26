'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function TestSuitePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const runTests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/test-suite');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Acceptance Criteria Verification Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Phase 1 Test Suite Results</h1>
        </div>

        <button
          onClick={runTests}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-Run Verification</span>
        </button>
      </div>

      {loading ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-300 font-medium">Running full Phase 1 automated acceptance test suite...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data?.success ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-rose-950/80 text-rose-400 border border-rose-800'}`}>
                {data?.success ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  {data?.success ? 'All Acceptance Criteria PASSED' : 'Verification Criteria Failed'}
                </h3>
                <p className="text-xs text-slate-400">
                  Passed {data?.passedCriteria} / {data?.totalCriteria} criteria checks
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-2xl font-black text-indigo-400">
              {Math.round((data?.passedCriteria / data?.totalCriteria) * 100)}%
            </div>
          </div>

          {/* Detailed Criteria Checklist Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
              <span>Acceptance Criterion & Verification Note</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {data?.checklist?.map((item: any, idx: number) => (
                <div key={idx} className="p-4 sm:px-6 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-white">{item.criterion}</h4>
                    <p className="text-xs text-slate-400 font-mono">{item.note}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold font-mono flex items-center space-x-1 flex-shrink-0 ${
                      item.status === 'PASS'
                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                        : 'bg-rose-950 border border-rose-800 text-rose-300'
                    }`}
                  >
                    {item.status === 'PASS' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{item.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
