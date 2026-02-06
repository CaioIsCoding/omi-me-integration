import {
  OmiClient,
  OmiConversation,
  CreateConversationRequest,
  ListParams,
  OmiMessage,
  CreateMessageRequest,
} from './client';

export class ConversationsResource {
  constructor(private client: OmiClient) {}

  async getConversations(
    params?: ListParams
  ): Promise<{ conversations: OmiConversation[]; total: number }> {
    const result = await this.client.getConversations(params);
    return {
      conversations: result.data,
      total: result.total,
    };
  }

  async getConversation(id: string): Promise<OmiConversation> {
    return this.client.getConversation(id);
  }

  async createConversation(
    request: CreateConversationRequest
  ): Promise<OmiConversation> {
    return this.client.createConversation(request);
  }

  async getConversationMessages(
    conversationId: string
  ): Promise<OmiMessage[]> {
    const conversation = await this.client.getConversation(conversationId);
    return conversation.messages;
  }

  async addMessageToConversation(
    request: CreateMessageRequest
  ): Promise<OmiMessage> {
    return this.client.createMessage(request);
  }

  async searchConversations(
    query: string,
    params?: ListParams
  ): Promise<OmiConversation[]> {
    const result = await this.client.getConversations(params);
    const lowerQuery = query.toLowerCase();
    return result.data.filter(
      (conv) =>
        conv.title?.toLowerCase().includes(lowerQuery) ||
        conv.participants.some((p) => p.toLowerCase().includes(lowerQuery))
    );
  }

  async deleteConversation(id: string): Promise<void> {
    return this.client.deleteConversation(id);
  }
}
