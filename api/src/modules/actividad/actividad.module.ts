import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadSemanal } from '../../entities/actividad.entity';
import { ActividadController } from './actividad.controller';
import { ActividadService } from './actividad.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActividadSemanal])],
  controllers: [ActividadController],
  providers: [ActividadService],
})
export class ActividadModule {}
