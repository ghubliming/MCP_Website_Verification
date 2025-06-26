import fetch from 'node-fetch';

export type VerificationStatus = 'ACCESSIBLE' | 'NOT_ACCESSIBLE' | 'TIMEOUT' | 'UNKNOWN_ERROR';

export interface VerificationResult {
  url: string;
  status: VerificationStatus;
  reason: string;
  httpStatusCode?: number;
}

export async function verifyUrl(url: string, timeout = 10000): Promise<VerificationResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal as any }); // Cast needed for compatibility
    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        url,
        status: 'ACCESSIBLE',
        reason: 'OK',
        httpStatusCode: response.status,
      };
    } else {
      return {
        url,
        status: 'NOT_ACCESSIBLE',
        reason: `${response.status} ${response.statusText}`,
        httpStatusCode: response.status,
      };
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return {
        url,
        status: 'TIMEOUT',
        reason: `Request timeout after ${timeout / 1000}s`,
      };
    }
    return {
      url,
      status: 'NOT_ACCESSIBLE',
      reason: error.message || 'An unknown error occurred',
    };
  }
} 