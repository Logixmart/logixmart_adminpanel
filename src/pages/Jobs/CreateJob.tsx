import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Loader2,
} from 'lucide-react';
import {
  createJob,
  getJobById,
  updateJob,
  type JobPost,
} from '../../api/jobPost';

export interface CreateJobProps {
  mode?: 'create' | 'edit';
  jobId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyForm = {
  title: '',
  description: '',
  companyName: '',
  location: '',
  employmentType: '',
  salary: '',
  experience: '',
  skills: '',
  responsibilities: '',
  qualifications: '',
  isActive: true,
};

const inputClass =
  'w-full py-2.5 px-4 bg-brand-dark/60 border border-brand-border rounded-md text-text-primary outline-none text-xs transition-all duration-200 focus:border-accent-primary focus:bg-brand-dark/90 focus:ring-2 focus:ring-accent-primary-glow disabled:opacity-50';

const labelClass =
  'text-[10px] font-bold text-text-muted uppercase tracking-wider';

export default function CreateJob({
  mode = 'create',
  jobId = null,
  onSuccess,
  onCancel,
}: CreateJobProps) {
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(mode === 'edit');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (mode !== 'edit' || !jobId) {
      setLoadingJob(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoadingJob(true);
      setError(null);
      try {
        const job = await getJobById(jobId);
        if (cancelled) return;
        setForm(jobToForm(job));
      } catch {
        if (!cancelled) {
          setError('Failed to load job details.');
        }
      } finally {
        if (!cancelled) setLoadingJob(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [mode, jobId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.description.trim() || !form.companyName.trim()) {
      setError('Title, company name, and description are required.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      companyName: form.companyName.trim(),
      location: form.location.trim() || undefined,
      employmentType: form.employmentType.trim() || undefined,
      salary: form.salary.trim() || undefined,
      experience: form.experience.trim() || undefined,
      skills: parseList(form.skills),
      responsibilities: parseList(form.responsibilities),
      qualifications: parseList(form.qualifications),
      isActive: form.isActive,
    };

    try {
      setLoading(true);
      if (mode === 'edit' && jobId) {
        await updateJob(jobId, payload);
      } else {
        await createJob(payload);
      }
      onSuccess();
    } catch {
      setError(mode === 'edit' ? 'Failed to update job.' : 'Failed to create job.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
        <Loader2 className="animate-spin text-accent-primary" size={32} />
        <span className="text-xs text-text-muted font-medium">Loading job details...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[720px] mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer bg-transparent border border-brand-border text-text-secondary hover:text-text-primary hover:bg-brand-hover rounded-md p-2 transition-all"
          title="Back to jobs"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Briefcase size={20} className="text-accent-primary" />
            {mode === 'edit' ? 'Edit Job Post' : 'Create Job Post'}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            {mode === 'edit'
              ? 'Update role details for the careers portal.'
              : 'Publish a new opening for the careers portal.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 flex flex-col gap-5">
        {error && (
          <div className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={labelClass}>Job Title</label>
            <input
              className={inputClass}
              placeholder="e.g., Senior React Native Engineer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Company Name</label>
            <input
              className={inputClass}
              placeholder="Logixmart IT Solutions"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Location</label>
            <input
              className={inputClass}
              placeholder="Remote / Bangalore / Hybrid"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Employment Type</label>
            <select
              className={inputClass}
              value={form.employmentType}
              onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
              disabled={loading}
            >
              <option value="">Select type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Salary</label>
            <input
              className={inputClass}
              placeholder="e.g., 8–12 LPA"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Experience</label>
            <input
              className={inputClass}
              placeholder="e.g., 2–4 years"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={labelClass}>Job Description</label>
            <textarea
              className={`${inputClass} resize-none min-h-[100px]`}
              placeholder="Short overview of the role..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={loading}
              rows={4}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={labelClass}>Responsibilities</label>
            <textarea
              className={`${inputClass} resize-none min-h-[100px]`}
              placeholder={"One per line, e.g.\nBuild and ship product features\nCollaborate with design and QA"}
              value={form.responsibilities}
              onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
              disabled={loading}
              rows={4}
            />
            <span className="text-[10px] text-text-muted">One item per line (or comma-separated)</span>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={labelClass}>Skills</label>
            <input
              className={inputClass}
              placeholder="React, TypeScript, Node.js"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              disabled={loading}
            />
            <span className="text-[10px] text-text-muted">Comma-separated skill tags</span>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={labelClass}>Qualifications</label>
            <textarea
              className={`${inputClass} resize-none min-h-[100px]`}
              placeholder={"One per line, e.g.\nBachelor's degree in CS or related field\n2+ years of React experience"}
              value={form.qualifications}
              onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
              disabled={loading}
              rows={4}
            />
            <span className="text-[10px] text-text-muted">One item per line (or comma-separated)</span>
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-xs text-text-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            className="accent-accent-primary w-3.5 h-3.5 cursor-pointer"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            disabled={loading}
          />
          Mark this job as active / publicly listed
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 cursor-pointer font-semibold py-2.5 border-none rounded-lg text-xs bg-accent-primary text-white hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                {mode === 'edit' ? 'Saving...' : 'Creating...'}
              </>
            ) : mode === 'edit' ? (
              'Save Changes'
            ) : (
              'Create Job'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 cursor-pointer font-semibold py-2.5 rounded-lg text-xs bg-brand-border border border-brand-border text-text-secondary hover:bg-brand-border-hover hover:text-text-primary transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function parseList(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function jobToForm(job: JobPost) {
  return {
    title: job.title || '',
    description: job.description || '',
    companyName: job.companyName || '',
    location: job.location || '',
    employmentType: job.employmentType || '',
    salary: job.salary || '',
    experience: job.experience || '',
    skills: (job.skills || []).join(', '),
    responsibilities: (job.responsibilities || []).join('\n'),
    qualifications: (job.qualifications || []).join('\n'),
    isActive: job.isActive,
  };
}
