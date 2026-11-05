import { Novel, User } from './types';

const TOKEN_KEY = 'novelbox_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set json content-type if body is object and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Permintaan gagal dengan status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string }): Promise<{ token: string; user: User }> {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe(): Promise<User> {
    return request('/api/auth/me');
  },

  async updateProfile(data: { name?: string; bio?: string; avatarUrl?: string; newPassword?: string }): Promise<User> {
    return request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async forgotPassword(email: string): Promise<{ message: string; email: string; verificationCode: string }> {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(data: { email: string; verificationCode: string; newPassword: string }): Promise<{ message: string }> {
    return request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Novels
  async getNovels(): Promise<Novel[]> {
    return request('/api/novels');
  },

  async createNovel(novelData: Partial<Novel>): Promise<Novel> {
    return request('/api/novels', {
      method: 'POST',
      body: JSON.stringify(novelData),
    });
  },

  async updateNovel(id: string, novelData: Partial<Novel>): Promise<Novel> {
    return request(`/api/novels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(novelData),
    });
  },

  async toggleFavorite(id: string): Promise<Novel> {
    return request(`/api/novels/${id}/favorite`, {
      method: 'POST',
    });
  },

  async deleteNovel(id: string): Promise<{ success: boolean; message: string }> {
    return request(`/api/novels/${id}`, {
      method: 'DELETE',
    });
  },

  // File Upload (PDF, EPUB, Cover Image)
  async uploadFile(file: File): Promise<{ url: string; filename: string; originalName: string; size: number; type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
