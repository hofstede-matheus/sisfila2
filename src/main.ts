import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(3000);
}
bootstrap();
