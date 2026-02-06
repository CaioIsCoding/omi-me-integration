import { OmiClient, OmiMemory, CreateMemoryRequest, ListParams } from './client';
export declare class MemoriesResource {
    private client;
    constructor(client: OmiClient);
    getMemories(params?: ListParams): Promise<{
        memories: OmiMemory[];
        total: number;
    }>;
    getMemory(id: string): Promise<OmiMemory>;
    createMemory(request: CreateMemoryRequest): Promise<OmiMemory>;
    searchMemories(query: string): Promise<OmiMemory[]>;
    getMemoriesByType(type: string, params?: ListParams): Promise<OmiMemory[]>;
    updateMemory(id: string, data: Partial<CreateMemoryRequest>): Promise<OmiMemory>;
    deleteMemory(id: string): Promise<void>;
}
//# sourceMappingURL=memories.d.ts.map