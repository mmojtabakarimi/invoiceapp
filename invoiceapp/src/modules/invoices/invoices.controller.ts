import { Controller, Get, Post, Delete, Put, Param, Body } from '@nestjs/common';
import { InvoiceService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './schemas/invoice.schema';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    return this.invoiceService.create(createInvoiceDto);
  }

  @Get()
  async findAll(): Promise<Invoice[]> {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Invoice> {
    return this.invoiceService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.invoiceService.delete(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    return this.invoiceService.update(id, updateInvoiceDto);
  }
}
