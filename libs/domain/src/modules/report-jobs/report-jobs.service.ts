import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { db, reportJobs, taskQueue } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class ReportJobsService extends BaseRepository<typeof reportJobs> {
  constructor() {
    super(reportJobs, db);
  }

  async requestReport(data: {
    tenantId: string;
    requestedBy: string;
    reportType: string;
    filters?: any;
  }) {
    // 1. Create job_queue entry
    const [job] = await db.insert(taskQueue).values({
      tenantId: data.tenantId,
      jobType: 'report.generate',
      status: 'pending',
      payload: { reportType: data.reportType, filters: data.filters, tenantId: data.tenantId },
      priority: 5,
      runAfter: new Date(),
    }).returning();

    // 2. Create report_jobs entry linked to the job
    const [report] = await this._db.insert(reportJobs).values({
      tenantId: data.tenantId,
      jobId: job.id,
      requestedBy: data.requestedBy,
      reportType: data.reportType,
      filters: data.filters || {},
      status: 'queued',
    }).returning();

    return report;
  }

  async findAllForTenant() {
    return this.findMany({ orderBy: desc(reportJobs.queuedAt) });
  }
}
