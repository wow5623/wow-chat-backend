import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { Dialog, DialogDocument } from '../dialogs/schemas/dialog.schema';
import { DialogsService } from '../dialogs/dialogs.service';
import { EventsService } from '../events/events.service';
import { MarkMessagesAsReadDto } from './dto/mark-message-as-read.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messagesRepository: Model<MessageDocument>,
    @InjectModel(Dialog.name)
    private readonly dialogsRepository: Model<DialogDocument>,
    private readonly dialogsService: DialogsService,
    private readonly eventsService: EventsService,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto, user: UserDocument) {
    const createdTime = new Date();

    const dialog: DialogDocument = await this.dialogsService.findDialog(
      createMessageDto.dialogId,
    );

    if (!dialog) {
      throw new BadRequestException('Диалог не найден!');
    }

    try {
      const message = await this.messagesRepository.create({
        author: user._id,
        text: createMessageDto.text,
        dialog: dialog._id,
        createdTime,
      });

      await message.populate(['author', 'dialog']);

      await this.dialogsRepository.findByIdAndUpdate(
        createMessageDto.dialogId,
        { lastMessage: message },
        { upsert: true },
      );

      await message.save();

      this.eventsService.emitNewMessage(message);

      return {
        id: message._id,
        text: message.text,
        author: {
          id: message.author._id,
          name: message.author.name,
          email: message.author.email,
          isEmailActivated: message.author.isEmailActivated,
        },
        dialog: {
          id: dialog._id,
          initiator: {
            id: dialog.initiator._id,
            name: dialog.initiator.name,
            email: dialog.initiator.email,
            isEmailActivated: dialog.initiator.isEmailActivated,
          },
          companion: {
            id: dialog.companion._id,
            name: dialog.companion.name,
            email: dialog.companion.email,
            isEmailActivated: dialog.companion.isEmailActivated,
          },
          initiatorPublicKey: dialog.initiatorPublicKey,
          companionPublicKey: dialog.companionPublicKey,
          createdTime: dialog.createdTime,
          lastMessage: dialog.lastMessage,
          isDialogAccepted: dialog.isDialogAccepted,
        },
        createdTime: message.createdTime,
        isRead: message.isRead,
      };
    } catch (err) {
      throw new InternalServerErrorException('Не удалось отправить сообщение!');
    }
  }

  async getAllMessagesByDialog(dialogId: string) {
    const dialog = await this.dialogsService.findDialog(dialogId);

    if (!dialog) {
      throw new BadRequestException('Такого диалога не существует!');
    }

    const messages = await this.messagesRepository
      .find({ dialog: dialog._id })
      .populate(['author', 'dialog']);

    return messages.map((message) => {
      return {
        id: message._id,
        text: message.text,
        author: {
          id: message.author._id,
          name: message.author.name,
          email: message.author.email,
          isEmailActivated: message.author.isEmailActivated,
        },
        dialog: {
          id: dialog._id,
          initiator: {
            id: dialog.initiator._id,
            name: dialog.initiator.name,
            email: dialog.initiator.email,
            isEmailActivated: dialog.initiator.isEmailActivated,
          },
          companion: {
            id: dialog.companion._id,
            name: dialog.companion.name,
            email: dialog.companion.email,
            isEmailActivated: dialog.companion.isEmailActivated,
          },
          initiatorPublicKey: dialog.initiatorPublicKey,
          companionPublicKey: dialog.companionPublicKey,
          createdTime: dialog.createdTime,
          lastMessage: dialog.lastMessage,
          isDialogAccepted: dialog.isDialogAccepted,
        },
        createdTime: message.createdTime,
        isRead: message.isRead,
      };
    });
  }

  async markMessagesAsRead(markMessagesAsReadDto: MarkMessagesAsReadDto) {
    const { messagesIds, dialogId } = markMessagesAsReadDto;

    try {
      await this.messagesRepository
        .find()
        .where('_id')
        .in(messagesIds)
        .updateMany({}, { $set: { isRead: true } })
        .exec();

      this.eventsService.emitMessagesRead(dialogId);

      return {
        result: 'Сообщения обновлены',
      };
    } catch (err) {
      throw new InternalServerErrorException(
        err,
        'Ошибка при обновлении сообщений',
      );
    }
  }
}
