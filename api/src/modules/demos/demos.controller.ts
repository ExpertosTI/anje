import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { DemosService } from './demos.service';

class CreateDemoDto {
  @IsString() vendedorId!: string;
  @IsString() fecha!: string;
  @IsString() lugar!: string;
  @IsOptional() @IsString() hora?: string;
  @IsOptional() @IsString() leadId?: string;
  @IsOptional() @IsString() producto?: string;
  @IsOptional() @IsString() direccion?: string;
  @IsOptional() @IsString() notas?: string;
}

class UpdateDemoDto {
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsNumber() montoVenta?: number;
}

@Controller('demos')
export class DemosController {
  constructor(private svc: DemosService) {}

  @Get()
  list(@Query('vendedorId') vendedorId?: string) {
    if (vendedorId) return this.svc.findByVendedor(vendedorId);
    return this.svc.findAll();
  }

  @Post()
  create(@Body() dto: CreateDemoDto) { return this.svc.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDemoDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
