import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env.PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(PORT).then(() => {
    console.log(`Server listening on PORT =`, PORT);
  });
}
bootstrap();
