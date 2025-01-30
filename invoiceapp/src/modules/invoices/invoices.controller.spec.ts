import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoiceService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let service: InvoiceService;

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
      controllers: [InvoicesController],
      providers: [
        {
          provide: InvoiceService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockInvoice),
            findAll: jest.fn().mockResolvedValue([mockInvoice]),
            findOne: jest.fn().mockResolvedValue(mockInvoice),
            update: jest.fn().mockResolvedValue(mockInvoice),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<InvoicesController>(InvoicesController);
    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new invoice', async () => {
      const result = await controller.create(mockCreateInvoiceDto);
      expect(result).toEqual(mockInvoice);
      expect(service.create).toHaveBeenCalledWith(mockCreateInvoiceDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of invoices', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockInvoice]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single invoice', async () => {
      const result = await controller.findOne('some-id');
      expect(result).toEqual(mockInvoice);
      expect(service.findOne).toHaveBeenCalledWith('some-id');
    });
  });
}); 