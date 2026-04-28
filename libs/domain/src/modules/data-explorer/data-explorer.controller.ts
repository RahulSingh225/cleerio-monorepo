import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DataExplorerService } from './data-explorer.service';
import type { DataExplorerQuery } from './data-explorer.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '@platform/tenant';

@Controller('data-explorer')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DataExplorerController {
  constructor(private readonly service: DataExplorerService) {}

  /**
   * Execute a query and return paginated results (max 1000 rows).
   */
  @Post('query')
  @ApiResponseConfig({ message: 'Query executed', apiCode: 'EXPLORER_QUERY_OK' })
  async query(@Body() body: DataExplorerQuery) {
    const result = await this.service.executeQuery(body);
    return { data: result.data, meta: { totalCount: result.totalCount } };
  }

  /**
   * Export query results as CSV download.
   */
  @Post('export')
  async exportCsv(@Body() body: DataExplorerQuery, @Res() res: Response) {
    const csv = await this.service.exportCsv(body);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `cleerio_export_${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  // ── Saved Queries ────────────────────────────────────────

  @Get('saved')
  @ApiResponseConfig({ message: 'Saved queries listed', apiCode: 'SAVED_QUERIES_LISTED' })
  async listSaved() {
    const data = await this.service.getSavedQueries();
    return { data };
  }

  @Post('saved')
  @ApiResponseConfig({ message: 'Query saved', apiCode: 'QUERY_SAVED' })
  async saveQuery(
    @Body() body: { name: string; description?: string; querySpec: DataExplorerQuery },
    @Request() req: any,
  ) {
    const saved = await this.service.saveQuery({
      ...body,
      createdBy: req.user?.userId,
    });
    return { data: saved };
  }

  @Delete('saved/:id')
  @ApiResponseConfig({ message: 'Saved query deleted', apiCode: 'SAVED_QUERY_DELETED' })
  async deleteSaved(@Param('id') id: string) {
    const [deleted] = await this.service.deleteSavedQuery(id);
    return { data: deleted };
  }
}
