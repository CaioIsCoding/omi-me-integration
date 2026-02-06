"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoriesResource = void 0;
class MemoriesResource {
    constructor(client) {
        this.client = client;
    }
    async getMemories(params) {
        const result = await this.client.getMemories(params);
        return {
            memories: result.data,
            total: result.total,
        };
    }
    async getMemory(id) {
        return this.client.getMemory(id);
    }
    async createMemory(request) {
        return this.client.createMemory(request);
    }
    async searchMemories(query) {
        const result = await this.client.getMemories({ limit: 50 });
        // Simple client-side search - for large datasets, use API search if available
        const lowerQuery = query.toLowerCase();
        return result.data.filter((memory) => memory.content.toLowerCase().includes(lowerQuery) ||
            memory.type?.toLowerCase().includes(lowerQuery));
    }
    async getMemoriesByType(type, params) {
        const result = await this.client.getMemories(params);
        return result.data.filter((memory) => memory.type === type);
    }
    async updateMemory(id, data) {
        return this.client.updateMemory(id, data);
    }
    async deleteMemory(id) {
        return this.client.deleteMemory(id);
    }
}
exports.MemoriesResource = MemoriesResource;
//# sourceMappingURL=memories.js.map