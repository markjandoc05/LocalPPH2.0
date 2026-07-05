export interface FriendlyError {
  message: string;
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'SERVER_ERROR' | 'UNKNOWN';
  status?: number;
}

export function parseError(err: any): FriendlyError {
  const status = err?.status || err?.statusCode;
  const message = err?.message || String(err);

  // Detect 401 / Unauthorized
  if (
    status === 401 ||
    message.toLowerCase().includes('unauthorized') ||
    message.toLowerCase().includes('unauthenticated') ||
    message.toLowerCase().includes('please log in') ||
    message.toLowerCase().includes('not logged in')
  ) {
    return {
      message: "Please log in to continue.",
      code: 'UNAUTHORIZED',
      status: 401,
    };
  }

  // Detect 403 / Forbidden / Access Denied
  if (
    status === 403 ||
    message.toLowerCase().includes('access denied') ||
    message.toLowerCase().includes('permission') ||
    message.toLowerCase().includes('forbidden')
  ) {
    return {
      message: "You don't have permission to perform this action.",
      code: 'FORBIDDEN',
      status: 403,
    };
  }

  // Default server error
  return {
    message: "Something went wrong. Please try again later.",
    code: 'SERVER_ERROR',
    status: status || 500,
  };
}

export function handleAuthRedirect(error: FriendlyError, router: any) {
  if (error.code === 'UNAUTHORIZED') {
    router.push('/auth/login');
  }
}
