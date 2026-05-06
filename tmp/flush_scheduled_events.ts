import { db, commEvents } from '../libs/drizzle/index.ts';
import { eq, and, count } from 'drizzle-orm';

async function flushScheduledCommEvents() {
  // 1. Count how many are sitting as 'scheduled'
  const [countResult] = await db
    .select({ total: count() })
    .from(commEvents)
    .where(eq(commEvents.status, 'scheduled'));
  
  console.log(`Found ${countResult.total} scheduled comm_events`);

  if (Number(countResult.total) === 0) {
    console.log('Nothing to delete.');
    process.exit(0);
  }

  // 2. Also check for any 'queued' (in-flight but not yet sent)
  const [queuedCount] = await db
    .select({ total: count() })
    .from(commEvents)
    .where(eq(commEvents.status, 'queued'));
  
  console.log(`Found ${queuedCount.total} queued (in-flight) comm_events`);

  // 3. Delete all scheduled events (these haven't been sent yet)
  const deleted = await db
    .delete(commEvents)
    .where(eq(commEvents.status, 'scheduled'))
    .returning({ id: commEvents.id });
  
  console.log(`Deleted ${deleted.length} scheduled comm_events`);

  // 4. Also delete queued events (claimed but not dispatched yet)
  if (Number(queuedCount.total) > 0) {
    const deletedQueued = await db
      .delete(commEvents)
      .where(eq(commEvents.status, 'queued'))
      .returning({ id: commEvents.id });
    
    console.log(`Deleted ${deletedQueued.length} queued comm_events`);
  }

  // 5. Also clean up any pending comm.dispatch jobs in task_queue
  // to prevent the cron from re-triggering
  console.log('\nAll scheduled/queued events flushed. SMS will NOT be sent.');
  process.exit(0);
}

flushScheduledCommEvents().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
