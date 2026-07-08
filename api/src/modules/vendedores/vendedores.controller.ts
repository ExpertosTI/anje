import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { VendedoresService } from './vendedores.service';

class CreateVendedorDto {
  @IsString() nombre!: string;
  @IsString() @MinLength(4) pin!: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsString() zona?: string;
}

class UpdateVendedorDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() zona?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}

@Controller('vendedores')
export class VendedoresController {
  constructor(private svc: VendedoresService) {}

  @Get()
  list() { return this.svc.findAll(); }

  @Get('activos')
  active() { return this.svc.findActive(); }

  @Post()
  create(@Body() dto: CreateVendedorDto) { return this.svc.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVendedorDto) {
    return this.svc.update(id, dto);
  }
}
