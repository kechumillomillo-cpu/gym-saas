import { NestFactory, Reflector } from '@nestjs/core'
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1')

  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'https://gym-saas-one.vercel.app',
    'https://gym-saas-jesus-peralta.vercel.app',
    'https://gym-saas-kechumillomillo-cpu-jesus-peralta.vercel.app',
  ]

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true)
      } else {
        callback(null, false)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  const config = new DocumentBuilder()
    .setTitle('GymSaaS API')
    .setDescription('REST API para plataforma SaaS de gimnasios')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const doc = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, doc)

  const port = process.env.API_PORT || 4000
  await app.listen(port)
  console.log(`🚀 API running on http://localhost:${port}/api/v1`)
  console.log(`📚 Swagger: http://localhost:${port}/api/docs`)
}
bootstrap()
