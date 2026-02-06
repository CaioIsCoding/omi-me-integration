"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmiClient = void 0;
const axios_1 = __importDefault(require("axios"));
class OmiClient {
    constructor(config) {
        this.rateLimitRemaining = 100;
        this.rateLimitReset = 0;
        this.client = axios_1.default.create({
            baseURL: config.apiUrl || 'https://api.omi.me/v1',
            timeout: 30000,
            headers: {
                'Authorization': `Bearer ${config.apiToken}`,
                'Content-Type': 'application/json',
            },
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use((config) => {
            const now = Date.now();
            if (this.rateLimitRemaining <= 0 && this.rateLimitReset > now) {
                const waitTime = this.rateLimitReset - now;
                console.log(`Rate limit reached. Waiting ${waitTime}ms before retry.`);
            }
            return config;
        }, (error) => Promise.reject(error));
        // Response interceptor
        this.client.interceptors.response.use((response) => {
            // Update rate limit info from headers
            this.rateLimitRemaining = parseInt(response.headers['x-ratelimit-remaining'] || '100', 10);
            this.rateLimitReset = parseInt(response.headers['x-ratelimit-reset'] || '0', 10);
            return response;
        }, (error) => {
            if (error.response) {
                const status = error.response.status;
                const headers = error.response.headers;
                // Update rate limit info from error response
                if (headers['x-ratelimit-remaining']) {
                    this.rateLimitRemaining = parseInt(headers['x-ratelimit-remaining'], 10);
                }
                if (headers['x-ratelimit-reset']) {
                    this.rateLimitReset = parseInt(headers['x-ratelimit-reset'], 10);
                }
                // Handle specific error codes
                switch (status) {
                    case 401:
                        throw new Error('Unauthorized: Invalid API token');
                    case 403:
                        throw new Error('Forbidden: Insufficient permissions');
                    case 429:
                        const retryAfter = parseInt(headers['retry-after'] || '60', 10);
                        console.log(`Rate limited. Retry after ${retryAfter}s`);
                        throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
                    case 500:
                        throw new Error('Internal server error');
                    default:
                        throw new Error(`API error: ${status}`);
                }
            }
            throw error;
        });
    }
    // Memories
    async getMemories(params) {
        const response = await this.client.get('/user/memories', { params });
        // API returns array directly, not wrapped
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        return { data, total: data.length };
    }
    async getMemory(id) {
        const response = await this.client.get(`/user/memories/${id}`);
        return response.data;
    }
    async createMemory(data) {
        const response = await this.client.post('/user/memories', data);
        return response.data;
    }
    async updateMemory(id, data) {
        const response = await this.client.patch(`/user/memories/${id}`, data);
        return response.data;
    }
    async deleteMemory(id) {
        await this.client.delete(`/user/memories/${id}`);
    }
    // Action Items
    async getActionItems(params) {
        const response = await this.client.get('/user/action-items', { params });
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        return { data, total: data.length };
    }
    async getActionItem(id) {
        const response = await this.client.get(`/user/action-items/${id}`);
        return response.data;
    }
    async createActionItem(data) {
        const response = await this.client.post('/user/action-items', data);
        return response.data;
    }
    async updateActionItem(id, data) {
        const response = await this.client.patch(`/user/action-items/${id}`, data);
        return response.data;
    }
    async deleteActionItem(id) {
        await this.client.delete(`/user/action-items/${id}`);
    }
    // Conversations
    async getConversations(params) {
        const response = await this.client.get('/user/conversations', { params });
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        return { data, total: data.length };
    }
    async getConversation(id) {
        const response = await this.client.get(`/user/conversations/${id}`);
        return response.data;
    }
    async createConversation(data) {
        const response = await this.client.post('/user/conversations', data);
        return response.data;
    }
    async deleteConversation(id) {
        await this.client.delete(`/user/conversations/${id}`);
    }
    // Messages
    async createMessage(data) {
        const response = await this.client.post('/messages', data);
        return response.data;
    }
    getRateLimitStatus() {
        return {
            remaining: this.rateLimitRemaining,
            resetAt: this.rateLimitReset,
        };
    }
}
exports.OmiClient = OmiClient;
//# sourceMappingURL=client.js.map