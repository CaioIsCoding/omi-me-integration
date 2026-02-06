import { OmiClient, OmiMemory, CreateMemoryRequest, ListParams } from './client';

export class MemoriesResource {
  constructor(private client: OmiClient) {}

  async getMemories(params?: ListParams): Promise<{ memories: OmiMemory[]; total: number }> {
    const result = await this.client.getMemories(params);
    return {
      memories: result.data,
      total: result.total,
    };
  }

  async getMemory(id: string): Promise<OmiMemory> {
    return this.client.getMemory(id);
  }

  async createMemory(request: CreateMemoryRequest): Promise<OmiMemory> {
    return this.client.createMemory(request);
  }

  async searchMemories(query: string): Promise<OmiMemory[]> {
    const result = await this.client.getMemories({ limit: 50 });
    // Simple client-side search - for large datasets, use API search if available
    const lowerQuery = query.toLowerCase();
    return result.data.filter(
      (memory) =>
        memory.content.toLowerCase().includes(lowerQuery) ||
        memory.type?.toLowerCase().includes(lowerQuery)
    );
  }

  async getMemoriesByType(type: string, params?: ListParams): Promise<OmiMemory[]> {
    const result = await this.client.getMemories(params);
    return result.data.filter((memory) => memory.type === type);
  }

  async updateMemory(
    id: string,
    data: Partial<CreateMemoryRequest>
  ): Promise<OmiMemory> {
    return this.client.updateMemory(id, data);
  }

  async deleteMemory(id: string): Promise<void> {
    return this.client.deleteMemory(id);
  }
}
