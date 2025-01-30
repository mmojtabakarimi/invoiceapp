import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { DailySalesReport } from './types/daily-sales-report.type';
import { RabbitMQService } from '../shared/services/rabbitmq.service';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private rabbitMQService: RabbitMQService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const createdInvoice = await this.invoiceModel.create(createInvoiceDto);
    return createdInvoice;
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceModel.find().exec();
  }

  async findOne(id: string): Promise<Invoice> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid invoice ID');
    }
    const invoice = await this.invoiceModel.findById(id).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async delete(id: string): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid invoice ID');
    }
    const result = await this.invoiceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
  }

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateInvoiceDto, { new: true })
      .exec();
    if (!updatedInvoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return updatedInvoice;
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  //@Cron(CronExpression.EVERY_30_SECONDS)
  async generateDailySalesReport() {
    console.log('Running daily sales report cron job...');
    const report = await this.generateReport();
    await this.publishReport(report);
    return report;
  }

  async generateSalesReportForDate(date: Date): Promise<DailySalesReport> {
    const report = await this.generateReport(date);
    await this.publishReport(report);
    return report;
  }

  private async publishReport(report: DailySalesReport) {
    await this.rabbitMQService.publishDailySalesReport({
      date: report.date,
      totalSales: report.totalSales,
      itemsSummary: report.itemsSold.map((item) => ({
        sku: item.sku,
        totalQuantity: item.totalQuantity,
      })),
    });
  }

  private async generateReport(
    date: Date = new Date(),
  ): Promise<DailySalesReport> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const invoices = await this.invoiceModel
      .find({
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      })
      .exec();

    const totalSales = invoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0,
    );

    // Calculate items sold grouped by SKU
    const itemsSoldMap = new Map<
      string,
      { totalQuantity: number; totalAmount: number }
    >();

    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const current = itemsSoldMap.get(item.sku) || {
          totalQuantity: 0,
          totalAmount: 0,
        };
        itemsSoldMap.set(item.sku, {
          totalQuantity: current.totalQuantity + item.qt,
          totalAmount:
            current.totalAmount +
            item.qt * (invoice.amount / invoice.items.length), // Approximate amount per item
        });
      });
    });

    const report: DailySalesReport = {
      date: startDate.toISOString().split('T')[0],
      totalSales,
      itemsSold: Array.from(itemsSoldMap.entries()).map(([sku, data]) => ({
        sku,
        ...data,
      })),
    };

    console.log('Daily Sales Report:', JSON.stringify(report, null, 2));
    return report;
  }
}
