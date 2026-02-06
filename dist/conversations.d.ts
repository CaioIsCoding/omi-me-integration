import { OmiClient, OmiConversation, CreateConversationRequest, ListParams, OmiMessage, CreateMessageRequest } from './client';
export declare class ConversationsResource {
    private client;
    constructor(client: OmiClient);
    getConversations(params?: ListParams): Promise<{
        conversations: OmiConversation[];
        total: number;
    }>;
    getConversation(id: string): Promise<OmiConversation>;
    createConversation(request: CreateConversationRequest): Promise<OmiConversation>;
    getConversationMessages(conversationId: string): Promise<OmiMessage[]>;
    addMessageToConversation(request: CreateMessageRequest): Promise<OmiMessage>;
    searchConversations(query: string, params?: ListParams): Promise<OmiConversation[]>;
    deleteConversation(id: string): Promise<void>;
}
//# sourceMappingURL=conversations.d.ts.map