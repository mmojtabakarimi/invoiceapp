import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('InvoiceController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let httpServer: any;

  const mockInvoice = {
    customer: 'Test Customer',
    amount: 100,
    reference: 'INV-001',
    date: new Date().toISOString(),
    items: [{ sku: 'ITEM1', qt: 1 }],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    connection = moduleFixture.get(getConnectionToken());
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    await app.close();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
  });

  describe('/invoices (POST)', () => {
    it('should create an invoice', async () => {
      const response = await request(httpServer)
        .post('/invoices')
        .send(mockInvoice)
        .expect(201);

      expect(response.body).toMatchObject({
        ...mockInvoice,
        _id: expect.any(String),
      });
    });

    it('should fail if required fields are missing', async () => {
      const invalidInvoice = {
        customer: 'Test Customer',
      };

      const response = await request(httpServer)
        .post('/invoices')
        .send(invalidInvoice)
        .expect(400);

      const errorMessages = response.body.message;
      expect(errorMessages).toEqual(
        expect.arrayContaining([
          'amount should not be empty',
          'amount must be a number conforming to the specified constraints',
          'amount must not be less than 0',
          'reference should not be empty',
          'reference must be a string',
          'date should not be empty',
          'date must be a Date instance',
          'items should not be empty',
          'items must be an array',
        ]),
      );
    });
  });

  describe('/invoices (GET)', () => {
    it('should return empty array when no invoices exist', async () => {
      const response = await request(httpServer).get('/invoices').expect(200);
      expect(response.body).toEqual([]);
    });

    it('should return all invoices', async () => {
      // Create test invoice
      await request(httpServer).post('/invoices').send(mockInvoice);

      const response = await request(httpServer).get('/invoices').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(mockInvoice);
    });
  });

  describe('/invoices/:id (GET)', () => {
    it('should return invoice by id', async () => {
      // Create test invoice
      const createResponse = await request(httpServer)
        .post('/invoices')
        .send(mockInvoice);

      const invoiceId = createResponse.body._id;

      const response = await request(httpServer)
        .get(`/invoices/${invoiceId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        ...mockInvoice,
        _id: invoiceId,
      });
    });

    it('should return 400 for invalid invoice id format', async () => {
      await request(httpServer)
        .get('/invoices/invalid-id')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid invoice ID');
        });
    });

    it('should return 404 for non-existent invoice', async () => {
      await request(httpServer)
        .get('/invoices/507f1f77bcf86cd799439011')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });
  });

  describe('/invoices/:id (PUT)', () => {
    it('should update invoice', async () => {
      // Create test invoice
      const createResponse = await request(httpServer)
        .post('/invoices')
        .send(mockInvoice);

      const invoiceId = createResponse.body._id;
      const updateData = {
        amount: 200,
        customer: 'Updated Customer',
      };

      const response = await request(httpServer)
        .put(`/invoices/${invoiceId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        ...mockInvoice,
        ...updateData,
      });
    });
  });

  describe('/invoices/:id (DELETE)', () => {
    it('should delete invoice', async () => {
      // Create test invoice
      const createResponse = await request(httpServer)
        .post('/invoices')
        .send(mockInvoice);

      const invoiceId = createResponse.body._id;

      // Delete invoice
      await request(httpServer).delete(`/invoices/${invoiceId}`).expect(200);

      // Verify invoice is deleted
      await request(httpServer).get(`/invoices/${invoiceId}`).expect(404);
    });

    it('should return 400 for invalid invoice id format', async () => {
      await request(httpServer)
        .delete('/invoices/invalid-id')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid invoice ID');
        });
    });

    it('should return 404 for non-existent invoice', async () => {
      await request(httpServer)
        .delete('/invoices/507f1f77bcf86cd799439011')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });
  });
});
