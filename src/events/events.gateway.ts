import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventsService } from './events.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private eventsService: EventsService) {}

  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('DIALOGS:JOIN')
  async dialogsJoin(
    @MessageBody() dialogId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Клиент ${client.id} подсоединился к чату ${dialogId}`);
    return client.join(dialogId);
  }

  afterInit(server: Server) {
    this.eventsService.server = server;
  }

  handleConnection(client: Socket) {
    this.logger.log(`Клиент подсоединился к сокет-серверу ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Клиент отключился от сокет-сервера ${client.id}`);
  }
}
