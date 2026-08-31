export const QUERY_PAGE_SIZE = 20;

export const QUERY_TABLE_HEADERS = [
  'Name',
  'Email',
  'Phone',
  'Subject',
  'Message',
  'Date',
  'Actions',
] as const;

export function buildExportFilename(prefix = 'queries') {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${prefix}-${stamp}.xlsx`;
}
