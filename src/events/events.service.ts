import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Server } from 'socket.io';
import { DialogDocument } from '../dialogs/schemas/dialog.schema';
import { MessageDocument } from '../messages/schemas/message.schema';

@Injectable()
export class EventsService {
  private _server: Server | null = null;

  set server(serverInstance: Server) {
    this._server = serverInstance;
  }

  get server(): Server {
    if (!this._server) {
      throw new InternalServerErrorException(
        'Ошибка при подключении к сокет-серверу',
      );
    }
    return this._server;
  }

  emitDialogCreated(dialog: DialogDocument) {
    this.server.emit('SERVER:DIALOG_CREATED', dialog);
  }

  emitNewMessage(message: MessageDocument) {
    const finalMessage = {
      id: message._id,
      text: message.text,
      author: {
        id: message.author._id,
        name: message.author.name,
        email: message.author.email,
        isEmailActivated: message.author.isEmailActivated,
      },
      dialog: {
        id: message.dialog._id,
        initiator: {
          id: message.dialog.initiator._id,
          name: message.dialog.initiator.name,
          email: message.dialog.initiator.email,
          isEmailActivated: message.dialog.initiator.isEmailActivated,
        },
        companion: {
          id: message.dialog.companion._id,
          name: message.dialog.companion.name,
          email: message.dialog.companion.email,
          isEmailActivated: message.dialog.companion.isEmailActivated,
        },
        initiatorPublicKey: message.dialog.initiatorPublicKey,
        companionPublicKey: message.dialog.companionPublicKey,
        createdTime: message.dialog.createdTime,
        lastMessage: message.dialog.lastMessage,
        isDialogAccepted: message.dialog.isDialogAccepted,
      },
      createdTime: message.createdTime,
      isRead: message.isRead,
    };

    this.server.to(message.dialog.id).emit('SERVER:NEW_MESSAGE', finalMessage);
  }

  emitMessagesRead(dialogId: string) {
    console.log('Сообщения прочитаны', dialogId);
    this.server.to(dialogId).emit('SERVER:MESSAGES_READ');
  }
}
