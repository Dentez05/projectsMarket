const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// auth-эндпоинты: на их 401 рефреш и ретрай не запускаем
const AUTH_PATHS = ['/Auth/login', '/Auth/register', '/Auth/refresh', '/Auth/logout'];

function isAuthPath(url: string): boolean {
  return AUTH_PATHS.some(p => url.includes(p));
}

// Single-flight: параллельные 401 делят один рефреш
let refreshPromise: Promise<boolean> | null = null;

export function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/Auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) return false;
        const data = await res.json().catch(() => null);
        if (!data?.token) return false;
        localStorage.setItem('token', data.token);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

// fetch с Bearer-токеном: при 401 один раз пробует обновить сессию и повторить запрос
export async function fetchWithAuth(url: string, init: RequestInit = {}): Promise<Response> {
  const doFetch = (): Promise<Response> => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      ...((init.headers as Record<string, string>) || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, { ...init, headers, credentials: 'include' });
  };

  let response = await doFetch();

  if (response.status === 401 && !isAuthPath(url)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await doFetch();
    }
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
  }

  return response;
}

class ApiClient {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetchWithAuth(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '' }));
      if (response.status === 401 && !isAuthPath(path)) {
        throw new Error('Сессия истекла — войдите в систему заново');
      }
      throw new Error(error.message || (response.status >= 500 ? 'Ошибка сервера' : `Ошибка запроса (${response.status})`));
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  async upload(path: string, file: File, queryParams?: Record<string, string>): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const params = queryParams ? '?' + new URLSearchParams(queryParams).toString() : '';
    const response = await fetchWithAuth(`${BASE_URL}${path}${params}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '' }));
      if (response.status === 401) {
        throw new Error('Сессия истекла — войдите в систему заново');
      }
      throw new Error(error.message || 'Ошибка загрузки');
    }
    return response.json();
  }
}

export const api = new ApiClient();
