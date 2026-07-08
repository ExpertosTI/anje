import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ActividadService } from './actividad.service';

class UpsertActividadDto {
  @IsString() vendedorId!: string;
  @IsString() semanaInicio!: string;
  @IsOptional() @IsNumber() prospectos?: number;
  @IsOptional() @IsNumber() llamadas?: number;
  @IsOptional() @IsNumber() demostraciones?: number;
  @IsOptional() @IsNumber() montoVentas?: number;
  @IsOptional() @IsNumber() referidos?: number;
  @IsOptional() @IsNumber() prospeccion?: number;
  @IsOptional() @IsNumber() toquePuertas?: number;
  @IsOptional() @IsString() notas?: string;
}

@Controller('actividad')
export class ActividadController {
  constructor(private svc: ActividadService) {}

  @Get()
  list(@Query('semana') semana?: string) {
    if (semana) return this.svc.findBySemana(semana);
    return this.svc.findAll();
  }

  @Get('dashboard')
  dashboard(@Query('semana') semana?: string) {
    return this.svc.dashboard(semana);
  }

  @Post()
  upsert(@Body() dto: UpsertActividadDto) { return this.svc.upsert(dto); }
}
