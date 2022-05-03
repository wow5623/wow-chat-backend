import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('sendMessage')
  sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return this.mailService.sendMessage(sendMessageDto);
  }
}
