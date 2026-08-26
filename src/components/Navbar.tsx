'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './LogoutButton';
import {
  GraduationCap,
  Building2,
  User,
  FileText,
  Share2,
  Bot,
  BarChart3,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname() || '';

  const isAdminSection = pathname.startsWith('/admin');
  const isStudentSection = pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Branding - Context-Aware */}
        {isAdminSection ? (
          <Link href="/admin/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 p-0.5 shadow-lg group-hover:shadow-amber-500/25 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-amber-100 to-orange-300 bg-clip-text text-transparent">
                T&P SRKR Portal
              </span>
              <span className="block text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                Officer Command Center
              </span>
            </div>
          </Link>
        ) : (
          <Link href={isStudentSection ? '/dashboard/profile' : '/'} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg group-hover:shadow-indigo-500/25 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                PlacementIntel
              </span>
              <span className="block text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                {isStudentSection ? 'Student Career Hub' : 'University Edition'}
              </span>
            </div>
          </Link>
        )}

        {/* Center Navigation Links - Strictly Segmented */}
        <nav className="hidden md:flex items-center space-x-1 text-xs font-medium text-slate-300">
          {isAdminSection ? (
            /* ADMIN NAVBAR: ONLY T&P Features, NO Student Links */
            <>
              <Link
                href="/admin/dashboard"
                className="px-3.5 py-2 rounded-xl bg-amber-950/50 border border-amber-800/40 text-amber-300 hover:text-white transition flex items-center space-x-1.5 font-semibold"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>T&P Officer Intelligence</span>
              </Link>
            </>
          ) : isStudentSection ? (
            /* STUDENT NAVBAR: ONLY Student Links, NO T&P Admin Link */
            <>
              <Link
                href="/dashboard/profile"
                className={`px-3 py-2 rounded-lg transition flex items-center space-x-1 ${
                  pathname === '/dashboard/profile' ? 'text-white bg-slate-800 font-semibold' : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Profile</span>
              </Link>
              <Link
                href="/dashboard/portfolio-preview"
                className={`px-3 py-2 rounded-lg transition flex items-center space-x-1 ${
                  pathname === '/dashboard/portfolio-preview' ? 'text-white bg-slate-800 font-semibold' : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Portfolio</span>
              </Link>
              <Link
                href="/dashboard/resume"
                className={`px-3 py-2 rounded-lg transition flex items-center space-x-1 ${
                  pathname === '/dashboard/resume' ? 'text-white bg-slate-800 font-semibold' : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resume PDF</span>
              </Link>
              <Link
                href="/dashboard/ai-analysis"
                className={`px-3 py-2 rounded-lg transition flex items-center space-x-1 ${
                  pathname === '/dashboard/ai-analysis' ? 'text-white bg-slate-800 font-semibold' : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Copilot</span>
              </Link>
            </>
          ) : (
            /* PUBLIC / AUTH PAGES NAVBAR */
            <>
              <Link href="/login" className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition">
                Portal Gateway
              </Link>
              <Link href="/signup" className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition">
                Student Registration
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {isAdminSection || isStudentSection ? (
            /* Logged in view -> Logout button */
            <LogoutButton variant="full" />
          ) : (
            /* Public view -> Portal selection and Signup */
            <>
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition"
              >
                Access Portal
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
