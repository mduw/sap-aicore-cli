interface AxiosLikeError {
  response?: {
    status?: number;
    data?: { message?: string; error?: { message?: string } };
  };
  code?: string;
  message?: string;
}

export function formatApiError(error: unknown): string {
  if (error === null || error === undefined) {
    return 'An unexpected error occurred';
  }

  if (error instanceof Error) {
    if (error.message.includes('Could not find service credentials') ||
        error.message.includes('service binding')) {
      return 'AI Core service binding not found. Run "saic-cli setup" to configure credentials.';
    }
    return error.message;
  }

  if (typeof error === 'object') {
    const axiosErr = error as AxiosLikeError;

    if (axiosErr.code === 'ECONNREFUSED' || axiosErr.code === 'ENOTFOUND' || axiosErr.code === 'ETIMEDOUT') {
      return 'Cannot reach AI Core API. Check your connection and service URL.';
    }

    if (axiosErr.response?.status) {
      const status = axiosErr.response.status;
      const msg = axiosErr.response.data?.message || axiosErr.response.data?.error?.message || '';

      switch (status) {
        case 401:
        case 403:
          return `Authentication failed (${status}). Run "saic-cli setup" to configure credentials.`;
        case 404:
          return msg ? `Resource not found: ${msg}` : 'Resource not found';
        case 409:
          return msg || 'Conflict — resource may need to be stopped before this operation.';
        default:
          return msg || `API error (HTTP ${status})`;
      }
    }

    if (axiosErr.message) {
      return axiosErr.message;
    }
  }

  return 'An unexpected error occurred';
}
