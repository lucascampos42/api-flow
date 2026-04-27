import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    }),
  );

  app.enableCors({
    origin: true, // Em desenvolvimento permite tudo, em prod restringir
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Flow API')
    .setDescription(
      'API centralizadora para autenticação e gestão do ecossistema Flow',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  );

  const port = process.env.PORT || 4242;
  await app.listen(port);

  console.log('');
  console.log('🚀 Flow API iniciada com sucesso!');
  console.log('');
  console.log(`📡 Servidor rodando em: http://localhost:${port}/api`);
  console.log(`📚 Documentação (Scalar): http://localhost:${port}/docs`);
  console.log('');
}
bootstrap();
