import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS 配置
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    credentials: true,
  });

  // 静态文件服务 — 头像等上传资源
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  // WebSocket Adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 徐霞客系统后端已启动: http://localhost:${port}`);
  console.log(`📡 WebSocket 就绪: ws://localhost:${port}`);
  console.log(`📨 SSE 通知端点: http://localhost:${port}/api/sse/notifications`);
}
bootstrap();
