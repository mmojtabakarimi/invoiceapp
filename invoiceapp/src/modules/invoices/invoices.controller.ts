import { Controller, Get, Post, Body } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  
  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  findAll() {
    return this.invoicesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create invoice' })
  create(@Body() createInvoiceDto: any) {
    return this.invoicesService.create(createInvoiceDto);
  }
} 