import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { LeadsService } from './leads.service';

class CreateLeadDto {
  @IsString() nombre!: string;
  @IsString() telefono!: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsString() producto?: string;
  @IsOptional() @IsString() ciudad?: string;
  @IsOptional() @IsString() comentarios?: string;
  @IsOptional() @IsString() origen?: string;
  @IsOptional() @IsString() vendedorId?: string;
}

class UpdateLeadDto {
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsString() vendedorId?: string;
}

@Controller('leads')
export class LeadsController {
  constructor(private svc: LeadsService) {}

  @Get()
  list(@Query('vendedorId') vendedorId?: string) {
    if (vendedorId) return this.svc.findByVendedor(vendedorId);
    return this.svc.findAll();
  }

  @Post()
  create(@Body() dto: CreateLeadDto) { return this.svc.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
