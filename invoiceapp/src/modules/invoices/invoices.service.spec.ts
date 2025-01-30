import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoiceService } from './invoices.service';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { NotFoundException } from '@nestjs/common';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let model: Model<InvoiceDocument>;

  const mockInvoice = {
    _id: 'some-id',
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
      
      const result = await service.findOne('some-id');
      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);
      
      await expect(service.findOne('wrong-id')).rejects.toThrow(NotFoundException);
    });
  });
}); 