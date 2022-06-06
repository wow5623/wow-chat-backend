import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarkMessagesAsReadDto } from './dto/mark-message-as-read.dto';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('createMessage')
  createMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.messagesService.createMessage(createMessageDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getAllMessagesByDialog/:dialogId')
  getAllMessagesByDialog(@Param('dialogId') dialogId: string) {
    return this.messagesService.getAllMessagesByDialog(dialogId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('markMessagesAsRead')
  markMessagesAsRead(@Body() markMessagesAsReadDto: MarkMessagesAsReadDto) {
    return this.messagesService.markMessagesAsRead(markMessagesAsReadDto);
  }
}
