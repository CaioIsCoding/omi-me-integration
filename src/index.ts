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
const server = new Server({
  name: 'omi-me-integration',
  version: '1.0.0',
});

// Tool definitions
const TOOLS = {
  // Memories
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
  getMemory: {
    name: 'get-memory',
    description: 'Get a specific memory by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Memory ID' },
      },
      required: ['id'],
    },
  },
  createMemory: {
    name: 'create-memory',
    description: 'Create a new memory in Omi.me',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'The memory content (required)' },
        type: { type: 'string', description: 'Memory type (e.g., "fact", "preference")' },
        metadata: { type: 'object', description: 'Additional metadata' },
      },
      required: ['content'],
    },
  },
  updateMemory: {
    name: 'update-memory',
    description: 'Update an existing memory',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Memory ID (required)' },
        content: { type: 'string', description: 'Updated content' },
        type: { type: 'string', description: 'Updated type' },
        metadata: { type: 'object', description: 'Updated metadata' },
      },
      required: ['id'],
    },
  },
  deleteMemory: {
    name: 'delete-memory',
    description: 'Delete a memory from Omi.me',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Memory ID to delete (required)' },
      },
      required: ['id'],
    },
  },
  searchMemories: {
    name: 'search-memories',
    description: 'Search memories by content or type',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (required)' },
        limit: { type: 'number', description: 'Maximum results (default: 50)' },
      },
      required: ['query'],
    },
  },
  // Action Items (Tasks)
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
  getActionItem: {
    name: 'get-action-item',
    description: 'Get a specific action item by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Action item ID' },
      },
      required: ['id'],
    },
  },
  createActionItem: {
    name: 'create-action-item',
    description: 'Create a new action item (task) in Omi.me',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title (required)' },
        description: { type: 'string', description: 'Task description' },
        due_date: { type: 'string', description: 'Due date (ISO 8601 format)' },
        metadata: { type: 'object', description: 'Additional metadata' },
      },
      required: ['title'],
    },
  },
  updateActionItem: {
    name: 'update-action-item',
    description: 'Update an existing action item',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Action item ID (required)' },
        title: { type: 'string', description: 'Updated title' },
        description: { type: 'string', description: 'Updated description' },
        due_date: { type: 'string', description: 'Updated due date' },
        status: { type: 'string', enum: ['pending', 'completed', 'cancelled'], description: 'Updated status' },
        metadata: { type: 'object', description: 'Updated metadata' },
      },
      required: ['id'],
    },
  },
  deleteActionItem: {
    name: 'delete-action-item',
    description: 'Delete an action item from Omi.me',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Action item ID to delete (required)' },
      },
      required: ['id'],
    },
  },
  markActionItemComplete: {
    name: 'mark-action-item-complete',
    description: 'Mark an action item as completed',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Action item ID (required)' },
      },
      required: ['id'],
    },
  },
  markActionItemPending: {
    name: 'mark-action-item-pending',
    description: 'Mark an action item as pending',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Action item ID (required)' },
      },
      required: ['id'],
    },
  },
  // Conversations
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
  getConversation: {
    name: 'get-conversation',
    description: 'Get a specific conversation by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Conversation ID' },
      },
      required: ['id'],
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
          description: 'List of participant identifiers (required)',
        },
        initial_message: { type: 'string', description: 'Initial message content' },
        metadata: { type: 'object', description: 'Additional metadata' },
      },
      required: ['participants'],
    },
  },
  updateConversation: {
    name: 'update-conversation',
    description: 'Update an existing conversation',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Conversation ID (required)' },
        title: { type: 'string', description: 'Updated title' },
        participants: { type: 'array', items: { type: 'string' }, description: 'Updated participants' },
        metadata: { type: 'object', description: 'Updated metadata' },
      },
      required: ['id'],
    },
  },
  deleteConversation: {
    name: 'delete-conversation',
    description: 'Delete a conversation from Omi.me',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Conversation ID to delete (required)' },
      },
      required: ['id'],
    },
  },
  addMessageToConversation: {
    name: 'add-message-to-conversation',
    description: 'Add a message to an existing conversation',
    inputSchema: {
      type: 'object',
      properties: {
        conversation_id: { type: 'string', description: 'Conversation ID (required)' },
        role: { type: 'string', enum: ['user', 'assistant', 'system'], description: 'Message role (required)' },
        content: { type: 'string', description: 'Message content (required)' },
        metadata: { type: 'object', description: 'Additional metadata' },
      },
      required: ['conversation_id', 'role', 'content'],
    },
  },
  searchConversations: {
    name: 'search-conversations',
    description: 'Search conversations by title or participants',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (required)' },
        limit: { type: 'number', description: 'Maximum results (default: 50)' },
      },
      required: ['query'],
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
  const argsData = (args || {}) as Record<string, unknown>;

  try {
    switch (name) {
      // === MEMORIES ===
      case 'get-memories': {
        const result = await memoriesResource.getMemories(argsData);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'get-memory': {
        const id = argsData.id as string;
        if (!id) throw new Error('id is required');
        const result = await memoriesResource.getMemory(id);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'create-memory': {
        const content = argsData.content as string;
        if (!content) throw new Error('content is required for create-memory');
        const result = await memoriesResource.createMemory({
          content,
          type: argsData.type as string,
          metadata: argsData.metadata as Record<string, unknown>,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'update-memory': {
        const id = argsData.id as string;
        if (!id) throw new Error('id is required');
        const result = await memoriesResource.updateMemory(id, {
          content: argsData.content as string,
          type: argsData.type as string,
          metadata: argsData.metadata as Record<string, unknown>,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'delete-memory': {
        const id = argsData.id as string;
        if (!id) throw new Error('id is required');
        await memoriesResource.deleteMemory(id);
        return {
          content: [{ type: 'text', text: `Memory ${id} deleted successfully` }],
        };
      }
      case 'search-memories': {
        const query = argsData.query as string;
        if (!query) throw new Error('query is required');
        const result = await memoriesResource.searchMemories(query);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      // === ACTION ITEMS ===
      case 'get-action-items': {
        const result = await actionItemsResource.getActionItems(argsData);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'get-action-item': {
        const id = argsData.id as string;
        if (!id) throw new Error('id is required');
        const result = await actionItemsResource.getActionItem(id);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'create-action-item': {
        const title = argsData.title as string;
        if (!title) throw new Error('title is required for create-action-item');
        const result = await actionItemsResource.createActionItem({
          title,
          description: argsData.description as string,
          due_date: argsData.due_date as string,
          metadata: argsData.metadata as Record<string, unknown>,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'update-action-item': {
        const id = argsData.id as string;
        if (!id) throw new Error('id is required');
        const result = await actionItemsResource.updateActionItem(id, {
          title: argsData.title as string,
          description: argsData.description as string,
          due_date: argsData.due_date as string,
          metadata: argsData.metadata as Record<string, unknown>,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'delete-action-item': {
        const id = argsData.id as string;
        if (!id) throw new Error('id is required');
        await actionItemsResource.deleteActionItem(id);
        return {
          content: [{ type: 'text', text: `Action item ${id} deleted successfully` }],
        };
      }
      case 'mark-action-item-complete': {
        const id = argsData.id as string;
        if (!id) throw new Error('id is required');
        const result = await actionItemsResource.markActionItemComplete(id);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'mark-action-item-pending': {
        const id = argsData.id as string;
        if (!id) throw new Error('id is required');
        const result = await actionItemsResource.markActionItemPending(id);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      // === CONVERSATIONS ===
      case 'get-conversations': {
        const result = await conversationsResource.getConversations(argsData);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'get-conversation': {
        const id = argsData.id as string;
        if (!id) throw new Error('id is required');
        const result = await conversationsResource.getConversation(id);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'create-conversation': {
        const participants = argsData.participants as string[];
        if (!Array.isArray(participants)) {
          throw new Error('participants (array) is required for create-conversation');
        }
        const result = await conversationsResource.createConversation({
          title: argsData.title as string,
          participants,
          initial_message: argsData.initial_message as string,
          metadata: argsData.metadata as Record<string, unknown>,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'update-conversation': {
        const id = argsData.id as string;
        if (!id) throw new Error('id is required');
        const result = await conversationsResource.updateConversation(id, {
          title: argsData.title as string,
          participants: argsData.participants as string[],
          metadata: argsData.metadata as Record<string, unknown>,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'delete-conversation': {
        const id = argsData.id as string;
        if (!id) throw new Error('id is required');
        await conversationsResource.deleteConversation(id);
        return {
          content: [{ type: 'text', text: `Conversation ${id} deleted successfully` }],
        };
      }
      case 'add-message-to-conversation': {
        const conversation_id = argsData.conversation_id as string;
        const role = argsData.role as string;
        const content = argsData.content as string;
        if (!conversation_id || !role || !content) {
          throw new Error('conversation_id, role, and content are required');
        }
        const result = await conversationsResource.addMessageToConversation({
          conversation_id,
          role: role as 'user' | 'assistant' | 'system',
          content,
          metadata: argsData.metadata as Record<string, unknown>,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'search-conversations': {
        const query = argsData.query as string;
        if (!query) throw new Error('query is required');
        const result = await conversationsResource.searchConversations(query, argsData);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
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
