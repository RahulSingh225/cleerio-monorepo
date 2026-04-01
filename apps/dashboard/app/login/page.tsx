'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, Shield, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login({ email, password, tenantId: tenantId || undefined });
      router.push('/insights');
    } catch (err: any) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#1a3a8f] to-[#2D5BFF] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border border-white/30 rounded-full" />
          <div className="absolute bottom-40 left-10 w-96 h-96 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">cleerio.ai</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-5xl font-bold leading-tight tracking-tight">
            India's AI Only<br />
            Collections<br />
            Platform
          </h2>
          <p className="text-lg text-blue-100 max-w-md leading-relaxed">
            The world's most advanced recovery engine for banking and financial institutions. Secure, automated, and high-performance.
          </p>

          <div className="space-y-5 pt-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Bank-Grade Security</h3>
                <p className="text-sm text-blue-200 mt-0.5">SOC2 Type II compliant infrastructure with end-to-end encryption.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Predictive Analytics</h3>
                <p className="text-sm text-blue-200 mt-0.5">Advanced ML models to optimize recovery rates and customer relations.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-[#2D5BFF]" />
            <div className="w-8 h-8 rounded-full bg-emerald-300 border-2 border-[#2D5BFF]" />
          </div>
          <span className="text-sm font-medium text-blue-200 uppercase tracking-wider">Trusted by 200+ Institutions</span>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center bg-[var(--background)] p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">cleerio.ai</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Institutional Login</h1>
            <p className="text-[var(--text-secondary)] mt-2">Please enter your professional credentials to access your dashboard.</p>  
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tenant Code */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Organization Code</label>
              <input
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="REFINE"
                className="w-full bg-white border border-[var(--border)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)] placeholder:text-[var(--text-tertiary)] transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Work Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.com"
                  className="w-full bg-white border border-[var(--border)] rounded-lg pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)] placeholder:text-[var(--text-tertiary)] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[var(--text-primary)]">Password</label>
                <a href="#" className="text-sm text-[var(--primary)] hover:underline font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[var(--border)] rounded-lg pl-10 pr-10 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)] placeholder:text-[var(--text-tertiary)] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">Remember this workstation for 30 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>→ Secure Sign In</>
              )}
            </button>
          </form>

          {/* SSO divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Enterprise SSO</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* SSO buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.47 3.77 1.18 5.42l3.66-2.84.01-.49z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 23 23" fill="#00a4ef"><path d="M1 1h10v10H1z"/><path d="M12 1h10v10H12z"/><path d="M1 12h10v10H1z"/><path d="M12 12h10v10H12z"/></svg>
              Azure AD
            </button>
          </div>

          <p className="text-center text-sm text-[var(--text-tertiary)]">
            Need an account? <a href="#" className="text-[var(--primary)] hover:underline font-medium">Contact our solutions team</a>
          </p>

          {/* Footer */}
          <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-tertiary)] pt-4">
            <a href="#" className="hover:text-[var(--text-secondary)]">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--text-secondary)]">Terms of Service</a>
            <a href="#" className="hover:text-[var(--text-secondary)]">Security Center</a>
            <a href="#" className="hover:text-[var(--text-secondary)]">Status</a>
          </div>
        </div>
      </div>
    </div>
  );
}
