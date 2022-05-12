import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { DialogsModule } from './dialogs/dialogs.module';
import { MessagesModule } from './messages/messages.module';
import { EventsModule } from './events/events.module';

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
    DialogsModule,
    MessagesModule,
    EventsModule,
  ],
})
export class AppModule {}
