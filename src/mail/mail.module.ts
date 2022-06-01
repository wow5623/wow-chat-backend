import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  controllers: [MailController],
  providers: [MailService],
  imports: [
    MailerModule.forRoot({
      transport: 'smtps://wowchatbot@mail.ru:VhWYffegqtYVkqYSpfG4@smtp.mail.ru',
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
    }),
  ],
  exports: [MailService],
})
export class MailModule {}
