import { Controller, Get, Param, Res, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentLinksService } from '@platform/domain';

@Controller('p')
export class PaymentLinksController {
  private readonly logger = new Logger(PaymentLinksController.name);

  constructor(private readonly paymentLinksService: PaymentLinksService) {}

  @Get(':shortCode')
  async handleRedirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    this.logger.log(`Received redirect request for shortCode: ${shortCode}`);
    try {
      // Resolve the destination URL and track the click
      const targetUrl = await this.paymentLinksService.resolveAndTrackClick(shortCode);
      
      // Redirect to the actual payment gateway or resolution page
      return res.redirect(302, targetUrl);
    } catch (err: any) {
      this.logger.error(`Failed to resolve payment link ${shortCode}: ${err.message}`);
      return res.status(404).send('Link not found or expired.');
    }
  }
}
