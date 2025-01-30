import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async findAll(): Promise<Invoice[]> {
    return this.invoiceModel.find().exec();
  }

  async create(createInvoiceDto: any): Promise<Invoice> {
    const createdInvoice = new this.invoiceModel(createInvoiceDto);
    return createdInvoice.save();
  }
} 