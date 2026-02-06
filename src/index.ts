import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { OmiClient } from './client.js';
import { MemoriesResource } from './memories.js';
import { ActionItemsResource } from './action-items.js';
import { ConversationsResource } from './conversations.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Omi.me API client
const apiToken = process.env.OMI_API_TOKEN;
if (!apiToken) {
  console.error('Error: OMI_API_TOKEN is not set in environment variables');
  process.exit(1);
}

const client = new OmiClient({
  apiUrl: process.env.OMI_API_URL || 'https://api.omi.me/v1',
  apiToken,
});

// Initialize resources
const memoriesResource = new MemoriesResource(client);
const actionItemsResource = new ActionItemsResource(client);
const conversationsResource = new ConversationsResource(client);

// Create MCP server
const server = new Server('omi-me-integration', {
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
} as const;

// Handle tool requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.values(TOOLS),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
        const result = await memoriesResource.createMemory(args);
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
        const result = await actionItemsResource.createActionItem(args);
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
        const result = await conversationsResource.createConversation(args);
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
  } catch (error) {
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
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('Omi.me MCP server is running...');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
