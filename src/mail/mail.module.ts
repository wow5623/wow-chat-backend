import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  controllers: [MailController],
  providers: [MailService],
  imports: [
    MailerModule.forRoot({
      transport:
        'smtps://wowchatmailer@mail.ru:FGW2KZ3cbkCKaHKH5sHD@smtp.mail.ru',
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
    }),
  ],
  exports: [MailService],
})
export class MailModule {}
