/**
 * Parse generic SDK parameters from CLI args.
 * Supports --query, --headers, --body as JSON strings.
 * --resource-group is a shorthand that merges into headers as AI-Resource-Group.
 */
export function parseSdkParams(args: Record<string, any>): {
  query: any;
  headers: any;
  body: any;
} {
  const query = args.query ? JSON.parse(args.query as string) : {};
  const body = args.body ? JSON.parse(args.body as string) : {};

  // Build headers: start with --headers JSON, then merge --resource-group shorthand
  const headers: Record<string, any> = args.headers ? JSON.parse(args.headers as string) : {};
  if (args.resourceGroup && !headers['AI-Resource-Group']) {
    headers['AI-Resource-Group'] = args.resourceGroup as string;
  }

  return { query, headers, body };
}
