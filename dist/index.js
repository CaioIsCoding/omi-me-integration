"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const client_js_1 = require("./client.js");
const memories_js_1 = require("./memories.js");
const action_items_js_1 = require("./action-items.js");
const conversations_js_1 = require("./conversations.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Initialize Omi.me API client
const apiToken = process.env.OMI_API_TOKEN;
if (!apiToken) {
    console.error('Error: OMI_API_TOKEN is not set in environment variables');
    process.exit(1);
}
const client = new client_js_1.OmiClient({
    apiUrl: process.env.OMI_API_URL || 'https://api.omi.me/v1',
    apiToken,
});
// Initialize resources
const memoriesResource = new memories_js_1.MemoriesResource(client);
const actionItemsResource = new action_items_js_1.ActionItemsResource(client);
const conversationsResource = new conversations_js_1.ConversationsResource(client);
// Create MCP server
const server = new index_js_1.Server({
    name: 'omi-me-integration',
    version: '1.0.0',
});
// Tool definitions
const TOOLS = {
    getMemories: {
        name: 'get-memories',
        description: 'Retrieve a list of memories from Omi.me',
        inputSchema: {
            type: 'object',
            properties: {
                limit: { type: 'number', description: 'Maximum number of results (default: 50)' },
                offset: { type: 'number', description: 'Number of results to skip' },
                order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort order' },
            },
        },
    },
    createMemory: {
        name: 'create-memory',
        description: 'Create a new memory in Omi.me',
        inputSchema: {
            type: 'object',
            properties: {
                content: { type: 'string', description: 'The memory content' },
                type: { type: 'string', description: 'Memory type (e.g., "fact", "preference")' },
                metadata: { type: 'object', description: 'Additional metadata' },
            },
            required: ['content'],
        },
    },
    getActionItems: {
        name: 'get-action-items',
        description: 'Retrieve action items (tasks) from Omi.me',
        inputSchema: {
            type: 'object',
            properties: {
                limit: { type: 'number', description: 'Maximum number of results (default: 50)' },
                offset: { type: 'number', description: 'Number of results to skip' },
                order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort order' },
            },
        },
    },
    createActionItem: {
        name: 'create-action-item',
        description: 'Create a new action item (task) in Omi.me',
        inputSchema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Task title' },
                description: { type: 'string', description: 'Task description' },
                due_date: { type: 'string', description: 'Due date (ISO 8601 format)' },
                metadata: { type: 'object', description: 'Additional metadata' },
            },
            required: ['title'],
        },
    },
    getConversations: {
        name: 'get-conversations',
        description: 'Retrieve conversations from Omi.me',
        inputSchema: {
            type: 'object',
            properties: {
                limit: { type: 'number', description: 'Maximum number of results (default: 50)' },
                offset: { type: 'number', description: 'Number of results to skip' },
                order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort order' },
            },
        },
    },
    createConversation: {
        name: 'create-conversation',
        description: 'Create a new conversation in Omi.me',
        inputSchema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Conversation title' },
                participants: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of participant identifiers',
                },
                initial_message: { type: 'string', description: 'Initial message content' },
                metadata: { type: 'object', description: 'Additional metadata' },
            },
            required: ['participants'],
        },
    },
};
// Handle tool requests
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: Object.values(TOOLS),
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'get-memories': {
                const result = await memoriesResource.getMemories(args);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'create-memory': {
                if (!args || typeof args.content !== 'string') {
                    throw new Error('content is required for create-memory');
                }
                const result = await memoriesResource.createMemory({
                    content: args.content,
                    type: args.type,
                    metadata: args.metadata,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'get-action-items': {
                const result = await actionItemsResource.getActionItems(args);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'create-action-item': {
                if (!args || typeof args.title !== 'string') {
                    throw new Error('title is required for create-action-item');
                }
                const result = await actionItemsResource.createActionItem({
                    title: args.title,
                    description: args.description,
                    due_date: args.due_date,
                    metadata: args.metadata,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'get-conversations': {
                const result = await conversationsResource.getConversations(args);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'create-conversation': {
                if (!args || !Array.isArray(args.participants)) {
                    throw new Error('participants (array) is required for create-conversation');
                }
                const result = await conversationsResource.createConversation({
                    title: args.title,
                    participants: args.participants,
                    initial_message: args.initial_message,
                    metadata: args.metadata,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            default:
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Unknown tool: ${name}`,
                        },
                    ],
                    isError: true,
                };
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${errorMessage}`,
                },
            ],
            isError: true,
        };
    }
});
// Start the server
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.log('Omi.me MCP server is running...');
}
main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map