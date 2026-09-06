const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let inMemoryAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('kanban_refresh_token');
}

export function setRefreshToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('kanban_refresh_token', token);
  } else {
    localStorage.removeItem('kanban_refresh_token');
  }
}

export function clearTokens() {
  inMemoryAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('kanban_refresh_token');
  }
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth && inMemoryAccessToken) {
    headers['Authorization'] = `Bearer ${inMemoryAccessToken}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response = await fetch(url, {
    ...restOptions,
    headers,
  });

  // Handle token refresh on 401 Unauthorized
  if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setAccessToken(data.accessToken);
          if (data.refreshToken) {
            setRefreshToken(data.refreshToken);
          }

          // Retry original request with new access token
          headers['Authorization'] = `Bearer ${data.accessToken}`;
          response = await fetch(url, {
            ...restOptions,
            headers,
          });
        } else {
          clearTokens();
        }
      } catch {
        clearTokens();
      }
    } else {
      clearTokens();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message || response.statusText || 'An error occurred';
    throw new Error(message);
  }

  return response.json();
}
