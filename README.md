# Omi.me Integration for OpenClaw

Complete integration between [Omi.me](https://omi.me) and [OpenClaw](https://github.com/openclaw/openclaw). Provides full CRUD operations for memories, action items (tasks), and conversations via MCP server and CLI.

## Features

- ✅ **Full CRUD Operations** - Create, Read, Update, Delete for memories, tasks, and conversations
- 🤖 **MCP Server** - Expose Omi.me tools to AI agents (Claude Desktop, OpenClaw, etc.)
- 💻 **CLI Tool** - Full command-line interface for all operations
- 🔄 **Sync Capabilities** - Enrich OpenClaw context with Omi.me memories and tasks
- 🛡️ **Type Safe** - Complete TypeScript support with interfaces
- ⚡ **Rate Limit Handling** - Automatic tracking and handling of API limits
- 📝 **Well Documented** - Comprehensive CLI help and MCP tool documentation

## Project Structure

```
omi-me-integration/
├── package.json
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
├── tsconfig.json
├── src/
│   ├── index.ts           # MCP server entry point (18+ tools)
│   ├── client.ts          # Omi.me API HTTP client
│   ├── memories.ts        # Memories resource (CRUD + search)
│   ├── action-items.ts    # Tasks resource (CRUD + status management)
│   └── conversations.ts   # Conversations resource (CRUD + messages)
└── scripts/
    └── sync.ts           # Data enrichment script
```

## Quick Setup

### 1. Get API Token

Visit https://docs.omi.me/doc/developer/api/overview and generate a developer API key.

### 2. Configure Environment

```bash
# Copy example env
cp .env.example .env

# Edit with your token
echo "OMI_API_TOKEN=omi_dev_your_token" > .env
```

### 3. Build and Run

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Test API connection
npm run sync
```

## MCP Server

### Setup in OpenClaw

Add to your `openclaw.json`:

```json
{
  "mcp": {
    "servers": {
      "omi": {
        "command": "node",
        "args": ["/home/ubuntu/.openclaw/workspace/omi-me-integration/dist/index.js"],
        "env": {
          "OMI_API_TOKEN": "your-token-here"
        }
      }
    }
  }
}
```

Then restart: `openclaw gateway restart`

### Available MCP Tools

#### Memories
| Tool | Description |
|------|-------------|
| `get-memories` | List memories with pagination |
| `get-memory` | Get specific memory by ID |
| `create-memory` | Create new memory (requires `content`) |
| `update-memory` | Update existing memory (requires `id`) |
| `delete-memory` | Delete memory (requires `id`) |
| `search-memories` | Search by content/query |

#### Action Items (Tasks)
| Tool | Description |
|------|-------------|
| `get-action-items` | List tasks with pagination |
| `get-action-item` | Get specific task by ID |
| `create-action-item` | Create new task (requires `title`) |
| `update-action-item` | Update task (requires `id`) |
| `delete-action-item` | Delete task (requires `id`) |
| `mark-action-item-complete` | Mark as completed |
| `mark-action-item-pending` | Mark as pending |

#### Conversations
| Tool | Description |
|------|-------------|
| `get-conversations` | List conversations |
| `get-conversation` | Get conversation by ID |
| `create-conversation` | Create conversation (requires `participants`) |
| `update-conversation` | Update conversation (requires `id`) |
| `delete-conversation` | Delete conversation (requires `id`) |
| `add-message-to-conversation` | Add message to conversation |
| `search-conversations` | Search by title/participants |

## CLI Commands

### Memories
```bash
omi memories list                      # List all
omi memories get <id>                  # Get specific
omi memories create "content"          # Create
omi memories create "content" --type preference  # With type
omi memories update <id> "new"        # Update
omi memories delete <id>              # Delete
omi memories search "query"           # Search
```

### Tasks
```bash
omi tasks list                         # List all
omi tasks get <id>                     # Get specific
omi tasks create "title"               # Create
omi tasks create "title" --desc "..." --due "2024-01-01"  # Full create
omi tasks update <id> --title "new"    # Update
omi tasks complete <id>               # Mark done
omi tasks pending <id>                # Mark pending
omi tasks delete <id>                 # Delete
```

### Conversations
```bash
omi conversations list                  # List all
omi conversations get <id>             # Get specific
omi conversations create --title "..." --participants "a,b"  # Create
omi conversations add-message <id> user "Hello"  # Add message
omi conversations delete <id>          # Delete
```

### Sync
```bash
omi sync memories       # Sync memories
omi sync tasks         # Sync tasks
omi sync conversations # Sync conversations
omi sync all           # Sync everything
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OMI_API_TOKEN` | Yes | - | Omi.me developer API key |
| `OMI_API_URL` | No | `https://api.omi.me/v1` | API base URL |

## Rate Limits

- 100 requests per minute per API key
- 10,000 requests per day per user

The client automatically tracks rate limit headers and handles 429 responses gracefully.

## Development

```bash
# Run in development mode (ts-node)
npm run dev

# Build TypeScript
npm run build

# Run sync script
npm run sync
```

## Files Generated

The integration generates several files in your OpenClaw workspace:

- **Skill**: `/home/ubuntu/.openclaw/workspace/skills/omi-me/`
  - `SKILL.md` - Complete documentation
  - `scripts/omi-cli.sh` - CLI wrapper
  - `scripts/setup.sh` - Setup script

## GitHub

https://github.com/CaioIsCoding/omi-me-integration

## License

MIT
