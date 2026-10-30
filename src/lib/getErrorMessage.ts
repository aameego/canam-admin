export const getErrorMessage = (err: unknown, fallback: string): string => {
  const anyErr = err as {
    response?: { data?: { message?: unknown; error?: unknown } };
    message?: unknown;
  } | null;

  const fromServer = anyErr?.response?.data?.message ?? anyErr?.response?.data?.error;
  if (typeof fromServer === 'string' && fromServer.trim()) return fromServer;

  const axiosMessage = anyErr?.message;
  if (typeof axiosMessage === 'string' && axiosMessage.trim()) {
    if (/network error|timeout/i.test(axiosMessage)) {
      return 'Network error. Please check your connection and try again.';
    }
    return axiosMessage;
  }

  return fallback;
};
