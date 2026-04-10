import { Injectable } from '@nestjs/common';
import { eq, and, count } from 'drizzle-orm';
import {
  db, segmentationRuns, segments, portfolioRecords,
} from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { evaluateCriteria, CriteriaGroup } from '../segments/segments.service';

@Injectable()
export class SegmentationRunsService extends BaseRepository<typeof segmentationRuns> {
  constructor() {
    super(segmentationRuns, db);
  }

  async startRun(tenantId: string, portfolioId?: string, triggeredBy?: string) {
    // Count records to segment
    const [totalResult] = await db
      .select({ value: count() })
      .from(portfolioRecords)
      .where(eq(portfolioRecords.tenantId, tenantId))
      .execute();

    const [run] = await db
      .insert(segmentationRuns)
      .values({
        tenantId,
        portfolioId: portfolioId || null,
        triggeredBy: triggeredBy || null,
        status: 'running',
        totalRecords: Number(totalResult?.value || 0),
        processed: 0,
      })
      .returning();

    return run;
  }

  async processRun(runId: string) {
    const [run] = await db
      .select()
      .from(segmentationRuns)
      .where(eq(segmentationRuns.id, runId))
      .execute();

    if (!run) throw new Error(`Segmentation run ${runId} not found`);

    const tenantId = run.tenantId;

    // Fetch all active segments ordered by priority
    const activeSegments = await db
      .select()
      .from(segments)
      .where(and(eq(segments.tenantId, tenantId), eq(segments.isActive, true)))
      .orderBy(segments.priority)
      .execute();

    // Ensure default segment exists
    const defaultSeg = activeSegments.find((s: any) => s.isDefault);

    // Fetch all records for tenant
    const records = await db
      .select()
      .from(portfolioRecords)
      .where(eq(portfolioRecords.tenantId, tenantId))
      .execute();

    let processed = 0;

    for (const record of records) {
      let matched = false;
      for (const seg of activeSegments) {
        if (seg.isDefault) continue;
        const criteria = seg.criteriaJsonb as CriteriaGroup;
        if (criteria && criteria.conditions && criteria.conditions.length > 0) {
          if (evaluateCriteria(criteria, record as any)) {
            await db
              .update(portfolioRecords)
              .set({
                segmentId: seg.id,
                lastSegmentedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(portfolioRecords.id, record.id));
            matched = true;
            break;
          }
        }
      }

      // Assign to default if no match
      if (!matched && defaultSeg) {
        await db
          .update(portfolioRecords)
          .set({
            segmentId: defaultSeg.id,
            lastSegmentedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(portfolioRecords.id, record.id));
      }

      processed++;
      if (processed % 100 === 0) {
        await db
          .update(segmentationRuns)
          .set({ processed })
          .where(eq(segmentationRuns.id, runId));
      }
    }

    // Mark complete
    await db
      .update(segmentationRuns)
      .set({ status: 'completed', processed, completedAt: new Date() })
      .where(eq(segmentationRuns.id, runId));

    return { processed, total: records.length };
  }

  async findByTenant(tenantId: string) {
    return db
      .select()
      .from(segmentationRuns)
      .where(eq(segmentationRuns.tenantId, tenantId))
      .orderBy(segmentationRuns.createdAt)
      .execute();
  }
}
