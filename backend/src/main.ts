import { NestFactory } from '@nestjs/core';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const fields = errors.reduce<Record<string, string>>((acc, error) => {
          if (error.constraints) {
            acc[error.property] = Object.values(error.constraints)[0];
          }
          return acc;
        }, {});

        return new UnprocessableEntityException({
          success: false,
          data: null,
          error: 'Validation failed',
          fields,
        });
      },
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
}

bootstrap();
