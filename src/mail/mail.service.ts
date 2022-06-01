import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMessage(sendMessageDto: SendMessageDto) {
    return await this.mailerService.sendMail({
      to: sendMessageDto.to,
      from: 'wowchatbot@mail.ru',
      subject: sendMessageDto.subject,
      text: sendMessageDto.text,
    });
  }
}
