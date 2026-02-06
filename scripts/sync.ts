/**
 * Sync script for enriching OpenClaw data with Omi.me data
 * 
 * This script demonstrates how to:
 * 1. Fetch data from Omi.me API
 * 2. Transform and enrich OpenClaw's local data
 * 3. Optionally sync changes back to Omi.me
 * 
 * Run with: npm run sync
 */

import dotenv from 'dotenv';
import { OmiClient, OmiMemory, OmiActionItem, OmiConversation } from '../src/client.js';

dotenv.config();

interface OpenClawMemory {
  id: string;
  content: string;
  source: string;
  timestamp: string;
}

interface OpenClawTask {
  id: string;
  title: string;
  completed: boolean;
  source: string;
}

interface EnrichedData {
  memories: Array<OmiMemory & { openclaw_id?: string }>;
  actionItems: Array<OmiActionItem & { openclaw_id?: string }>;
}

async function syncMemories(client: OmiClient): Promise<OmiMemory[]> {
  console.log('Fetching memories from Omi.me...');
  const result = await client.getMemories({ limit: 100 });
  console.log(`Found ${result.data.length} memories`);
  return result.data;
}

async function syncActionItems(client: OmiClient): Promise<OmiActionItem[]> {
  console.log('Fetching action items from Omi.me...');
  const result = await client.getActionItems({ limit: 100 });
  console.log(`Found ${result.data.length} action items`);
  return result.data;
}

async function syncConversations(client: OmiClient): Promise<OmiConversation[]> {
  console.log('Fetching conversations from Omi.me...');
  const result = await client.getConversations({ limit: 100 });
  console.log(`Found ${result.data.length} conversations`);
  return result.data;
}

/**
 * Enrich OpenClaw's local memories with Omi.me context
 */
function enrichMemories(
  openclawMemories: OpenClawMemory[],
  omiMemories: OmiMemory[]
): EnrichedData['memories'] {
  console.log('Enriching memories...');

  const enriched = omiMemories.map((omiMemory) => {
    // Try to find matching OpenClaw memory
    const matching = openclawMemories.find(
      (oc) => oc.content === omiMemory.content && oc.source === 'omi.me'
    );

    return {
      ...omiMemory,
      openclaw_id: matching?.id,
    };
  });

  console.log(`Enriched ${enriched.length} memories`);
  return enriched;
}

/**
 * Enrich OpenClaw's tasks with Omi.me action items
 */
function enrichActionItems(
  openclawTasks: OpenClawTask[],
  omiActionItems: OmiActionItem[]
): EnrichedData['actionItems'] {
  console.log('Enriching action items...');

  const enriched = omiActionItems.map((omiItem) => {
    // Try to find matching OpenClaw task
    const matching = openclawTasks.find(
      (task) =>
        task.title === omiItem.title && task.source === 'omi.me'
    );

    return {
      ...omiItem,
      openclaw_id: matching?.id,
    };
  });

  console.log(`Enriched ${enriched.length} action items`);
  return enriched;
}

/**
 * Create OpenClaw-formatted memories from Omi.me memories
 */
function createOpenClawMemories(
  omiMemories: OmiMemory[]
): OpenClawMemory[] {
  return omiMemories.map((omi) => ({
    id: `omi_${omi.id}`,
    content: omi.content,
    source: 'omi.me',
    timestamp: omi.created_at,
  }));
}

/**
 * Create OpenClaw-formatted tasks from Omi.me action items
 */
function createOpenClawTasks(
  omiActionItems: OmiActionItem[]
): OpenClawTask[] {
  return omiActionItems.map((item) => ({
    id: `omi_${item.id}`,
    title: item.title,
    completed: item.status === 'completed',
    source: 'omi.me',
  }));
}

/**
 * Main sync function
 */
async function runSync(): Promise<void> {
  const apiToken = process.env.OMI_API_TOKEN;
  if (!apiToken) {
    console.error('Error: OMI_API_TOKEN is not set');
    process.exit(1);
  }

  console.log('Starting Omi.me sync...');

  const client = new OmiClient({
    apiUrl: process.env.OMI_API_URL || 'https://api.omi.me/v1',
    apiToken,
  });

  try {
    // Fetch all data from Omi.me
    const [omiMemories, omiActionItems, omiConversations] = await Promise.all([
      syncMemories(client),
      syncActionItems(client),
      syncConversations(client),
    ]);

    // Example: Fetch OpenClaw's local data
    // In a real implementation, this would come from OpenClaw's storage
    const openclawMemories: OpenClawMemory[] = [];
    const openclawTasks: OpenClawTask[] = [];

    // Enrich OpenClaw data with Omi.me context
    const enrichedMemories = enrichMemories(openclawMemories, omiMemories);
    const enrichedActionItems = enrichActionItems(openclawTasks, omiActionItems);

    // Create OpenClaw-formatted data from Omi.me data
    const newOpenclawMemories = createOpenClawMemories(omiMemories);
    const newOpenclawTasks = createOpenClawTasks(omiActionItems);

    // Output sync results
    console.log('\n=== Sync Results ===');
    console.log(`Memories synced: ${omiMemories.length}`);
    console.log(`Action items synced: ${omiActionItems.length}`);
    console.log(`Conversations synced: ${omiConversations.length}`);
    console.log(`New memories to create in OpenClaw: ${newOpenclawMemories.length}`);
    console.log(`New tasks to create in OpenClaw: ${newOpenclawTasks.length}`);

    // Example: Save enriched data to OpenClaw storage
    // await saveToOpenClawStorage(enrichedMemories, enrichedActionItems);

    // Output rate limit status
    const rateLimit = client.getRateLimitStatus();
    console.log(`\nRate limit: ${rateLimit.remaining} remaining`);

    console.log('\nSync completed successfully!');
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
runSync();
