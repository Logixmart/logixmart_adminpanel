import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Edit3, Shield, Mail, User } from 'lucide-react';
import AdminsManagement from './Admins/AdminsManagement';

interface AdminInfo {
  name: string;
  email: string;
  password: string;
  role: string;
  lastLogin: string;
}

interface AdminDetailsProps {
  adminInfo: AdminInfo;
  onUpdateAdmin: (updated: Partial<AdminInfo>) => void;
  canManageAdmins?: boolean;
}

export const AdminDetails: React.FC<AdminDetailsProps> = ({
  adminInfo,
  onUpdateAdmin,
  canManageAdmins = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(adminInfo.name);
  const [email, setEmail] = useState(adminInfo.email);
  const [password, setPassword] = useState(adminInfo.password);
  const [editShowPassword, setEditShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setName(adminInfo.name);
    setEmail(adminInfo.email);
    setPassword(adminInfo.password);
  }, [adminInfo.name, adminInfo.email, adminInfo.password]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    onUpdateAdmin({ name, email, password });
    setIsEditing(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const getInitials = (fullName: string) => {
    return fullName.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      <div className="flex flex-col gap-6 w-full max-w-[600px]">
        {showSuccess && (
          <div className="bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20 py-3 px-4 rounded-md text-xs font-semibold text-center">
            Administrator terminal credentials updated successfully!
          </div>
        )}

        <div className="glass-panel p-8 flex flex-col gap-6">
          <div className="flex items-center gap-6 pb-6 border-b border-brand-border">
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-accent-primary to-accent-danger flex items-center justify-center font-extrabold text-[28px] text-white shadow-xl shadow-accent-primary/10 border-2 border-brand-border">
              {getInitials(adminInfo.name)}
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-text-primary tracking-tight">{adminInfo.name}</span>
              <span className="text-xs text-accent-primary font-semibold flex items-center gap-1 mt-0.5">
                <Shield size={14} /> {adminInfo.role}
              </span>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  className="w-full py-2.5 px-4 bg-brand-dark/60 border border-brand-border rounded-md text-text-primary outline-none text-[13.5px] transition-all duration-200 focus:border-accent-primary focus:bg-brand-dark/90 focus:ring-2 focus:ring-accent-primary-glow"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  className="w-full py-2.5 px-4 bg-brand-dark/60 border border-brand-border rounded-md text-text-primary outline-none text-[13.5px] transition-all duration-200 focus:border-accent-primary focus:bg-brand-dark/90 focus:ring-2 focus:ring-accent-primary-glow"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Access Passcode</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={editShowPassword ? 'text' : 'password'}
                    className="w-full py-2.5 px-4 bg-brand-dark/60 border border-brand-border rounded-md text-text-primary outline-none text-[13.5px] transition-all duration-200 focus:border-accent-primary focus:bg-brand-dark/90 focus:ring-2 focus:ring-accent-primary-glow"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setEditShowPassword(!editShowPassword)}
                    className="absolute right-3.5 bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center hover:text-text-primary transition-colors duration-200"
                  >
                    {editShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 border-none rounded-md font-semibold cursor-pointer text-center text-sm transition-all duration-200 bg-accent-primary text-white hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-primary/25"
                >
                  Save Profile Updates
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setName(adminInfo.name);
                    setEmail(adminInfo.email);
                    setPassword(adminInfo.password);
                    setIsEditing(false);
                  }}
                  className="flex-1 py-2.5 rounded-md font-semibold cursor-pointer text-center text-sm transition-all duration-200 bg-brand-border border border-brand-border text-text-secondary hover:bg-brand-border-hover hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5 relative">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Operator ID (Full Name)</span>
                <div className="flex items-center justify-between bg-brand-dark/40 border border-brand-border rounded-md px-4 py-3 min-h-[46px] text-[13.5px]">
                  <span className="text-text-primary font-medium break-all">{adminInfo.name}</span>
                  <User size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">System Email Address</span>
                <div className="flex items-center justify-between bg-brand-dark/40 border border-brand-border rounded-md px-4 py-3 min-h-[46px] text-[13.5px]">
                  <span className="text-text-primary font-medium break-all">{adminInfo.email}</span>
                  <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Security Passcode (Password)</span>
                <div className="flex items-center justify-between bg-brand-dark/40 border border-brand-border rounded-md px-4 py-3 min-h-[46px] text-[13.5px]">
                  <span className="text-text-primary font-medium break-all font-mono tracking-widest">
                    {showPassword ? adminInfo.password : '••••••••••••'}
                  </span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center hover:text-text-primary transition-colors duration-200"
                    title={showPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="flex flex-col gap-1.5 relative">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Session Established</span>
                  <div className="flex items-center justify-between bg-brand-dark/40 border border-brand-border rounded-md px-4 py-3 min-h-[46px] text-[13.5px]">
                    <span className="text-text-primary font-medium break-all text-xs">{adminInfo.lastLogin}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="py-2.5 rounded-md font-semibold cursor-pointer text-center text-sm transition-all duration-200 bg-brand-border border border-brand-border text-text-secondary hover:bg-brand-border-hover hover:text-text-primary flex items-center justify-center gap-2 mt-4"
              >
                <Edit3 size={16} /> Update Administrator Details
              </button>
            </div>
          )}
        </div>
      </div>

      {canManageAdmins && (
        <div className="border-t border-brand-border pt-8">
          <AdminsManagement />
        </div>
      )}
    </div>
  );
};
export default AdminDetails;
