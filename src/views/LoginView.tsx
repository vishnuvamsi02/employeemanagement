import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Shield,
  UserCheck,
  Calculator,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';

const DEMO_CREDENTIALS = [
  {
    role: 'owner' as UserRole,
    label: 'Owner',
    email: 'owner@apexeng.in',
    icon: Shield,
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20',
    desc: 'Full administrative & payroll control'
  },
  {
    role: 'supervisor' as UserRole,
    label: 'Supervisor',
    email: 'supervisor@apexeng.in',
    icon: UserCheck,
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20',
    desc: 'Attendance & overtime with salary privacy'
  },
  {
    role: 'accountant' as UserRole,
    label: 'Accountant',
    email: 'accountant@apexeng.in',
    icon: Calculator,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20',
    desc: 'Expenses, vouchers & advance ledger'
  }
];

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('owner@apexeng.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Detect role from email or selected quick account
  const detectRole = (inputEmail: string): UserRole => {
    const lower = inputEmail.toLowerCase();
    if (lower.includes('supervisor')) return 'supervisor';
    if (lower.includes('accountant')) return 'accountant';
    return 'owner';
  };

  const activeRole = detectRole(email);
  const activeCredential = DEMO_CREDENTIALS.find(c => c.role === activeRole) || DEMO_CREDENTIALS[0];

  const handleSelectDemoAccount = (demo: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(demo.email);
    setPassword('password123');
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    // Realistic authentication flow with smooth response
    setTimeout(() => {
      const role = detectRole(email);
      login(role, email.trim());
      setIsLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 flex flex-col justify-center items-center relative overflow-hidden font-sans p-4 sm:p-6 selection:bg-indigo-500 selection:text-white">
      {/* High-Performance Ambient Dark Mesh Glows */}
      <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-purple-600/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-sky-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Grid Lines Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, #070A13 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/10">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">OmniStaff</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Workforce & Indian Payroll HRMS</p>
            </div>
          </div>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          <div className="mb-5 text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Sign in to your account</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your credentials or choose a quick demo role</p>
          </div>

          {/* Quick Demo Credentials Pill Selector */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2">
              <span>Quick Demo Accounts:</span>
              <span className="text-[10px] text-indigo-400">Click to autofill</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {DEMO_CREDENTIALS.map(demo => {
                const isSelected = activeRole === demo.role;
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleSelectDemoAccount(demo)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      isSelected
                        ? `${demo.color} border-current ring-1 ring-current shadow-xs`
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">{demo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Standard Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  placeholder="name@company.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <span className="text-[10px] text-slate-500">Demo: password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-500 hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500/40"
                />
                <span>Remember session</span>
              </label>
              <span className="text-[11px] text-indigo-400/90 font-medium cursor-pointer hover:underline">
                Forgot password?
              </span>
            </div>

            {/* Dynamic Role Access Indicator */}
            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-2.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-slate-400 text-[11px]">Portal: </span>
                <span className="font-bold text-white text-[11px] capitalize">{activeCredential.label} Access</span>
                <p className="text-[10px] text-slate-500 truncate">{activeCredential.desc}</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {activeCredential.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Compliance & Security Footnote */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encryption</span>
            </span>
            <span>Cloud & Supabase Ready</span>
          </div>
        </div>

        {/* Global Footer */}
        <p className="text-center text-xs text-slate-600">
          OmniStaff HRMS • Indian Statutory & Factories Act Compliant
        </p>
      </div>
    </div>
  );
};

export default LoginView;
