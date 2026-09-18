import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar peticiones desde el frontend
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend NestJS escuchando en http://localhost:3000`);
}
bootstrap();