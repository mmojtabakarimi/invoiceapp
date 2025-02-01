import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { EmailConsumer } from "./email.consumer";
import { EmailService } from "./email.service";
import { Channel, Connection, ConsumeMessage, connect } from "amqplib";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

describe("EmailConsumer", () => {
  let consumer: EmailConsumer;
  let emailService: EmailService;
  let channel: Partial<Channel>;
  let connection: Partial<Connection>;

  const mockReport = {
    date: "2024-01-30",
    totalSales: 1000.5,
    itemsSummary: [
      { sku: "ITEM-123", totalQuantity: 5 },
      { sku: "ITEM-456", totalQuantity: 3 },
    ],
  };

  beforeEach(async () => {
    channel = {
      assertQueue: jest.fn().mockResolvedValue({}),
      consume: jest.fn(),
      ack: jest.fn(),
      nack: jest.fn(),
    };

    connection = {
      createChannel: jest.fn().mockResolvedValue(channel),
    };

    (connect as jest.Mock).mockResolvedValue(connection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailConsumer,
        {
          provide: EmailService,
          useValue: {
            sendDailySalesReport: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                "rabbitmq.url": "amqp://localhost",
                "rabbitmq.queue.dailySalesReport": "daily_sales_report",
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    consumer = module.get<EmailConsumer>(EmailConsumer);
    emailService = module.get<EmailService>(EmailService);
  });

  it("should be defined", () => {
    expect(consumer).toBeDefined();
  });

  describe("onModuleInit", () => {
    it("should connect to RabbitMQ and setup channel", async () => {
      await consumer.onModuleInit();

      expect(connect).toHaveBeenCalledWith("amqp://localhost");
      expect(connection.createChannel).toHaveBeenCalled();
      expect(channel.assertQueue).toHaveBeenCalledWith("daily_sales_report", {
        durable: true,
      });
    });

    it("should setup message consumer", async () => {
      await consumer.onModuleInit();

      expect(channel.consume).toHaveBeenCalled();
      const consumeCallback = (channel.consume as jest.Mock).mock.calls[0][1];

      // Test successful message processing
      const message = {
        content: Buffer.from(JSON.stringify(mockReport)),
      } as ConsumeMessage;

      await consumeCallback(message);

      expect(emailService.sendDailySalesReport).toHaveBeenCalledWith(
        mockReport,
      );
      expect(channel.ack).toHaveBeenCalledWith(message);
    });

    it("should handle invalid message content", async () => {
      await consumer.onModuleInit();

      const consumeCallback = (channel.consume as jest.Mock).mock.calls[0][1];

      const invalidMessage = {
        content: Buffer.from("invalid json"),
      } as ConsumeMessage;

      await consumeCallback(invalidMessage);

      expect(emailService.sendDailySalesReport).not.toHaveBeenCalled();
      expect(channel.nack).toHaveBeenCalledWith(invalidMessage, false, true);
    });
  });
});
