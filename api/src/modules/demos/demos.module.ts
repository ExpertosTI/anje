import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Demo } from '../../entities/demo.entity';
import { DemosController } from './demos.controller';
import { DemosService } from './demos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Demo])],
  controllers: [DemosController],
  providers: [DemosService],
})
export class DemosModule {}
