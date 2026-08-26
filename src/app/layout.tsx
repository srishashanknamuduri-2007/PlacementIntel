import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'PlacementIntel — Student Professional Portfolio & Placement Intelligence Platform',
  description: 'Single structured profile platform generating ATS resumes, public portfolios, and placement analytics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <Navbar />

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-800/60 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} PlacementIntel Platform. SRKR Engineering College Placement Intelligence.</p>
            <div className="flex space-x-4 text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> AES-256 RBAC Protected
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
