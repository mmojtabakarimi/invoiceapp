import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoiceService } from './invoices.service';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RabbitMQService } from '../shared/services/rabbitmq.service';
import { Types } from 'mongoose';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let model: Model<InvoiceDocument>;
  let rabbitMQService: Partial<RabbitMQService>;

  const mockId = new Types.ObjectId().toString();
  const mockInvoice = {
    _id: mockId,
    customer: 'Test Customer',
    amount: 100,
    reference: 'INV-001',
    date: new Date(),
    items: [{ sku: 'ITEM1', qt: 1 }],
  };

  const mockCreateInvoiceDto: CreateInvoiceDto = {
    customer: 'Test Customer',
    amount: 100,
    reference: 'INV-001',
    date: new Date(),
    items: [{ sku: 'ITEM1', qt: 1 }],
  };

  beforeEach(async () => {
    rabbitMQService = {
      onModuleInit: jest.fn().mockResolvedValue(undefined),
      publishDailySalesReport: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: getModelToken(Invoice.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockInvoice),
            constructor: jest.fn().mockResolvedValue(mockInvoice),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: RabbitMQService,
          useValue: rabbitMQService,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    model = module.get<Model<InvoiceDocument>>(getModelToken(Invoice.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new invoice', async () => {
      jest.spyOn(model, 'create').mockResolvedValueOnce(mockInvoice as any);

      const result = await service.create(mockCreateInvoiceDto);
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('findAll', () => {
    it('should return all invoices', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([mockInvoice]),
      } as any);

      const result = await service.findAll();
      expect(result).toEqual([mockInvoice]);
    });
  });

  describe('findOne', () => {
    it('should return a single invoice', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockInvoice),
      } as any);

      const result = await service.findOne(mockId);
      expect(result).toEqual(mockInvoice);
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
      expect(model.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when invoice not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne(mockId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateDailySalesReport', () => {
    it('should generate and publish daily report', async () => {
      const mockInvoices = [
        { ...mockInvoice, amount: 100 },
        { ...mockInvoice, amount: 200 },
      ];

      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockInvoices),
      } as any);

      const report = await service.generateDailySalesReport();

      expect(report.totalSales).toBe(300);
      expect(report.itemsSold).toHaveLength(1);
      expect(rabbitMQService.publishDailySalesReport).toHaveBeenCalled();
    });
  });
});
