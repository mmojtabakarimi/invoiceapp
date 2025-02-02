import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EmailModule } from "./email/email.module";
import rabbitmqConfig from "./config/rabbitmq.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [rabbitmqConfig],
    }),
    EmailModule,
  ],
})
export class AppModule {}
