import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailController } from './mail/mail.controller';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      envFilePath: `.env`,
    }),
    MongooseModule.forRoot(
      'mongodb+srv://wow5623:grebaniyMTUCI2022@wowclaster.vqqvk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    ),
    AuthModule,
    MailModule,
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class AppModule {}
