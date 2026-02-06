import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Omi.me API Types
export interface OmiMemory {
  id: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface OmiActionItem {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled';
  due_date?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface OmiConversation {
  id: string;
  title?: string;
  participants: string[];
  messages: OmiMessage[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface OmiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Request/Response Types
export interface CreateMemoryRequest {
  content: string;
  type?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateActionItemRequest {
  title: string;
  description?: string;
  due_date?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateConversationRequest {
  title?: string;
  participants: string[];
  initial_message?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateMessageRequest {
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ListParams {
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
}

// Client Configuration
export interface OmiClientConfig {
  apiUrl?: string;
  apiToken: string;
  rateLimitRequests?: number;
  rateLimitWindow?: number;
}

export class OmiClient {
  private client: AxiosInstance;
  private rateLimitRemaining: number = 100;
  private rateLimitReset: number = 0;

  constructor(config: OmiClientConfig) {
    this.client = axios.create({
      baseURL: config.apiUrl || 'https://api.omi.me/v1',
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const now = Date.now();
        if (this.rateLimitRemaining <= 0 && this.rateLimitReset > now) {
          const waitTime = this.rateLimitReset - now;
          console.log(`Rate limit reached. Waiting ${waitTime}ms before retry.`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Update rate limit info from headers
        this.rateLimitRemaining = parseInt(
          response.headers['x-ratelimit-remaining'] || '100',
          10
        );
        this.rateLimitReset = parseInt(
          response.headers['x-ratelimit-reset'] || '0',
          10
        );
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          const headers = error.response.headers;

          // Update rate limit info from error response
          if (headers['x-ratelimit-remaining']) {
            this.rateLimitRemaining = parseInt(
              headers['x-ratelimit-remaining'] as string,
              10
            );
          }
          if (headers['x-ratelimit-reset']) {
            this.rateLimitReset = parseInt(
              headers['x-ratelimit-reset'] as string,
              10
            );
          }

          // Handle specific error codes
          switch (status) {
            case 401:
              throw new Error('Unauthorized: Invalid API token');
            case 403:
              throw new Error('Forbidden: Insufficient permissions');
            case 429:
              const retryAfter = parseInt(
                headers['retry-after'] as string || '60',
                10
              );
              console.log(`Rate limited. Retry after ${retryAfter}s`);
              throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
            case 500:
              throw new Error('Internal server error');
            default:
              throw new Error(`API error: ${status}`);
          }
        }
        throw error;
      }
    );
  }

  // Memories
  async getMemories(params?: ListParams): Promise<{ data: OmiMemory[]; total: number }> {
    const response = await this.client.get('/user/memories', { params });
    // API returns array directly, not wrapped
    const data = Array.isArray(response.data) ? response.data : response.data.data || [];
    return { data, total: data.length };
  }

  async getMemory(id: string): Promise<OmiMemory> {
    const response = await this.client.get(`/user/memories/${id}`);
    return response.data;
  }

  async createMemory(data: CreateMemoryRequest): Promise<OmiMemory> {
    const response = await this.client.post('/user/memories', data);
    return response.data;
  }

  async updateMemory(id: string, data: Partial<CreateMemoryRequest>): Promise<OmiMemory> {
    const response = await this.client.patch(`/user/memories/${id}`, data);
    return response.data;
  }

  async deleteMemory(id: string): Promise<void> {
    await this.client.delete(`/user/memories/${id}`);
  }

  // Action Items
  async getActionItems(params?: ListParams): Promise<{ data: OmiActionItem[]; total: number }> {
    const response = await this.client.get('/user/action-items', { params });
    const data = Array.isArray(response.data) ? response.data : response.data.data || [];
    return { data, total: data.length };
  }

  async getActionItem(id: string): Promise<OmiActionItem> {
    const response = await this.client.get(`/user/action-items/${id}`);
    return response.data;
  }

  async createActionItem(data: CreateActionItemRequest): Promise<OmiActionItem> {
    const response = await this.client.post('/user/action-items', data);
    return response.data;
  }

  async updateActionItem(id: string, data: Partial<CreateActionItemRequest>): Promise<OmiActionItem> {
    const response = await this.client.patch(`/user/action-items/${id}`, data);
    return response.data;
  }

  async deleteActionItem(id: string): Promise<void> {
    await this.client.delete(`/user/action-items/${id}`);
  }

  // Conversations
  async getConversations(params?: ListParams): Promise<{ data: OmiConversation[]; total: number }> {
    const response = await this.client.get('/user/conversations', { params });
    const data = Array.isArray(response.data) ? response.data : response.data.data || [];
    return { data, total: data.length };
  }

  async getConversation(id: string): Promise<OmiConversation> {
    const response = await this.client.get(`/user/conversations/${id}`);
    return response.data;
  }

  async createConversation(data: CreateConversationRequest): Promise<OmiConversation> {
    const response = await this.client.post('/user/conversations', data);
    return response.data;
  }

  async deleteConversation(id: string): Promise<void> {
    await this.client.delete(`/user/conversations/${id}`);
  }

  // Messages
  async createMessage(data: CreateMessageRequest): Promise<OmiMessage> {
    const response = await this.client.post('/messages', data);
    return response.data;
  }

  getRateLimitStatus(): { remaining: number; resetAt: number } {
    return {
      remaining: this.rateLimitRemaining,
      resetAt: this.rateLimitReset,
    };
  }
}
