import { Injectable } from '@nestjs/common';
import { eq, and, desc, count } from 'drizzle-orm';
import { db, journeys, journeySteps, segments } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class JourneysService extends BaseRepository<typeof journeys> {
  constructor() {
    super(journeys, db);
  }

  async createJourney(data: typeof journeys.$inferInsert) {
    return this._db.insert(journeys).values(data).returning();
  }

  async findAllWithDetails() {
    const journeyList = await this.findMany({ orderBy: desc(journeys.createdAt) });
    const result = await Promise.all(
      journeyList.map(async (j: any) => {
        // Get step count
        const [stepCount] = await this._db
          .select({ value: count() })
          .from(journeySteps)
          .where(eq(journeySteps.journeyId, j.id))
          .execute();

        // Get segment info
        const [seg] = await this._db
          .select()
          .from(segments)
          .where(eq(segments.id, j.segmentId))
          .limit(1)
          .execute();

        return {
          ...j,
          stepCount: Number(stepCount?.value || 0),
          segment: seg || null,
        };
      }),
    );
    return result;
  }

  async findByIdWithSteps(id: string) {
    const journey = await this.findFirst(eq(journeys.id, id));
    if (!journey) return null;

    const steps = await this._db
      .select()
      .from(journeySteps)
      .where(eq(journeySteps.journeyId, id))
      .orderBy(journeySteps.stepOrder)
      .execute();

    const [seg] = await this._db
      .select()
      .from(segments)
      .where(eq(segments.id, (journey as any).segmentId))
      .limit(1)
      .execute();

    return { ...journey, steps, segment: seg || null };
  }

  async updateJourney(id: string, data: Partial<typeof journeys.$inferInsert>) {
    return this._db
      .update(journeys)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(journeys.id, id))
      .returning();
  }

  async deleteJourney(id: string) {
    // Delete all steps first
    await this._db.delete(journeySteps).where(eq(journeySteps.journeyId, id));
    return this._db.delete(journeys).where(eq(journeys.id, id)).returning();
  }

  async activate(id: string) {
    return this.updateJourney(id, { isActive: true });
  }

  async deactivate(id: string) {
    return this.updateJourney(id, { isActive: false });
  }
}
