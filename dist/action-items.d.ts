import { OmiClient, OmiActionItem, CreateActionItemRequest, ListParams } from './client';
export declare class ActionItemsResource {
    private client;
    constructor(client: OmiClient);
    getActionItems(params?: ListParams): Promise<{
        actionItems: OmiActionItem[];
        total: number;
    }>;
    getActionItem(id: string): Promise<OmiActionItem>;
    createActionItem(request: CreateActionItemRequest): Promise<OmiActionItem>;
    getPendingActionItems(params?: ListParams): Promise<OmiActionItem[]>;
    getCompletedActionItems(params?: ListParams): Promise<OmiActionItem[]>;
    markActionItemComplete(id: string): Promise<OmiActionItem>;
    markActionItemPending(id: string): Promise<OmiActionItem>;
    updateActionItem(id: string, data: Partial<CreateActionItemRequest>): Promise<OmiActionItem>;
    deleteActionItem(id: string): Promise<void>;
}
//# sourceMappingURL=action-items.d.ts.map