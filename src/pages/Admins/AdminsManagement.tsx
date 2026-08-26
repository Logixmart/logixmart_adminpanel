import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import {
  createAdmin,
  deleteAdmin,
  listAdmins,
  updateAdmin,
  type ManagedAdmin,
} from '../../api/admins';
import { roleLabel } from '../../utils/auth';

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

const emptyForm = {
  name: '',
  email: '',
  password: '',
};

export default function AdminsManagement() {
  const [admins, setAdmins] = useState<ManagedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedAdmin | null>(null);
  const [selected, setSelected] = useState<ManagedAdmin | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listAdmins();
      setAdmins(data);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        axiosErr.response?.data?.message ||
          'Failed to load admins. Super admin access required.'
      );
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setShowPassword(false);
    setIsFormOpen(true);
  };

  const openEdit = (admin: ManagedAdmin) => {
    setEditing(admin);
    setForm({
      name: admin.name,
      email: admin.email,
      password: '',
    });
    setFormError(null);
    setShowPassword(false);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name || !email) {
      setFormError('Name and email are required.');
      return;
    }

    if (!editing && password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    if (editing && password && password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await updateAdmin(editing.id, {
          name,
          email,
          ...(password ? { password } : {}),
        });
        showSuccess('Admin updated successfully.');
      } else {
        await createAdmin({ name, email, password });
        showSuccess('Admin created successfully.');
      }
      setIsFormOpen(false);
      loadAdmins();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFormError(
        axiosErr.response?.data?.message ||
          axiosErr.message ||
          'Failed to save admin.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await deleteAdmin(selected.id);
      setIsDeleteOpen(false);
      setSelected(null);
      showSuccess('Admin deleted successfully.');
      loadAdmins();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
      };
      setError(axiosErr.response?.data?.message || 'Failed to delete admin.');
      setIsDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Users size={20} className="text-accent-primary" />
            Admin Accounts
          </h2>
          <p className="text-xs text-text-muted">
            Create and manage admin accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent-primary text-white text-xs font-semibold hover:bg-accent-primary-hover transition-colors"
        >
          <Plus size={16} />
          Add Admin
        </button>
      </div>

      {successBanner && (
        <div className="bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20 py-3 px-4 rounded-md text-xs font-semibold text-center">
          {successBanner}
        </div>
      )}

      {error && (
        <div className="bg-accent-danger/10 text-accent-danger border border-accent-danger/20 p-3 rounded-md text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-brand-card/50 border border-brand-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-text-muted text-sm">
            <Loader2 size={18} className="animate-spin" />
            Loading admins...
          </div>
        ) : admins.length === 0 ? (
          <div className="py-16 text-center text-text-muted text-sm">
            No admins found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-border text-[11px] uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b border-brand-border/60 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 text-sm text-text-primary font-medium">
                      {admin.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {admin.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border ${
                          admin.role === 'SUPER_ADMIN'
                            ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20'
                            : 'bg-brand-dark/60 text-text-secondary border-brand-border'
                        }`}
                      >
                        <Shield size={12} />
                        {roleLabel(admin.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {formatDate(admin.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {formatDate(admin.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(admin)}
                          className="p-2 rounded-md border border-brand-border text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        {admin.role !== 'SUPER_ADMIN' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(admin);
                              setIsDeleteOpen(true);
                            }}
                            className="p-2 rounded-md border border-accent-danger/20 text-accent-danger hover:bg-accent-danger/10"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => !saving && setIsFormOpen(false)}
        title={editing ? 'Edit Admin' : 'Add Admin'}
      >
        <div className="flex flex-col gap-4">
          {formError && (
            <div className="bg-accent-danger/10 text-accent-danger border border-accent-danger/20 p-3 rounded-md text-xs font-medium flex items-center gap-2">
              <AlertCircle size={14} />
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full py-2.5 px-3 bg-brand-dark/60 border border-brand-border rounded-md text-text-primary text-[13px] outline-none focus:border-accent-primary"
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full py-2.5 px-3 bg-brand-dark/60 border border-brand-border rounded-md text-text-primary text-[13px] outline-none focus:border-accent-primary"
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              {editing ? 'New Password (optional)' : 'Password'}
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className="w-full py-2.5 pl-3 pr-10 bg-brand-dark/60 border border-brand-border rounded-md text-text-primary text-[13px] outline-none focus:border-accent-primary"
                disabled={saving}
                placeholder={editing ? 'Leave blank to keep current' : 'Min 8 characters'}
              />
              <button
                type="button"
                className="absolute right-3 text-text-muted hover:text-text-primary"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-brand-border text-xs font-semibold text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary text-white text-xs font-semibold hover:bg-accent-primary-hover disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? 'Save Changes' : 'Create Admin'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => !deleting && setIsDeleteOpen(false)}
        title="Delete Admin"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            Delete{' '}
            <span className="text-text-primary font-semibold">
              {selected?.name}
            </span>{' '}
            ({selected?.email})? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-brand-border text-xs font-semibold text-text-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-danger text-white text-xs font-semibold disabled:opacity-60"
            >
              {deleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
