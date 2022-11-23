import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app.module';

const API_PORT = process.env.API_PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Sisfila2 API')
      .setDescription('Sisfila2 API description')
      .build(),
  );
  SwaggerModule.setup('docs', app, document, {});

  await app.listen(API_PORT, () => {
    console.log(`API running on port ${API_PORT} ✨`);
  });
}
bootstrap();
