import { db, portfolioRecords, segments } from '@platform/drizzle';
import { eq, and } from 'drizzle-orm';

async function main() {
  const targetSegmentId = '019dfd2c-0dd2-a548-14c7-da23335ef237';
  const targetPortfolioId = '019dfd00-decc-47c6-0697-2fcca39190eb';

  const allWrong = await db.select().from(portfolioRecords).where(eq(portfolioRecords.segmentId, targetSegmentId)).execute();
  
  let fixedCount = 0;
  for (const r of allWrong) {
    if (r.portfolioId !== targetPortfolioId) {
       await db.update(portfolioRecords).set({ segmentId: null }).where(eq(portfolioRecords.id, r.id));
       fixedCount++;
    }
  }

  console.log(`Removed ${fixedCount} records from the segment that belonged to other portfolios.`);

  // 2. Count the remaining correct records
  const correct = await db.select().from(portfolioRecords).where(eq(portfolioRecords.segmentId, targetSegmentId)).execute();
  console.log(`Segment now has ${correct.length} records.`);

  process.exit(0);
}

main().catch(console.error);
