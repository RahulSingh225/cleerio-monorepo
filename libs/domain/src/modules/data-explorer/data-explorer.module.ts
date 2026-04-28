import { Module } from '@nestjs/common';
import { DataExplorerController } from './data-explorer.controller';
import { DataExplorerService } from './data-explorer.service';

@Module({
  controllers: [DataExplorerController],
  providers: [DataExplorerService],
  exports: [DataExplorerService],
})
export class DataExplorerModule {}
