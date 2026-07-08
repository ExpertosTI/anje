import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendedor } from '../../entities/vendedor.entity';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vendedor])],
  controllers: [AuthController],
})
export class AuthModule {}
