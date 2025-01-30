import { Injectable } from '@nestjs/common';
import { DailySalesReport } from './types/daily-sales-report.type';

@Injectable()
export class EmailService {
  async sendDailySalesReport(report: DailySalesReport): Promise<void> {
    // Mock email sending
    console.log('Sending email with daily sales report...');
    console.log('To: admin@company.com');
    console.log('Subject: Daily Sales Report - ' + report.date);
    console.log('Body:');
    console.log('Daily Sales Summary');
    console.log('===================');
    console.log(`Date: ${report.date}`);
    console.log(`Total Sales: $${report.totalSales.toFixed(2)}`);
    console.log('\nItems Sold:');
    report.itemsSummary.forEach(item => {
      console.log(`- ${item.sku}: ${item.totalQuantity} units`);
    });
    console.log('===================');
  }
} 