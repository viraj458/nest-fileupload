import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UploadModule, ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
})
export class AppModule {}
