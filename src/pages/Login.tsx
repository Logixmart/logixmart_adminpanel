import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginAdmin, type LoginSession } from '../api/admin';
import { setAuthTokens } from '../utils/auth';
import { CompanyLogo } from '../components/ui/CompanyLogo';

interface LoginProps {
  onLoginSuccess: (session: LoginSession) => void;
}

let keepActivePreference = true;

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [keepActive, setKeepActive] = useState(keepActivePreference);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field check
    if (!email || !password) {
      setError('Please fill in all operator credentials');
      return;
    }

    setIsLoading(true);

    const response = await loginAdmin(email, password);
    setIsLoading(false);

    if (response.success && response.token) {
      const loggedInEmail = response.admin?.email || email;
      setAuthTokens(response.token, response.refreshToken);
      localStorage.setItem('logixmart_admin_email', loggedInEmail);
      onLoginSuccess({
        email: loggedInEmail,
        password,
        name: response.admin?.name,
        role: response.admin?.role,
        id: response.admin?.id,
      });
    } else {
      setError(response.message || 'Invalid operator email or access passcode');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full relative bg-brand-dark overflow-hidden p-6">
      {/* Visual background lights */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[45%] rounded-full bg-accent-primary/15 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[45%] h-[50%] rounded-full bg-accent-secondary/10 blur-[80px] pointer-events-none" />

      <div className="glass-panel w-full max-w-[420px] p-10 z-10 flex flex-col gap-8 shadow-2xl animate-fade-in">
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center mb-2 w-[56px] h-[56px] rounded-xl border border-brand-border bg-brand-card/80 shadow-sm p-2.5">
            <CompanyLogo className="w-full h-full" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Logixmart</h1>
          <p className="text-xs text-text-muted">Developer Console Gateway</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-accent-danger/10 text-accent-danger border border-accent-danger/20 p-3 rounded-md text-xs font-medium flex items-center gap-2 animate-[shake_0.4s_ease_forwards]">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-text-muted pointer-events-none" size={16} />
              <input
                type="email"
                placeholder="developer@logixmart.com"
                className="w-full py-2.5 pl-10 pr-10 bg-brand-dark/60 border border-brand-border rounded-md text-text-primary text-[13px] outline-none transition-all duration-200 focus:border-accent-primary focus:bg-brand-dark/90 focus:ring-2 focus:ring-accent-primary-glow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Access Passcode</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-text-muted pointer-events-none" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full py-2.5 pl-10 pr-10 bg-brand-dark/60 border border-brand-border rounded-md text-text-primary text-[13px] outline-none transition-all duration-200 focus:border-accent-primary focus:bg-brand-dark/90 focus:ring-2 focus:ring-accent-primary-glow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="absolute right-3.5 bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center hover:text-text-primary transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-[12px]">
            <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
              <input type="checkbox" className="accent-accent-primary cursor-pointer w-3.5 h-3.5" checked={keepActive} onChange={(e) => { setKeepActive(e.target.checked); keepActivePreference = e.target.checked; }} />
              Keep terminal session active
            </label>
            <a 
              href="#forgot" 
              className="text-accent-primary font-medium hover:text-accent-primary-hover transition-colors duration-200" 
              onClick={(e) => { e.preventDefault(); alert("Contact system administrator to reset credentials (HQ support)."); }}
            >
              Forgot Code?
            </a>
          </div>

          <button 
            type="submit" 
            className="bg-accent-primary text-white border-none py-3 rounded-md font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-primary/25 disabled:opacity-70 disabled:cursor-not-allowed mt-2" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
