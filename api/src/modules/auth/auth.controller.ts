import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Repository } from 'typeorm';
import { Vendedor } from '../../entities/vendedor.entity';

class AdminLoginDto {
  @IsString() @IsNotEmpty() pin!: string;
}

class SellerLoginDto {
  @IsString() @IsNotEmpty() vendedorId!: string;
  @IsString() @IsNotEmpty() pin!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private cfg: ConfigService,
    @InjectRepository(Vendedor) private vendedores: Repository<Vendedor>,
  ) {}

  @Post('admin')
  adminLogin(@Body() dto: AdminLoginDto) {
    const pin = this.cfg.get('ADMIN_PIN', 'ANJE2026');
    if (dto.pin !== pin) throw new UnauthorizedException('Clave incorrecta');
    return { ok: true, role: 'admin' };
  }

  @Post('seller')
  async sellerLogin(@Body() dto: SellerLoginDto) {
    const v = await this.vendedores.findOne({
      where: { id: dto.vendedorId, pin: dto.pin, activo: true },
    });
    if (!v) throw new UnauthorizedException('Clave incorrecta');
    const { pin: _, ...safe } = v;
    return { ok: true, role: 'seller', vendedor: safe };
  }
}
