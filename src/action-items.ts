import {
  OmiClient,
  OmiActionItem,
  CreateActionItemRequest,
  ListParams,
} from './client';

export class ActionItemsResource {
  constructor(private client: OmiClient) {}

  async getActionItems(
    params?: ListParams
  ): Promise<{ actionItems: OmiActionItem[]; total: number }> {
    const result = await this.client.getActionItems(params);
    return {
      actionItems: result.data,
      total: result.total,
    };
  }

  async getActionItem(id: string): Promise<OmiActionItem> {
    return this.client.getActionItem(id);
  }

  async createActionItem(request: CreateActionItemRequest): Promise<OmiActionItem> {
    return this.client.createActionItem(request);
  }

  async getPendingActionItems(params?: ListParams): Promise<OmiActionItem[]> {
    const result = await this.client.getActionItems(params);
    return result.data.filter((item) => item.status === 'pending');
  }

  async getCompletedActionItems(params?: ListParams): Promise<OmiActionItem[]> {
    const result = await this.client.getActionItems(params);
    return result.data.filter((item) => item.status === 'completed');
  }

  async markActionItemComplete(id: string): Promise<OmiActionItem> {
    return this.client.updateActionItem(id, { status: 'completed' } as any);
  }

  async markActionItemPending(id: string): Promise<OmiActionItem> {
    return this.client.updateActionItem(id, { status: 'pending' } as any);
  }

  async updateActionItem(
    id: string,
    data: Partial<CreateActionItemRequest>
  ): Promise<OmiActionItem> {
    return this.client.updateActionItem(id, data);
  }

  async deleteActionItem(id: string): Promise<void> {
    return this.client.deleteActionItem(id);
  }
}
