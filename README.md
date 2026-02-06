# Omi.me Integration for OpenClaw

This repository provides a comprehensive integration between [Omi.me](https://omi.me) and [OpenClaw](https://github.com/openclaw/openclaw). It includes a Model Context Protocol (MCP) server for real-time interaction and a sync script for data enrichment.

## Features

- **MCP Server**: Exposes Omi.me resources (Memories, Action Items, Conversations) as tools for AI agents.
- **API Client**: Robust TypeScript client with automatic rate limiting and error handling.
- **Sync Script**: Example utility for synchronizing and enriching OpenClaw data with Omi.me records.
- **Type Safe**: Full TypeScript support with interfaces for all Omi.me API entities.

## Project Structure

```
omi-me-integration/
├── package.json
├── README.md
├── LICENSE
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── client.ts         # Omi.me API HTTP client
│   ├── memories.ts       # Memories resource
│   ├── action-items.ts   # Action items (tasks) resource
│   └── conversations.ts  # Conversations resource
├── scripts/
│   └── sync.ts           # Cron/heartbeat script for enrichment
├── .env.example
└── tsconfig.json
```

## Setup

### Prerequisites

- Node.js (v18+)
- An Omi.me API Token

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/talktocaio/omi-me-integration.git
   cd omi-me-integration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your OMI_API_TOKEN
   ```

## Usage

### As an MCP Server

To use this as an MCP server in OpenClaw or other MCP-compatible clients:

1. Build the project:
   ```bash
   npm run build
   ```

2. Add the server to your OpenClaw configuration (e.g., in `~/.openclaw/config.yaml`):

```yaml
mcp:
  servers:
    omi:
      command: "node"
      args: ["/path/to/omi-me-integration/dist/index.js"]
      env:
        OMI_API_TOKEN: "your_token_here"
```

### Available Tools

- `get-memories`: List memories with optional filtering/pagination.
- `create-memory`: Store a new memory.
- `get-action-items`: List tasks and action items.
- `create-action-item`: Create a new task.
- `get-conversations`: List captured conversations.
- `create-conversation`: Record a new conversation.

### Running the Sync Script

The sync script demonstrates how to enrich local OpenClaw data with Omi.me data:

```bash
npm run sync
```

## License

MIT
