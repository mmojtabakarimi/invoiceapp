import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel, Connection } from 'amqplib';
import { EmailService } from './email.service';

@Injectable()
export class EmailConsumer implements OnModuleInit {
  private channel: Channel;
  private connection: Connection;

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      this.connection = await connect(this.configService.get<string>('rabbitmq.url'));
      this.channel = await this.connection.createChannel();
      
      const queue = this.configService.get<string>('rabbitmq.queue.dailySalesReport');
      await this.channel.assertQueue(queue, { durable: true });
      
      // Start consuming messages
      this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const report = JSON.parse(msg.content.toString());
            await this.emailService.sendDailySalesReport(report);
            this.channel.ack(msg);
          } catch (error) {
            console.error('Error processing message:', error);
            // Reject the message and requeue it
            this.channel.nack(msg, false, true);
          }
        }
      });

      console.log('Connected to RabbitMQ and waiting for messages...');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // Retry connection after delay
      setTimeout(() => this.connect(), 5000);
    }
  }
} 