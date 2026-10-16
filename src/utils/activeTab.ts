const STORAGE_KEY = 'logixmart_active_tab';

const VALID_TABS = new Set([
  'admin-details',
  'admins',
  'blogs',
  'jobs',
  'job-applications',
  'query',
  'client-reviews',
  'our-work',
]);

const DEFAULT_TAB = 'admin-details';

function normalizeTab(value: string | null | undefined): string | null {
  if (!value) return null;
  const tab = value.replace(/^#\/?/, '').trim();
  return VALID_TABS.has(tab) ? tab : null;
}

export function getInitialActiveTab(): string {
  return (
    normalizeTab(window.location.hash) ||
    normalizeTab(sessionStorage.getItem(STORAGE_KEY)) ||
    DEFAULT_TAB
  );
}

export function persistActiveTab(tab: string): void {
  if (!VALID_TABS.has(tab)) return;
  sessionStorage.setItem(STORAGE_KEY, tab);
  const hash = `#/${tab}`;
  if (window.location.hash !== hash) {
    window.history.replaceState(null, '', hash);
  }
}

export function clearActiveTab(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  if (window.location.hash) {
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    );
  }
}
