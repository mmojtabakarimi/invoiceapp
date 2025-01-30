import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicesModule } from './modules/invoices/invoices.module';
import mongodbConfig from './config/mongodb.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongodbConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log('MongoDB URI:', configService.get<string>('mongodb.uri'));
        return {
          uri: configService.get<string>('mongodb.uri'),
        };
      },
      inject: [ConfigService],
    }),
    InvoicesModule,
  ],
})
export class AppModule {}
