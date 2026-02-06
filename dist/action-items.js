"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionItemsResource = void 0;
class ActionItemsResource {
    constructor(client) {
        this.client = client;
    }
    async getActionItems(params) {
        const result = await this.client.getActionItems(params);
        return {
            actionItems: result.data,
            total: result.total,
        };
    }
    async getActionItem(id) {
        return this.client.getActionItem(id);
    }
    async createActionItem(request) {
        return this.client.createActionItem(request);
    }
    async getPendingActionItems(params) {
        const result = await this.client.getActionItems(params);
        return result.data.filter((item) => item.status === 'pending');
    }
    async getCompletedActionItems(params) {
        const result = await this.client.getActionItems(params);
        return result.data.filter((item) => item.status === 'completed');
    }
    async markActionItemComplete(id) {
        return this.client.updateActionItem(id, { status: 'completed' });
    }
    async markActionItemPending(id) {
        return this.client.updateActionItem(id, { status: 'pending' });
    }
    async updateActionItem(id, data) {
        return this.client.updateActionItem(id, data);
    }
    async deleteActionItem(id) {
        return this.client.deleteActionItem(id);
    }
}
exports.ActionItemsResource = ActionItemsResource;
//# sourceMappingURL=action-items.js.map