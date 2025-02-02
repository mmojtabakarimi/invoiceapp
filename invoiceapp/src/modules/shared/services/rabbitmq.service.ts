import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel, Connection } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private channel: Channel;
  private connection: Connection;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      this.connection = await connect(
        this.configService.get<string>('rabbitmq.url'),
      );
      this.channel = await this.connection.createChannel();

      // Ensure queue exists
      await this.channel.assertQueue(
        this.configService.get<string>('rabbitmq.queue.dailySalesReport'),
        {
          durable: true,
        },
      );
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
    }
  }

  async publishDailySalesReport(report: any) {
    try {
      const queue = this.configService.get<string>(
        'rabbitmq.queue.dailySalesReport',
      );
      await this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(report)),
        { persistent: true },
      );
      console.log('Daily sales report published to RabbitMQ');
    } catch (error) {
      console.error('Failed to publish daily sales report:', error);
      throw error;
    }
  }
}
