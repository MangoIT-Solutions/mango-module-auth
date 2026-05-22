interface FrontendEnv {
  NEXT_PUBLIC_API_URL?: string;
}

const getApiBaseUrl = () => {
  const configuredBaseUrl =
    (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_API_URL : undefined) ||
    (typeof import.meta !== 'undefined' ? ((import.meta as any).env as FrontendEnv | undefined)?.NEXT_PUBLIC_API_URL : undefined);

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '');
  }

  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

class ApiClient {
  constructor(private baseUrl: string) {}

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { body, headers: customHeaders, ...rest } = options;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(customHeaders as Record<string, string>),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data: ApiResponse<T> = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
