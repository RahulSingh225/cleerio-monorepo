import { db, portfolioRecords, segments } from '../../libs/drizzle/index.ts';
import { eq, and } from 'drizzle-orm';
import { evaluateCriteria } from '../../libs/domain/src/modules/segments/segments.service.ts';

async function main() {
  const segmentId = '019dfd2c-0dd2-a548-14c7-da23335ef237';
  
  const [segment] = await db
    .select()
    .from(segments)
    .where(eq(segments.id, segmentId))
    .execute();

  if (!segment) {
    console.log('Segment not found');
    process.exit(1);
  }

  const recs = await db
    .select()
    .from(portfolioRecords)
    .where(eq(portfolioRecords.tenantId, segment.tenantId))
    .execute();

  let matchCount = 0;
  for (const record of recs) {
    if (evaluateCriteria(segment.criteriaJsonb as any, record)) {
      matchCount++;
      // Actually update the DB so the user sees the data right away
      await db.update(portfolioRecords)
        .set({ segmentId: segment.id, lastSegmentedAt: new Date() })
        .where(eq(portfolioRecords.id, record.id));
    }
  }

  console.log(`Matched ${matchCount} records out of ${recs.length} total records.`);
  process.exit(0);
}

main().catch(console.error);
