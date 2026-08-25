import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ExternalLink, FileText, Loader2 } from 'lucide-react';
import {
  getJobApplicationById,
  resolveResumeUrl,
  updateJobApplicationStatus,
  type JobApplication,
  type JobApplicationStatus,
} from '../../api/jobApplication';

const STATUS_OPTIONS: { value: JobApplicationStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'REVIEWING', label: 'Reviewing' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'SELECTED', label: 'Selected' },
  { value: 'REJECTED', label: 'Rejected' },
];

export interface JobApplicationDetailsProps {
  applicationId: string;
  onBack: (shouldRefresh: boolean) => void;
}

export default function JobApplicationDetails({
  applicationId,
  onBack,
}: JobApplicationDetailsProps) {
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [status, setStatus] = useState<JobApplicationStatus>('PENDING');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getJobApplicationById(applicationId);
      setApplication(data);
      setStatus(data.status);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to load application details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!application) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateJobApplicationStatus(application.id, status);
      setApplication(updated);
      setStatus(updated.status);
      setSuccess('Application status updated successfully.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  const resumeHref = resolveResumeUrl(application?.resumeUrl);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-accent-primary" size={32} />
        <span className="text-xs text-text-muted font-medium">Loading application...</span>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => onBack(false)}
          className="self-start cursor-pointer text-xs text-text-secondary flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="glass-panel p-6 text-accent-danger text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          {error || 'Application not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[720px] animate-fade-in">
      <button
        type="button"
        onClick={() => onBack(true)}
        className="self-start cursor-pointer text-xs text-text-secondary hover:text-text-primary flex items-center gap-2 bg-transparent border-none"
      >
        <ArrowLeft size={14} /> Back to applications
      </button>

      <div>
        <h1 className="text-xl font-bold text-text-primary tracking-tight">
          Job Application Details
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Review candidate information and update hiring status.
        </p>
      </div>

      {error && (
        <div className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20 py-3 px-4 rounded-md text-xs font-semibold">
          {success}
        </div>
      )}

      <section className="glass-panel p-5 flex flex-col gap-3">
        <h2 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
          Applicant Information
        </h2>
        <DetailRow label="Name" value={application.applicantName} />
        <DetailRow label="Email" value={application.email} />
        <DetailRow label="Phone" value={application.phone || '—'} />
      </section>

      <section className="glass-panel p-5 flex flex-col gap-3">
        <h2 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
          Job Information
        </h2>
        <DetailRow label="Job Title" value={application.job?.title || '—'} />
        <DetailRow label="Location" value={application.job?.location || '—'} />
      </section>

      <section className="glass-panel p-5 flex flex-col gap-3">
        <h2 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
          Application
        </h2>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Cover Letter
          </span>
          <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
            {application.coverLetter || '—'}
          </p>
        </div>
        <DetailRow
          label="Portfolio"
          value={application.portfolioUrl || '—'}
          href={application.portfolioUrl || undefined}
        />
        <DetailRow
          label="LinkedIn"
          value={application.linkedinUrl || '—'}
          href={application.linkedinUrl || undefined}
        />
        {resumeHref ? (
          <a
            href={resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start mt-1 cursor-pointer font-semibold text-[11px] py-2 px-3 rounded-md bg-accent-primary text-white flex items-center gap-1.5 no-underline"
          >
            <FileText size={13} /> View Resume <ExternalLink size={12} />
          </a>
        ) : (
          <p className="text-xs text-text-muted">No resume uploaded.</p>
        )}
      </section>

      <section className="glass-panel p-5 flex flex-col gap-3">
        <h2 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Status</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as JobApplicationStatus)}
          className="bg-brand-dark/60 border border-brand-border rounded-md py-2.5 px-3 text-xs text-text-primary outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleUpdateStatus}
          disabled={saving || status === application.status}
          className="self-start cursor-pointer font-semibold text-xs py-2.5 px-4 rounded-lg bg-accent-primary text-white border-none hover:bg-accent-primary-hover disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={14} /> Updating...
            </>
          ) : (
            'Update Status'
          )}
        </button>
      </section>
    </div>
  );
}

function DetailRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent-primary hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <span className="text-xs text-text-primary break-all">{value}</span>
      )}
    </div>
  );
}
