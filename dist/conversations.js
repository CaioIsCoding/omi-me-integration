"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsResource = void 0;
class ConversationsResource {
    constructor(client) {
        this.client = client;
    }
    async getConversations(params) {
        const result = await this.client.getConversations(params);
        return {
            conversations: result.data,
            total: result.total,
        };
    }
    async getConversation(id) {
        return this.client.getConversation(id);
    }
    async createConversation(request) {
        return this.client.createConversation(request);
    }
    async getConversationMessages(conversationId) {
        const conversation = await this.client.getConversation(conversationId);
        return conversation.messages;
    }
    async addMessageToConversation(request) {
        return this.client.createMessage(request);
    }
    async searchConversations(query, params) {
        const result = await this.client.getConversations(params);
        const lowerQuery = query.toLowerCase();
        return result.data.filter((conv) => conv.title?.toLowerCase().includes(lowerQuery) ||
            conv.participants.some((p) => p.toLowerCase().includes(lowerQuery)));
    }
    async deleteConversation(id) {
        return this.client.deleteConversation(id);
    }
    async updateConversation(id, data) {
        // Omi API might not have PATCH for conversations, so we update available fields
        // This is a placeholder - implement based on actual API capabilities
        const conversation = await this.client.getConversation(id);
        if (data.title)
            conversation.title = data.title;
        if (data.participants)
            conversation.participants = data.participants;
        if (data.metadata)
            conversation.metadata = data.metadata;
        return conversation;
    }
}
exports.ConversationsResource = ConversationsResource;
//# sourceMappingURL=conversations.js.map