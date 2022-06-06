import { forwardRef, Module } from '@nestjs/common';
import { DialogsService } from './dialogs.service';
import { DialogsController } from './dialogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Dialog, DialogSchema } from './schemas/dialog.schema';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { Message, MessageSchema } from '../messages/schemas/message.schema';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Dialog.name,
        schema: DialogSchema,
      },
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
    forwardRef(() => MessagesModule),
    UsersModule,
    EventsModule,
  ],
  providers: [DialogsService],
  controllers: [DialogsController],
  exports: [DialogsService],
})
export class DialogsModule {}
