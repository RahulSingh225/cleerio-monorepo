import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db, journeySteps } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class JourneyStepsService extends BaseRepository<typeof journeySteps> {
  constructor() {
    super(journeySteps, db);
  }

  async createStep(data: typeof journeySteps.$inferInsert) {
    return this._db.insert(journeySteps).values(data).returning();
  }

  async updateStep(id: string, data: Partial<typeof journeySteps.$inferInsert>) {
    return this._db
      .update(journeySteps)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(journeySteps.id, id))
      .returning();
  }

  async deleteStep(id: string) {
    return this._db.delete(journeySteps).where(eq(journeySteps.id, id)).returning();
  }

  async findByJourney(journeyId: string) {
    return this._db
      .select()
      .from(journeySteps)
      .where(eq(journeySteps.journeyId, journeyId))
      .orderBy(journeySteps.stepOrder)
      .execute();
  }

  async reorder(journeyId: string, stepIds: string[]) {
    for (let i = 0; i < stepIds.length; i++) {
      await this._db
        .update(journeySteps)
        .set({ stepOrder: i + 1, updatedAt: new Date() })
        .where(eq(journeySteps.id, stepIds[i]));
    }
  }
}
