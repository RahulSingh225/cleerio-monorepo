import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { db } from '@platform/drizzle';

@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => {
        try {
          // Check Postgres connectivity
          await db.execute('SELECT 1');
          return { database: { status: 'up' } };
        } catch (e) {
          return { database: { status: 'down', message: e.message } };
        }
      },
      // In the future, we can add Kafka and Redis checks here
      // For Redis: await redis.ping();
    ]);
  }
}
