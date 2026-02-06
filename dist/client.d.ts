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
export interface OmiClientConfig {
    apiUrl?: string;
    apiToken: string;
    rateLimitRequests?: number;
    rateLimitWindow?: number;
}
export declare class OmiClient {
    private client;
    private rateLimitRemaining;
    private rateLimitReset;
    constructor(config: OmiClientConfig);
    private setupInterceptors;
    getMemories(params?: ListParams): Promise<{
        data: OmiMemory[];
        total: number;
    }>;
    getMemory(id: string): Promise<OmiMemory>;
    createMemory(data: CreateMemoryRequest): Promise<OmiMemory>;
    updateMemory(id: string, data: Partial<CreateMemoryRequest>): Promise<OmiMemory>;
    deleteMemory(id: string): Promise<void>;
    getActionItems(params?: ListParams): Promise<{
        data: OmiActionItem[];
        total: number;
    }>;
    getActionItem(id: string): Promise<OmiActionItem>;
    createActionItem(data: CreateActionItemRequest): Promise<OmiActionItem>;
    updateActionItem(id: string, data: Partial<CreateActionItemRequest>): Promise<OmiActionItem>;
    deleteActionItem(id: string): Promise<void>;
    getConversations(params?: ListParams): Promise<{
        data: OmiConversation[];
        total: number;
    }>;
    getConversation(id: string): Promise<OmiConversation>;
    createConversation(data: CreateConversationRequest): Promise<OmiConversation>;
    deleteConversation(id: string): Promise<void>;
    createMessage(data: CreateMessageRequest): Promise<OmiMessage>;
    getRateLimitStatus(): {
        remaining: number;
        resetAt: number;
    };
}
//# sourceMappingURL=client.d.ts.map