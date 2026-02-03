const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface ApiOptions {
  method?: string;
  body?: unknown;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('admin_token');
    }
    return this.token;
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body } = options;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Analytics
  async getAnalytics() {
    return this.request<{
      users: { total: number; thisMonth: number; thisWeek: number };
      subscriptions: { total: number; byPlan: Record<string, number>; estimatedMRR: number };
      community: { totalPosts: number; pendingPosts: number; totalComments: number };
      support: { openHelpRequests: number; totalFeedback: number };
    }>('/admin/analytics');
  }

  async getTrends(days = 30) {
    return this.request<{
      signups: { date: string; count: number }[];
      posts: { date: string; count: number }[];
    }>(`/admin/analytics/trends?days=${days}`);
  }

  // Users
  async getUsers(page = 1, limit = 50, search?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    return this.request<{
      users: Array<{
        id: string;
        email: string;
        display_name: string;
        avatar_url: string;
        is_banned: boolean;
        created_at: string;
        subscription?: { plan: string; status: string };
      }>;
      total: number;
      page: number;
      totalPages: number;
    }>(`/admin/users?${params}`);
  }

  async getUser(id: string) {
    return this.request<{
      user: {
        id: string;
        email: string;
        display_name: string;
        avatar_url: string;
        is_banned: boolean;
        created_at: string;
      };
      subscription: { plan: string; status: string; billing_cycle: string } | null;
      stats: { posts: number; comments: number; helpRequests: number };
    }>(`/admin/users/${id}`);
  }

  async banUser(id: string, reason?: string) {
    return this.request(`/admin/users/${id}/ban`, { method: 'POST', body: { reason } });
  }

  async unbanUser(id: string) {
    return this.request(`/admin/users/${id}/unban`, { method: 'POST' });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, { method: 'DELETE' });
  }

  async grantPremium(userId: string, plan: string, expiresAt?: string) {
    return this.request(`/admin/users/${userId}/grant-premium`, {
      method: 'POST',
      body: { plan, expires_at: expiresAt },
    });
  }

  // Subscriptions
  async getSubscriptions(page = 1, plan?: string, status?: string) {
    const params = new URLSearchParams({ page: String(page) });
    if (plan) params.append('plan', plan);
    if (status) params.append('status', status);
    return this.request<{
      subscriptions: Array<{
        id: string;
        user_id: string;
        plan: string;
        status: string;
        billing_cycle: string;
        current_period_end: string;
        user: { email: string; display_name: string };
      }>;
      total: number;
      page: number;
      totalPages: number;
    }>(`/admin/subscriptions?${params}`);
  }

  async cancelSubscription(id: string) {
    return this.request(`/admin/subscriptions/${id}/cancel`, { method: 'POST' });
  }

  // Community
  async getPosts(page = 1, status?: string) {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.append('status', status);
    return this.request<{
      posts: Array<{
        id: string;
        user_id: string;
        content: string;
        category: string;
        status: string;
        likes_count: number;
        comments_count: number;
        created_at: string;
        user: { display_name: string; avatar_url: string };
      }>;
      total: number;
      page: number;
      totalPages: number;
    }>(`/admin/community/posts?${params}`);
  }

  async approvePost(id: string) {
    return this.request(`/admin/community/posts/${id}/approve`, { method: 'POST' });
  }

  async flagPost(id: string, reason?: string) {
    return this.request(`/admin/community/posts/${id}/flag`, { method: 'POST', body: { reason } });
  }

  async deletePost(id: string) {
    return this.request(`/admin/community/posts/${id}`, { method: 'DELETE' });
  }

  async bulkApprovePosts(ids: string[]) {
    return this.request('/admin/community/posts/bulk-approve', { method: 'POST', body: { ids } });
  }

  async getComments(page = 1, postId?: string) {
    const params = new URLSearchParams({ page: String(page) });
    if (postId) params.append('post_id', postId);
    return this.request<{
      comments: Array<{
        id: string;
        post_id: string;
        user_id: string;
        content: string;
        created_at: string;
        user: { display_name: string };
      }>;
      total: number;
    }>(`/admin/community/comments?${params}`);
  }

  async deleteComment(id: string) {
    return this.request(`/admin/community/comments/${id}`, { method: 'DELETE' });
  }

  // Support
  async getHelpRequests(page = 1, status?: string) {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.append('status', status);
    return this.request<{
      helpRequests: Array<{
        id: string;
        user_id: string;
        subject: string;
        message: string;
        status: string;
        file_url: string | null;
        created_at: string;
        user: { email: string; display_name: string };
      }>;
      total: number;
      page: number;
      totalPages: number;
    }>(`/admin/support/help-requests?${params}`);
  }

  async updateHelpRequestStatus(id: string, status: string) {
    return this.request(`/admin/support/help-requests/${id}`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async deleteHelpRequest(id: string) {
    return this.request(`/admin/support/help-requests/${id}`, { method: 'DELETE' });
  }

  async getFeedback(page = 1) {
    return this.request<{
      feedback: Array<{
        id: string;
        user_id: string | null;
        type: string;
        message: string;
        created_at: string;
        user: { email: string; display_name: string } | null;
      }>;
      total: number;
    }>(`/admin/support/feedback?page=${page}`);
  }

  async deleteFeedback(id: string) {
    return this.request(`/admin/support/feedback/${id}`, { method: 'DELETE' });
  }

  // Feature Flags
  async getFeatureFlags() {
    return this.request<{
      flags: Array<{
        key: string;
        enabled: boolean;
        description: string | null;
        updated_at: string;
      }>;
    }>('/admin/feature-flags');
  }

  async updateFeatureFlag(key: string, enabled: boolean, description?: string) {
    return this.request(`/admin/feature-flags/${key}`, {
      method: 'PATCH',
      body: { enabled, description },
    });
  }

  async createFeatureFlag(key: string, enabled: boolean, description?: string) {
    return this.request('/admin/feature-flags', {
      method: 'POST',
      body: { key, enabled, description },
    });
  }

  async deleteFeatureFlag(key: string) {
    return this.request(`/admin/feature-flags/${key}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
