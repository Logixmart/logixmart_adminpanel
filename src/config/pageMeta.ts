export interface PageMeta {
  title: string;
  description: string;
}

export const PAGE_META: Record<string, PageMeta> = {
  'admin-details': {
    title: 'Admin Profile',
    description: 'View and update your administrator account credentials.',
  },
  admins: {
    title: 'Admin Accounts',
    description: 'Create and manage admin accounts for the portal.',
  },
  blogs: {
    title: 'Blogs Management',
    description: 'Create articles, update content, and manage blog media.',
  },
  jobs: {
    title: 'Jobs Management',
    description: 'Create and manage career openings for the company website.',
  },
  'job-applications': {
    title: 'Job Applications',
    description: 'Review candidate submissions, update status, and download resumes.',
  },
  query: {
    title: 'Query',
    description: 'Contact form submissions from the website.',
  },
  'client-reviews': {
    title: 'Client Reviews',
    description: 'Manage client testimonials shown on the company website.',
  },
  'our-work': {
    title: 'Our Work',
    description: 'Manage portfolio projects shown on the company website.',
  },
};

export function getPageMeta(activeTab: string): PageMeta {
  return (
    PAGE_META[activeTab] ?? {
      title: 'Console Gateway',
      description: 'Logixmart admin management portal.',
    }
  );
}
