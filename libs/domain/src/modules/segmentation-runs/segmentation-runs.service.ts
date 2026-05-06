import { Injectable } from '@nestjs/common';
import { eq, and, count, or, isNull } from 'drizzle-orm';
import {
  db, segmentationRuns, segments, portfolioRecords,
} from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { evaluateCriteria, CriteriaGroup } from '../segments/segments.service';
import { JourneyProgressionService } from '../journeys/journey-progression.service';

@Injectable()
export class SegmentationRunsService extends BaseRepository<typeof segmentationRuns> {
  constructor(private readonly progression: JourneyProgressionService) {
    super(segmentationRuns, db);
  }

  async startRun(tenantId: string, portfolioId?: string, triggeredBy?: string) {
    // Count records to segment — scoped to portfolio if provided
    const whereClause = portfolioId
      ? and(eq(portfolioRecords.tenantId, tenantId), eq(portfolioRecords.portfolioId, portfolioId))
      : eq(portfolioRecords.tenantId, tenantId);

    const [totalResult] = await db
      .select({ value: count() })
      .from(portfolioRecords)
      .where(whereClause)
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
    const portfolioId = run.portfolioId;

    // Fetch active segments — portfolio-scoped + tenant-wide fallbacks
    const activeSegments = await db
      .select()
      .from(segments)
      .where(and(
        eq(segments.tenantId, tenantId),
        eq(segments.isActive, true),
        portfolioId
          ? or(eq(segments.portfolioId, portfolioId), isNull(segments.portfolioId))
          : undefined,
      ))
      .orderBy(segments.priority)
      .execute();

    // Ensure a portfolio-scoped default segment exists
    let defaultSeg = activeSegments.find((s: any) => s.isDefault && (s.portfolioId === portfolioId || !s.portfolioId));
    if (!defaultSeg && portfolioId) {
      // Auto-create portfolio-scoped default
      const [created] = await db
        .insert(segments)
        .values({
          tenantId,
          portfolioId,
          name: 'Others',
          code: `others_${portfolioId.substring(0, 8)}`,
          description: 'Default catch-all segment for this portfolio',
          isDefault: true,
          isActive: true,
          priority: 999,
          criteriaJsonb: { logic: 'AND', conditions: [] },
        })
        .returning();
      defaultSeg = created;
    }

    // Fetch records — scoped to this portfolio only
    const recordWhereClause = portfolioId
      ? and(eq(portfolioRecords.tenantId, tenantId), eq(portfolioRecords.portfolioId, portfolioId))
      : eq(portfolioRecords.tenantId, tenantId);

    const records = await db
      .select()
      .from(portfolioRecords)
      .where(recordWhereClause)
      .execute();

    let processed = 0;

    for (const record of records) {
      let matched = false;
      for (const seg of activeSegments) {
        if (seg.isDefault) continue;
        const criteria = seg.criteriaJsonb as CriteriaGroup;
        if (criteria && criteria.conditions && criteria.conditions.length > 0) {
          if (evaluateCriteria(criteria, record as any)) {
            const oldSegmentId = record.segmentId;
            if (oldSegmentId !== seg.id) {
              await db
                .update(portfolioRecords)
                .set({
                  segmentId: seg.id,
                  lastSegmentedAt: new Date(),
                  updatedAt: new Date(),
                })
                .where(eq(portfolioRecords.id, record.id));
            }
              
            // Always try to admit to journey (progression service handles idempotency)
            await this.progression.admitToJourney(tenantId, record.id, seg.id);
            matched = true;
            break;
          }
        }
      }

      // Assign to default if no match
      if (!matched && defaultSeg) {
        const oldSegmentId = record.segmentId;
        if (oldSegmentId !== defaultSeg.id) {
            await db
            .update(portfolioRecords)
            .set({
                segmentId: defaultSeg.id,
                lastSegmentedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(portfolioRecords.id, record.id));
        }
            
        // Always try to admit to journey (progression service handles idempotency)
        await this.progression.admitToJourney(tenantId, record.id, defaultSeg.id);
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
